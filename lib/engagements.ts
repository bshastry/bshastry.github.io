import portfolioData from '@/data/portfolio.json'

export const engagementOffers = [
  {
    slug: 'differential-testing',
    title: 'Differential-testing diagnostic',
    mechanics: 'Typical duration · 1–2 weeks',
    audience: 'For teams that suspect cross-implementation or oracle risk.',
    deliverables:
      'A divergence and threat model, a target matrix, a harness and coverage roadmap, and a prioritized-risk debrief — the same artifact structure as the public case studies.',
  },
  {
    slug: 'implementation-review',
    title: 'Critical implementation review',
    mechanics: 'Typical duration · 3–6 weeks',
    audience: 'For teams approaching a hard fork, protocol upgrade, or cryptographic rollout.',
    deliverables:
      'Independent tests of high-consequence behavior, reproducible findings with severity analysis, and remediation verification.',
  },
  {
    slug: 'workshops',
    title: 'Team workshop & advisory',
    mechanics: '½–1 day session · 1–2 weeks preparation',
    audience: 'For teams building their own fuzzing or differential-testing capability.',
    deliverables:
      'A tailored workshop with practical exercises and reference material, followed by focused office hours.',
  },
] as const

export interface EngagementGuide {
  slug: string
  label: string
  eyebrow: string
  metadataTitle: string
  metadataDescription: string
  heading: string
  lead: string
  serviceType: string
  audience: string
  situations: readonly string[]
  phases: readonly { title: string; description: string }[]
  outputs: readonly string[]
  boundary: string
  evidence: readonly { label: string; href: string; description: string }[]
}

