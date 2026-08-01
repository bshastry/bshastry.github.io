import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const publicRoot = path.join(root, 'public')
const publicSourceRoots = ['app', 'components', 'data', 'docs', 'lib', 'public']
const textExtensions = new Set([
  '.asc',
  '.css',
  '.html',
  '.js',
  '.json',
  '.jsx',
  '.md',
  '.mjs',
  '.ts',
  '.tsx',
  '.txt',
  '.xml',
  '.yaml',
  '.yml',
])

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function normalizeFingerprint(value) {
  return value.replaceAll(' ', '').toUpperCase()
}

function crc24(bytes) {
  let crc = 0xb704ce
  for (const byte of bytes) {
    crc ^= byte << 16
    for (let bit = 0; bit < 8; bit += 1) {
      crc <<= 1
      if (crc & 0x1000000) crc ^= 0x1864cfb
    }
  }
  return crc & 0xffffff
}

function decodePublicKeyArmor(armor) {
  const lines = armor.trim().split(/\r?\n/)
  assert(lines[0] === '-----BEGIN PGP PUBLIC KEY BLOCK-----', 'public key armor is missing')
  assert(lines.at(-1) === '-----END PGP PUBLIC KEY BLOCK-----', 'public key armor is truncated')
  assert(!/PGP (?:PRIVATE|SECRET) KEY/i.test(armor), 'private key material must never be published')

  const checksumIndex = lines.findIndex((line) => line.startsWith('='))
  assert(checksumIndex > 1, 'public key armor checksum is missing')
  assert(checksumIndex === lines.length - 2, 'public key armor has trailing content')
  const payload = lines.slice(1, checksumIndex).filter(Boolean).join('')
  assert(/^[A-Za-z0-9+/]+={0,2}$/.test(payload), 'public key armor payload is malformed')

  const bytes = Buffer.from(payload, 'base64')
  assert(/^=[A-Za-z0-9+/]{4}$/.test(lines[checksumIndex]), 'public key armor checksum is malformed')
  const checksum = Buffer.from(lines[checksumIndex].slice(1), 'base64')
  assert(checksum.length === 3, 'public key armor checksum is malformed')
  assert(crc24(bytes) === checksum.readUIntBE(0, 3), 'public key armor checksum does not match')
  return bytes
}

function readPacket(bytes, offset) {
  const tagByte = bytes[offset]
  assert((tagByte & 0xc0) === 0xc0, `unsupported OpenPGP packet header at byte ${offset}`)

  const tag = tagByte & 0x3f
  const firstLength = bytes[offset + 1]
  let headerLength
  let bodyLength

  if (firstLength < 192) {
    headerLength = 2
    bodyLength = firstLength
  } else if (firstLength <= 223) {
    headerLength = 3
    bodyLength = ((firstLength - 192) << 8) + bytes[offset + 2] + 192
  } else if (firstLength === 255) {
    headerLength = 6
    bodyLength = bytes.readUInt32BE(offset + 2)
  } else {
    throw new Error(`partial OpenPGP packet lengths are unsupported at byte ${offset}`)
  }

  const bodyStart = offset + headerLength
  const nextOffset = bodyStart + bodyLength
  assert(nextOffset <= bytes.length, `OpenPGP packet at byte ${offset} is truncated`)
  return { tag, body: bytes.subarray(bodyStart, nextOffset), nextOffset }
}

function parsePackets(bytes) {
  const packets = []
  let offset = 0
  while (offset < bytes.length) {
    const packet = readPacket(bytes, offset)
    packets.push(packet)
    offset = packet.nextOffset
  }
  return packets
}

async function textFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name)
      if (entry.isDirectory()) return textFiles(entryPath)
      if (entry.isFile() && textExtensions.has(path.extname(entry.name))) return [entryPath]
      return []
    }),
  )
  return nested.flat()
}

const portfolio = JSON.parse(await readFile(path.join(root, 'data', 'portfolio.json'), 'utf8'))
const { name, email, pgp } = portfolio.personal
const fingerprint = normalizeFingerprint(pgp.fingerprint)
const keyPath = path.resolve(publicRoot, pgp.publicKeyPath.replace(/^\/+/, ''))

assert(
  pgp.publicKeyPath.startsWith('/') && !pgp.publicKeyPath.startsWith('//'),
  'personal.pgp.publicKeyPath must be a same-origin absolute path',
)
assert(
  keyPath.startsWith(`${publicRoot}${path.sep}`),
  'personal.pgp.publicKeyPath must resolve inside public/',
)
assert(/^[A-F0-9]{40}$/.test(fingerprint), 'personal.pgp.fingerprint must contain 40 hex digits')
assert(pgp.keyId === fingerprint.slice(-16), 'personal.pgp.keyId must match the fingerprint')
assert(pgp.algorithm === 'RSA', 'personal.pgp.algorithm must identify the published RSA key')
assert(pgp.length === 4096, 'personal.pgp.length must identify the published 4096-bit key')
assert(/^[a-f0-9]{64}$/.test(pgp.sha256), 'personal.pgp.sha256 must contain 64 hex digits')

