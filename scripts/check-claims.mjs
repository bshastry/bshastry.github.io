import { readFile, stat } from 'node:fs/promises'
import { URL, fileURLToPath } from 'node:url'
import path from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import ts from 'typescript'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const claimsPath = path.join(root, 'public', '.well-known', 'claims.json')
const schemaPath = path.join(root, 'public', '.well-known', 'claims.schema.json')
const llmsPath = path.join(root, 'public', 'llms.txt')
const disclosuresPath = path.join(root, 'lib', 'disclosures.ts')
const outPath = path.join(root, 'out')
const checkBuiltLinks = process.argv.includes('--check-links')

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function assertExactKeys(value, expected, label) {
  const actual = Object.keys(value).sort()
  const wanted = [...expected].sort()
  assert(
    JSON.stringify(actual) === JSON.stringify(wanted),
    `${label} has unexpected keys: ${actual.join(', ')}`,
  )
}

function assertHttps(value, label) {
  const url = new URL(value)
  assert(url.protocol === 'https:', `${label} must use https`)
}

function assertDate(value, label, dateOnly = false) {
  const pattern = dateOnly ? /^\d{4}-\d{2}-\d{2}$/ : /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
  assert(pattern.test(value), `${label} is not a supported ISO date`)
  assert(!Number.isNaN(Date.parse(value)), `${label} is not a valid date`)
}

function statementIncludesCount(statement, count) {
  const smallNumberWords = [
    'zero',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
    'twenty',
  ]
  const tokens = [String(count)]
  if (smallNumberWords[count]) tokens.push(smallNumberWords[count])
  const normalized = statement.toLowerCase()
  return tokens.some((token) => new RegExp(`\\b${token}\\b`).test(normalized))
}

async function loadDisclosureFacts() {
  const source = await readFile(disclosuresPath, 'utf8')
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: disclosuresPath,
  }).outputText
  const dataUrl = `data:text/javascript;base64,${Buffer.from(transpiled).toString('base64')}`
  return import(dataUrl)
}

async function existingOutputPath(url) {
  let pathname
  try {
    pathname = decodeURIComponent(url.pathname)
  } catch {
    throw new Error(`Malformed percent-encoding in ${url.href}`)
  }

  const relativePath = pathname.replace(/^\/+/, '')
  const directPath = path.resolve(outPath, relativePath)
  assert(
    directPath === outPath || directPath.startsWith(`${outPath}${path.sep}`),
    `${url.href} resolves outside out/`,
  )
  const candidates = pathname.endsWith('/')
    ? [path.join(directPath, 'index.html')]
    : [directPath, `${directPath}.html`, path.join(directPath, 'index.html')]

  for (const candidate of candidates) {
    try {
      const metadata = await stat(candidate)
      if (metadata.isFile()) return candidate
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
  return null
}

function collectHttpsUrls(value, label, collected) {
  if (typeof value === 'string') {
    if (!value.startsWith('https://')) return
    collected.push({ label, url: new URL(value) })
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectHttpsUrls(item, `${label}[${index}]`, collected))
    return
  }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      collectHttpsUrls(item, `${label}.${key}`, collected)
    }
  }
}

async function checkSameOriginLinks(claims, llmsRaw) {
  const siteOrigin = new URL(claims.id).origin
  const collected = []
  collectHttpsUrls(claims, 'claims', collected)

  for (const [index, match] of [
    ...llmsRaw.matchAll(/\[[^\]]+\]\((https:\/\/[^)\s]+)\)/g),
  ].entries()) {
    collected.push({ label: `llms.txt link ${index + 1}`, url: new URL(match[1]) })
  }

  const unique = new Map()
  for (const reference of collected) {
    if (reference.url.origin !== siteOrigin) continue
    unique.set(reference.url.href, reference)
  }

  const failures = []
  let checked = 0
  let deployGenerated = 0

  for (const { label, url } of unique.values()) {
    const outputFile = await existingOutputPath(url)
    if (!outputFile && url.href === claims.signature.bundle) {
      deployGenerated += 1
      continue
    }
    checked += 1
    if (!outputFile) {
      failures.push(`${label}: ${url.href} does not resolve in out/`)
      continue
    }

    if (!url.hash || !outputFile.endsWith('.html')) continue
    let fragment
    try {
      fragment = decodeURIComponent(url.hash.slice(1))
    } catch {
      failures.push(`${label}: ${url.href} has malformed fragment encoding`)
      continue
    }
    const html = await readFile(outputFile, 'utf8')
    const ids = new Set(
      [...html.matchAll(/\sid=(?:"([^"]+)"|'([^']+)')/g)].map((match) => match[1] ?? match[2]),
    )
    if (!ids.has(fragment)) {
      failures.push(
        `${label}: ${url.href} has no matching id in ${path.relative(root, outputFile)}`,
      )
    }
  }

  assert(
    failures.length === 0,
    `same-origin claim link validation failed:\n${failures.map((failure) => `  - ${failure}`).join('\n')}`,
  )
  console.log(
    `Validated ${checked} same-origin claim/llms links and anchors` +
      (deployGenerated > 0 ? `; deferred ${deployGenerated} deploy-generated bundle.` : '.'),
  )
}