export const engagementGuides: readonly EngagementGuide[] = [
  {
    slug: 'differential-testing',
    label: 'Differential-testing diagnostic',
    eyebrow: 'Differential fuzzing · oracle design',
    metadataTitle: 'Differential Fuzzing & Testing for Critical Systems',
    metadataDescription:
      'Scoped differential fuzzing and testing for Ethereum clients, cryptographic libraries, compilers, and other multi-implementation systems.',
    heading: 'Differential testing for systems with no single trusted oracle',
    lead: 'A focused diagnostic for teams that need to turn disagreement between independent implementations into minimized, reproducible evidence.',
    serviceType: 'Differential fuzzing and testing diagnostic',
    audience:
      'Engineering and security teams responsible for multi-implementation protocols, runtimes, compilers, or cryptographic libraries.',
    situations: [
      'Independent implementations must agree, but no single implementation is trustworthy enough to serve as ground truth.',
      'A protocol, standard, or hard-fork change creates new behavior that must be compared before release.',
      'An existing fuzzer reaches code but its oracle, corpus, or triage process produces weak signal.',
      'A suspected divergence needs to be reproduced, minimized, and translated into an actionable upstream report.',
    ],
    phases: [
      {
        title: 'Model the contract',
        description:
          'Identify the shared semantic boundary, the independent witnesses, and the disagreements that would matter operationally.',
      },
      {
        title: 'Design the harness and oracles',
        description:
          'Map inputs, normalization, comparison points, coverage, and failure modes without appointing one implementation as infallible.',
      },
      {
        title: 'Run and triage a focused campaign',
        description:
          'Exercise the highest-value paths, minimize divergences, and separate implementation defects from harness or specification ambiguity.',
      },
      {
        title: 'Hand off reproducible evidence',
        description:
          'Deliver prioritized cases, root-cause direction, regression-test recommendations, and a roadmap for the next campaign.',
      },
    ],
    outputs: [
      'Divergence and threat model',
      'Target and oracle matrix',
      'Harness, corpus, and coverage roadmap',
      'Minimized reproducers and prioritized-risk debrief',
    ],
    boundary:
      'This is not a generic penetration test or a smart-contract application audit. It is a scoped review of agreement and correctness at a shared implementation boundary.',
    evidence: [
      {
        label: 'Ethereum client case study',
        href: '/#client-divergence',
        description: 'Cross-client divergences reduced to upstream fixes and regression tests.',
      },
      {
        label: 'Trust No Single Witness',
        href: '/blog/trust-no-single-witness/',
        description: 'The testing philosophy and its practical limits across critical systems.',
      },
      {
        label: 'Post-quantum case study',
        href: '/#post-quantum',
        description: 'Cross-implementation validation of ML-KEM and ML-DSA implementations.',
      },
    ],
  },
  {
    slug: 'implementation-review',
    label: 'Critical implementation review',
    eyebrow: 'Protocol security · pre-release review',
    metadataTitle: 'Ethereum Client & Critical Implementation Security Review',
    metadataDescription:
      'Independent security review for Ethereum clients and critical protocol or cryptographic implementations before releases, upgrades, and rollouts.',
    heading: 'Independent implementation review before a high-consequence milestone',
    lead: 'A bounded review for teams approaching a client release, hard fork, protocol upgrade, cryptographic rollout, or standardization decision.',
    serviceType: 'Critical protocol and implementation security review',
    audience:
      'Maintainers and security teams shipping protocol clients, virtual machines, compilers, and cryptographic implementations.',
    situations: [
      'A release or upgrade changes consensus-critical, parser, arithmetic, state-transition, or interoperability behavior.',
      'The implementation has strong conventional tests but needs independent adversarial or cross-implementation validation.',
      'A specification change must be checked against executable behavior across more than one codebase.',
      'A reported issue needs severity analysis, blast-radius testing, or remediation verification.',
    ],
    phases: [
      {
        title: 'Fix the review boundary',
        description:
          'Agree on the milestone, high-consequence behaviors, relevant implementations, exclusions, and evidence needed for a decision.',
      },
      {
        title: 'Build independent checks',
        description:
          'Combine differential tests, properties, targeted harnesses, specification witnesses, and manual analysis where each adds distinct signal.',
      },
      {
        title: 'Reproduce and assess findings',
        description:
          'Minimize failures, test cross-client or cross-version impact, and distinguish local defects from protocol-level risk.',
      },
      {
        title: 'Verify remediation',
        description:
          'Retest fixes, recommend regression coverage, and document residual assumptions and blind spots.',
      },
    ],
    outputs: [
      'Scope and high-consequence behavior map',
      'Independent tests and reproducible findings',
      'Severity and blast-radius analysis',
      'Remediation verification and residual-risk debrief',
    ],
    boundary:
      'If you are searching for an “Ethereum client audit,” this is the relevant scope: client and protocol implementation behavior, not application-level Solidity contracts. The outcome is independent evidence, not a blanket assurance claim.',
    evidence: [
      {
        label: 'Ethereum client case study',
        href: '/#client-divergence',
        description: 'Public examples of consensus-sensitive fixes across revm and Nethermind.',
      },
      {
        label: 'Security findings ledger',
        href: '/findings/',
        description: 'Upstream fixes, coordinated disclosures, and security-relevant bugs.',
      },
      {
        label: 'Research archive',
        href: '/research/',
        description: 'Protocol, compiler, cryptographic, and fuzzing work with source artifacts.',
      },
    ],
  },
  {
    slug: 'constant-time-analysis',
    label: 'Constant-time analysis track',
    eyebrow: 'Cryptographic code · side-channel review',
    metadataTitle: 'Constant-Time Analysis & Cryptographic Implementation Review',
    metadataDescription:
      'Scoped constant-time analysis and side-channel review for high-consequence cryptographic implementation paths, backed by public disclosure evidence.',
    heading: 'Constant-time analysis for cryptographic implementation paths',
    lead: 'A specialist track within a critical implementation review for teams concerned about secret-dependent control flow, arithmetic, or observable timing behavior.',
    serviceType: 'Constant-time analysis and cryptographic implementation review',
    audience:
      'Maintainers and security teams responsible for cryptographic libraries, embedded TLS stacks, and implementations of cryptographic standards.',
    situations: [
      'Secret material reaches arithmetic, reduction, parsing, rejection, or key-generation paths whose timing properties are unclear.',
      'A constant-time claim needs independent scrutiny across source, compiler output, target architecture, or runtime behavior.',
      'Multiple implementations are expected to be functionally equivalent but may differ in timing or memory-access behavior.',
      'A suspected side channel needs a reproducible path, impact analysis, and coordinated remediation.',
    ],
    phases: [
      {
        title: 'Map secrets to observables',
        description:
          'Identify secret-bearing inputs, sensitive operations, target platforms, attacker observations, and the exact constant-time claim under review.',
      },
      {
        title: 'Trace high-risk paths',
        description:
          'Review control flow, arithmetic, compiler effects, and implementation choices that can make behavior depend on secret data.',
      },
      {
        title: 'Construct independent checks',
        description:
          'Use source analysis, targeted experiments, and differential or constant-time checks appropriate to the stated threat model.',
      },
      {
        title: 'Report and retest',
        description:
          'Provide reproducible evidence, coordinate sensitive disclosure where needed, and verify the relevant remediation paths.',
      },
    ],
    outputs: [
      'Threat model and constant-time claim boundary',
      'Secret-to-observable path analysis',
      'Reproducible findings or documented negative results',
      'Remediation verification and residual blind spots',
    ],
    boundary:
      'A scoped constant-time review is not a formal proof that an entire library is side-channel free. The claim is limited to the reviewed paths, builds, platforms, and attacker observations.',
    evidence: [
      {
        label: 'Mbed TLS timing case study',
        href: '/#mbedtls-timing',
        description: 'Secret-dependent timing paths reported and remediated through disclosure.',
      },
      {
        label: 'Security findings ledger',
        href: '/findings/',
        description: 'The linked advisory and upstream change evidence.',
      },
      {
        label: 'ML-KEM testing series',
        href: '/blog/cross-checking-post-quantum-kem/',
        description: 'Functional and constant-time oracle design across independent libraries.',
      },
    ],
  },
  {
    slug: 'workshops',
    label: 'Differential-testing workshop & advisory',
    eyebrow: 'Team capability · practical workshop',
    metadataTitle: 'Differential Fuzzing Workshop & Team Advisory',
    metadataDescription:
      'A tailored differential fuzzing and test-oracle workshop for teams building repeatable security testing capability around critical systems.',
    heading: 'Build a differential-testing capability your team can keep running',
    lead: 'A practical workshop and focused advisory package built around your system, current harnesses, and the decisions your testing must support.',
    serviceType: 'Differential fuzzing workshop and team advisory',
    audience:
      'Security, protocol, compiler, runtime, and cryptographic engineering teams establishing or improving an internal testing program.',
    situations: [
      'The team understands fuzzing but needs a stronger model for oracles, witnesses, and correlated blind spots.',
      'A prototype harness exists but coverage, corpus design, minimization, or triage is not yet operationally useful.',
      'Maintainers need a shared method for translating disagreements into reproducible reports and regression tests.',
      'A new testing initiative needs a bounded roadmap rather than an open-ended tooling project.',
    ],
    phases: [
      {
        title: 'Pre-workshop intake',
        description:
          'Review the system boundary, existing tests, representative artifacts, team goals, and anything that must remain out of scope.',
      },
      {
        title: 'Tailor practical exercises',
        description:
          'Build examples around the team’s languages, implementations, failure modes, and available test oracles.',
      },
      {
        title: 'Run the working session',
        description:
          'Cover threat modeling, witness independence, harness architecture, coverage, minimization, triage, and honest negative-result reporting.',
      },
      {
        title: 'Turn learning into a roadmap',
        description:
          'Close with concrete next experiments, ownership, success criteria, and focused office hours for the first implementation steps.',
      },
    ],
    outputs: [
      'Tailored workshop and practical exercises',
      'Reference material for the team',
      'Prioritized harness and campaign roadmap',
      'Focused follow-up office hours',
    ],
    boundary:
      'The workshop is not a certification or a substitute for reviewing the implementation itself. Its purpose is to leave the team with a technically honest method and a runnable next step.',
    evidence: [
      {
        label: 'Trust No Single Witness',
        href: '/blog/trust-no-single-witness/',
        description: 'A concise foundation for reasoning about fallible test oracles.',
      },
      {
        label: 'Testing-oracle essay',
        href: '/blog/testing-oracles/',
        description: 'Why coverage is not enough when the mechanism judging correctness is weak.',
      },
      {
        label: 'Talks and teaching material',
        href: '/#talks',
        description:
          'Public presentations on fuzzing, compilers, clients, and vulnerability research.',
      },
    ],
  },
]

export function getEngagementGuide(slug: string): EngagementGuide | undefined {
  return engagementGuides.find((guide) => guide.slug === slug)
}

const inquiryBody = (engagementType: string) => `Organization and role:
Engagement type: ${engagementType}
Trigger (release, hard fork, audit, standardization, other):
Desired start window:
Expected duration or immovable deadline:
Budget band:
Problem, in one sentence (nothing confidential):
Possible conflicts (does this touch Ethereum Foundation responsibilities?):
How did you find this page?:
`

export function getEngagementInquiryHref(engagementType = 'Not sure yet') {
  return `mailto:${portfolioData.personal.email}?subject=${encodeURIComponent(
    'Scoped engagement enquiry',
  )}&body=${encodeURIComponent(inquiryBody(engagementType))}`
}

export const engagementInquiryHref = getEngagementInquiryHref()