const armor = await readFile(keyPath, 'utf8')
const keyBytes = decodePublicKeyArmor(armor)
// Pin the complete packet stream whose self-signatures and encryption capability were
// independently verified before publication. The v4 fingerprint covers only the primary key.
assert(
  createHash('sha256').update(keyBytes).digest('hex') === pgp.sha256,
  'published key packets do not match the verified key artifact',
)
const packets = parsePackets(keyBytes)
assert(
  packets.filter(({ tag }) => tag === 6).length === 1,
  'published artifact must contain exactly one primary public key',
)
assert(
  packets.filter(({ tag }) => tag === 14).length === 1,
  'published artifact must contain exactly one public subkey',
)
const primaryKey = packets[0]
assert(primaryKey.tag === 6, 'the first OpenPGP packet must be a public-key packet')
assert(primaryKey.body[0] === 4, 'the published key must use the OpenPGP v4 fingerprint format')
assert(primaryKey.body.length <= 0xffff, 'the public-key packet is too large for a v4 fingerprint')

const fingerprintPrefix = Buffer.from([
  0x99,
  primaryKey.body.length >> 8,
  primaryKey.body.length & 0xff,
])
// OpenPGP v4 defines fingerprints as SHA-1 over the framed public-key packet.
// This reproduces that identifier; it does not use SHA-1 for signatures or secrets.
const derivedFingerprint = createHash('sha1')
  .update(fingerprintPrefix)
  .update(primaryKey.body)
  .digest('hex')
  .toUpperCase()

assert(
  derivedFingerprint === fingerprint,
  'published key fingerprint does not match portfolio data',
)
assert(primaryKey.body[5] === 1, 'published primary key is not RSA')
assert(primaryKey.body.readUInt16BE(6) === pgp.length, 'published primary key length is incorrect')
assert(
  new Date(primaryKey.body.readUInt32BE(1) * 1000).toISOString().slice(0, 10) === pgp.created,
  'published primary key creation date is incorrect',
)
assert(
  !packets.some(({ tag }) => tag === 5 || tag === 7),
  'published key contains a secret-key packet',
)

const userIds = packets.filter(({ tag }) => tag === 13).map(({ body }) => body.toString('utf8'))
assert(
  userIds.length === 1 && userIds[0] === `${name} <${email}>`,
  'published key user ID does not match portfolio identity',
)

const encryptionSubkey = packets.find(({ tag }) => tag === 14)
assert(encryptionSubkey, 'published key has no public encryption subkey')
assert(encryptionSubkey.body[5] === 1, 'published encryption subkey is not RSA')
assert(
  encryptionSubkey.body.readUInt16BE(6) === pgp.length,
  'published encryption subkey length is incorrect',
)

const absoluteKeyUrl = new URL(pgp.publicKeyPath, 'https://bshastry.github.io').href
assert(
  new URL(absoluteKeyUrl).origin === 'https://bshastry.github.io',
  'personal.pgp.publicKeyPath must stay on the portfolio origin',
)
const securityTxt = await readFile(path.join(publicRoot, '.well-known', 'security.txt'), 'utf8')
const llmsTxt = await readFile(path.join(publicRoot, 'llms.txt'), 'utf8')
const claims = JSON.parse(
  await readFile(path.join(publicRoot, '.well-known', 'claims.json'), 'utf8'),
)
const securityContact = claims.claims.find(({ id }) => id.endsWith('#security-contact'))

assert(
  securityTxt.includes(`Encryption: ${absoluteKeyUrl}`),
  'security.txt does not reference the published key',
)
assert(
  securityTxt.includes(`Contact: mailto:${email}`),
  'security.txt does not reference the portfolio email',
)
assert(
  normalizeFingerprint(securityTxt).includes(fingerprint),
  'security.txt does not publish the fingerprint',
)
assert(llmsTxt.includes(absoluteKeyUrl), 'llms.txt does not reference the published key')
assert(
  normalizeFingerprint(llmsTxt).includes(fingerprint),
  'llms.txt does not publish the fingerprint',
)
assert(llmsTxt.includes(pgp.keyId), 'llms.txt does not publish the key ID')
assert(securityContact, 'claims.json is missing its security-contact claim')
assert(
  securityContact.object.value.encryptionKey === absoluteKeyUrl,
  'claims.json does not reference the published key',
)
assert(
  securityContact.object.value.openPgpFingerprint === fingerprint,
  'claims.json does not publish the fingerprint',
)
assert(
  securityContact.object.value.openPgpKeyId === pgp.keyId,
  'claims.json does not publish the key ID',
)
assert(
  securityContact.object.value.keyAlgorithm === `${pgp.algorithm}-${pgp.length}`,
  'claims.json does not publish the key algorithm and length',
)
assert(
  securityContact.object.value.keyCreatedAt === pgp.created,
  'claims.json does not publish the key creation date',
)
assert(
  securityContact.object.value.email === email,
  'claims.json does not reference the portfolio email',
)

const retiredReferences = []
for (const sourceRoot of publicSourceRoots) {
  for (const file of await textFiles(path.join(root, sourceRoot))) {
    const source = await readFile(file, 'utf8')
    if (/keybase|pgp_keys\.asc/i.test(source)) {
      retiredReferences.push(path.relative(root, file))
    }
  }
}
assert(
  retiredReferences.length === 0,
  `retired Keybase references remain in: ${retiredReferences.join(', ')}`,
)

console.log(
  `Validated OpenPGP key ${pgp.keyId}, fingerprint ${pgp.fingerprint}, and all public contact surfaces.`,
)