const [claimsRaw, schemaRaw, llmsRaw, disclosureFacts] = await Promise.all([
  readFile(claimsPath, 'utf8'),
  readFile(schemaPath, 'utf8'),
  readFile(llmsPath, 'utf8'),
  loadDisclosureFacts(),
])
const claims = JSON.parse(claimsRaw)
const schema = JSON.parse(schemaRaw)

const ajv = new Ajv2020({ allErrors: true, strict: true })
addFormats(ajv)
const validateSchema = ajv.compile(schema)
assert(
  validateSchema(claims),
  `claims.json does not satisfy claims.schema.json:\n${ajv.errorsText(validateSchema.errors, {
    separator: '\n',
  })}`,
)

assert(claimsRaw.endsWith('\n'), 'claims.json must end with a newline')
assert(schemaRaw.endsWith('\n'), 'claims.schema.json must end with a newline')

assertExactKeys(
  claims,
  [
    '$schema',
    'id',
    'version',
    'issuedAt',
    'validUntil',
    'purpose',
    'issuer',
    'subject',
    'profiles',
    'claims',
    'signature',
    'disclaimer',
  ],
  'claims document',
)
assert(claims.$schema === schema.$id, 'claims.$schema must match schema.$id')
assert(claims.id === claims.signature.artifact, 'signature artifact must match claims.id')
assert(/^[1-9]\d*\.\d+\.\d+$/.test(claims.version), 'version must be semantic')
assertDate(claims.issuedAt, 'issuedAt')
assertDate(claims.validUntil, 'validUntil')
assert(
  Date.parse(claims.validUntil) > Date.parse(claims.issuedAt),
  'validUntil must be later than issuedAt',
)
assert(Date.parse(claims.validUntil) > Date.now(), 'claims document has expired')
assert(Array.isArray(claims.purpose) && claims.purpose.length > 0, 'purpose is required')
assert(new Set(claims.purpose).size === claims.purpose.length, 'purpose values must be unique')

for (const [label, entity] of [
  ['issuer', claims.issuer],
  ['subject', claims.subject],
]) {
  assertExactKeys(entity, ['id', 'type', 'name'], label)
  assertHttps(entity.id, `${label}.id`)
  assert(entity.type === 'Person', `${label}.type must be Person`)
  assert(entity.name.length > 0, `${label}.name is required`)
}
assert(claims.issuer.id === claims.subject.id, 'issuer and subject must identify the same person')

assert(Array.isArray(claims.profiles) && claims.profiles.length > 0, 'profiles are required')
for (const [index, profile] of claims.profiles.entries()) {
  assertExactKeys(profile, ['service', 'url'], `profiles[${index}]`)
  assert(profile.service.length > 0, `profiles[${index}].service is required`)
  assertHttps(profile.url, `profiles[${index}].url`)
}

assert(Array.isArray(claims.claims) && claims.claims.length > 0, 'claims are required')
const claimIds = new Set()
for (const [index, claim] of claims.claims.entries()) {
  const label = `claims[${index}]`
  assertExactKeys(
    claim,
    ['id', 'type', 'statement', 'predicate', 'object', 'status', 'evidence', 'assurance'],
    label,
  )
  assertHttps(claim.id, `${label}.id`)
  assert(claim.id.startsWith(`${claims.id}#`), `${label}.id must be anchored to claims.id`)
  assert(!claimIds.has(claim.id), `${label}.id is duplicated`)
  claimIds.add(claim.id)
  assert(claim.statement.length > 0, `${label}.statement is required`)
  assertHttps(claim.predicate, `${label}.predicate`)
  assert(
    [
      'IdentityClaim',
      'ProfessionalClaim',
      'ExpertiseClaim',
      'TrackRecordClaim',
      'ServiceClaim',
      'ContactClaim',
    ].includes(claim.type),
    `${label}.type is unsupported`,
  )
  const objectKeys = Object.keys(claim.object)
  assert(
    objectKeys.every((key) => ['type', 'value', 'unit', 'qualifier'].includes(key)),
    `${label}.object has unexpected keys`,
  )
  assert(
    ['Text', 'Number', 'Boolean', 'TextList', 'StructuredValue'].includes(claim.object.type),
    `${label}.object.type is unsupported`,
  )
  assert(Object.hasOwn(claim.object, 'value'), `${label}.object.value is required`)
  const valueIsValid = {
    Text: () => typeof claim.object.value === 'string' && claim.object.value.length > 0,
    Number: () => typeof claim.object.value === 'number' && Number.isFinite(claim.object.value),
    Boolean: () => typeof claim.object.value === 'boolean',
    TextList: () =>
      Array.isArray(claim.object.value) &&
      claim.object.value.length > 0 &&
      claim.object.value.every((value) => typeof value === 'string' && value.length > 0) &&
      new Set(claim.object.value).size === claim.object.value.length,
    StructuredValue: () =>
      claim.object.value !== null &&
      typeof claim.object.value === 'object' &&
      !Array.isArray(claim.object.value),
  }
  assert(valueIsValid[claim.object.type](), `${label}.object.value does not match its type`)
  assert(
    ['active', 'historical', 'conditional'].includes(claim.status),
    `${label}.status is unsupported`,
  )
  assert(Array.isArray(claim.evidence) && claim.evidence.length > 0, `${label} needs evidence`)

  const evidenceUrls = new Set()
  for (const [evidenceIndex, evidence] of claim.evidence.entries()) {
    const evidenceLabel = `${label}.evidence[${evidenceIndex}]`
    assertExactKeys(evidence, ['url', 'title', 'sourceType'], evidenceLabel)
    assertHttps(evidence.url, `${evidenceLabel}.url`)
    assert(evidence.title.length > 0, `${evidenceLabel}.title is required`)
    assert(
      ['issuer', 'primary', 'independent', 'registry'].includes(evidence.sourceType),
      `${evidenceLabel}.sourceType is unsupported`,
    )
    assert(!evidenceUrls.has(evidence.url), `${evidenceLabel}.url is duplicated`)
    evidenceUrls.add(evidence.url)
  }

  assert(
    ['self-asserted', 'evidence-linked'].includes(claim.assurance.level),
    `${label}.assurance.level is unsupported`,
  )
  assert(
    Array.isArray(claim.assurance.basis) && claim.assurance.basis.length > 0,
    `${label}.assurance.basis is required`,
  )
  assert(
    claim.assurance.basis.every((basis) =>
      [
        'first-party-assertion',
        'primary-source',
        'independent-source',
        'derived-from-public-ledger',
      ].includes(basis),
    ),
    `${label}.assurance.basis contains an unsupported value`,
  )
  assert(
    new Set(claim.assurance.basis).size === claim.assurance.basis.length,
    `${label}.assurance.basis values must be unique`,
  )
  assertDate(claim.assurance.reviewedAt, `${label}.assurance.reviewedAt`, true)
  assert(
    Date.parse(claim.assurance.reviewedAt) <= Date.parse(claim.issuedAt ?? claims.issuedAt),
    `${label}.assurance.reviewedAt cannot be later than issuedAt`,
  )
}

assertExactKeys(
  claims.signature,
  [
    'format',
    'artifact',
    'bundle',
    'certificateIdentity',
    'certificateOidcIssuer',
    'verificationCommand',
  ],
  'signature',
)
assert(claims.signature.format === 'sigstore-bundle', 'signature format must be sigstore-bundle')
for (const field of ['artifact', 'bundle', 'certificateIdentity', 'certificateOidcIssuer']) {
  assertHttps(claims.signature[field], `signature.${field}`)
}
assert(
  claims.signature.certificateOidcIssuer === 'https://token.actions.githubusercontent.com',
  'signature issuer must be GitHub Actions',
)
assert(
  claims.signature.certificateIdentity.endsWith('/.github/workflows/deploy.yml@refs/heads/master'),
  'signature identity must be the master deploy workflow',
)
for (const value of [
  'cosign verify-blob',
  '--bundle claims.sigstore.json',
  `--certificate-identity ${claims.signature.certificateIdentity}`,
  `--certificate-oidc-issuer ${claims.signature.certificateOidcIssuer}`,
  'claims.json',
]) {
  assert(
    claims.signature.verificationCommand.includes(value),
    `verificationCommand is missing ${value}`,
  )
}

assert(
  Array.isArray(claims.disclaimer) && claims.disclaimer.length > 0,
  'at least one trust-boundary disclaimer is required',
)

const claimByFragment = new Map(
  claims.claims.map((claim) => [new URL(claim.id).hash.slice(1), claim]),
)
const cveClaim = claimByFragment.get('published-cves')
assert(cveClaim, 'published-cves claim is required')
assert(
  cveClaim.object.value === disclosureFacts.disclosureSummary.cves,
  `published-cves value must match lib/disclosures.ts (${disclosureFacts.disclosureSummary.cves})`,
)
assert(
  statementIncludesCount(cveClaim.statement, disclosureFacts.disclosureSummary.cves),
  'published-cves statement must include the derived CVE count',
)

const solSmithClaim = claimByFragment.get('solidity-miscompilations')
assert(solSmithClaim, 'solidity-miscompilations claim is required')
assert(
  solSmithClaim.object.value.patchedMiscompilationBugs ===
    disclosureFacts.solSmithPatchedMiscompilations,
  'SolSmith patched-miscompilation count must match lib/disclosures.ts',
)
assert(
  solSmithClaim.object.value.officialSecurityLedgerEntries ===
    disclosureFacts.soliditySecuritySummary.total,
  'Solidity security-ledger count must match lib/disclosures.ts',
)
for (const count of [
  disclosureFacts.solSmithPatchedMiscompilations,
  disclosureFacts.soliditySecuritySummary.total,
]) {
  assert(
    statementIncludesCount(solSmithClaim.statement, count),
    `solidity-miscompilations statement must include the derived count ${count}`,
  )
}

console.log(
  `Validated ${claims.claims.length} claims and ${claims.profiles.length} profiles against schema and source facts.`,
)

if (checkBuiltLinks) {
  await checkSameOriginLinks(claims, llmsRaw)
}
