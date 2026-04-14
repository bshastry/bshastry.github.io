// Curated Web3 security problem taxonomy.
//
// Each entry defines a "problem cluster" — a category of pressing Web3 security
// issues that a blog post could plausibly address. Signals from the crawler are
// matched against the `keywords` (case-insensitive substring match) and land
// in whatever clusters they hit.
//
// When adding a new cluster, keep keywords tight and specific. Broad words like
// "wallet" or "token" match too much noise. Prefer compound phrases.
//
// `weight` is a per-cluster multiplier applied during scoring — use it to bias
// toward problems that are inherently higher-impact (e.g. bridge hacks) even if
// the raw signal count is modest.

/** @typedef {{id: string, label: string, description: string, keywords: string[], weight?: number}} Cluster */

/** @type {Cluster[]} */
export const VOCABULARY = [
  {
    id: 'signature-phishing',
    label: 'Wallet Drainers & Signature Phishing',
    description:
      'Attackers trick users into signing malicious EIP-712 / permit / setApprovalForAll payloads that drain wallets in one click. Drainer-as-a-service kits are commoditizing the attack.',
    keywords: [
      'wallet drainer',
      'drainer',
      'signature phishing',
      'permit2',
      'setapprovalforall',
      'blind signing',
      'eip-712',
      'eip712',
      'approval phishing',
      'ice phishing',
      'malicious signature',
      'pectra',
      'eip-7702',
      'eip7702',
    ],
    weight: 1.2,
  },
  {
    id: 'bridge-exploits',
    label: 'Cross-Chain Bridge Exploits',
    description:
      'Bridges concentrate TVL and trust assumptions, and have been the single largest source of Web3 losses. Validator-set compromises, replay bugs, and message-verification flaws keep recurring.',
    keywords: [
      'bridge exploit',
      'bridge hack',
      'cross-chain bridge',
      'cross chain bridge',
      'bridge drained',
      'bridge vulnerability',
      'bridge attack',
      'wormhole',
      'ronin',
      'nomad',
      'multichain',
      'orbit bridge',
      'poly network',
      'layerzero',
    ],
    weight: 1.3,
  },
  {
    id: 'oracle-manipulation',
    label: 'Price Oracle Manipulation',
    description:
      'DeFi protocols routinely get drained via manipulated spot prices — thin-liquidity pools, unsafe TWAP windows, and direct oracle updates remain a top-3 attack vector year after year.',
    keywords: [
      'oracle manipulation',
      'price oracle',
      'oracle attack',
      'twap manipulation',
      'spot price manipulation',
      'chainlink oracle',
      'pyth oracle',
      'oracle vulnerability',
      'stale price',
      'price feed',
      'oracle exploit',
    ],
    weight: 1.15,
  },
  {
    id: 'flashloan-governance',
    label: 'Flashloan-Powered Governance & Economic Attacks',
    description:
      'Flashloans let an attacker acquire voting power or skew AMM reserves for a single block, then unwind. Protocols with weak voting snapshots or single-block economic assumptions keep getting drained.',
    keywords: [
      'flashloan attack',
      'flash loan attack',
      'flashloan exploit',
      'flash loan exploit',
      'governance attack',
      'governance takeover',
      'economic attack',
      'voting attack',
      'beanstalk',
      'mango markets',
    ],
    weight: 1.1,
  },
  {
    id: 'reentrancy',
    label: 'Reentrancy & Cross-Function Reentrancy',
    description:
      'The classic DAO bug refuses to die. Read-only reentrancy, cross-contract reentrancy, and ERC-777/ERC-1155 callback reentrancy keep producing eight-figure losses on protocols that thought they were safe.',
    keywords: [
      'reentrancy',
      're-entrancy',
      'read-only reentrancy',
      'read only reentrancy',
      'cross-function reentrancy',
      'erc-777 callback',
      'erc777 callback',
      'erc1155 callback',
      'checks effects interactions',
    ],
    weight: 1.05,
  },
  {
    id: 'access-control',
    label: 'Broken Access Control & Privileged Functions',
    description:
      'Missing onlyOwner modifiers, unprotected initializers, and misconfigured proxy admins continue to produce "one function call drains the contract" bugs — often the cheapest exploit a researcher can find.',
    keywords: [
      'access control',
      'broken access control',
      'missing onlyowner',
      'unprotected initializer',
      'uninitialized proxy',
      'proxy admin',
      'privileged function',
      'authorization bypass',
      'only owner',
      'owner takeover',
    ],
    weight: 1.0,
  },
  {
    id: 'proxy-upgrades',
    label: 'Proxy & Upgradeability Footguns',
    description:
      'UUPS, Transparent, Diamond, and Beacon proxies each have their own footguns — storage collisions, missing _disableInitializers, selector clashes — and upgrades have bricked live protocols more than once.',
    keywords: [
      'proxy upgrade',
      'uups proxy',
      'uups vulnerability',
      'transparent proxy',
      'diamond proxy',
      'storage collision',
      'storage slot collision',
      'initializer',
      '_disableinitializers',
      'proxy bricked',
      'upgrade bug',
      'eip-1967',
    ],
    weight: 1.05,
  },
  {
    id: 'mev-frontrunning',
    label: 'MEV, Frontrunning & Sandwich Attacks',
    description:
      'Ordinary users keep bleeding value to sandwich bots on every swap. Private mempools, intent-based flows, and MEV-aware routing are promising, but adoption is uneven and the harm compounds daily.',
    keywords: [
      'mev',
      'maximal extractable value',
      'miner extractable value',
      'sandwich attack',
      'frontrunning',
      'front-running',
      'private mempool',
      'flashbots',
      'mev bot',
      'sandwich bot',
      'intent based',
      'suave',
    ],
    weight: 1.1,
  },
  {
    id: 'zk-circuit-bugs',
    label: 'Soundness Bugs in ZK Circuits',
    description:
      'Under-constrained circuits silently mint valid proofs for false statements. Recent disclosures in zk-rollups, zk-light-clients, and SNARK libraries show circuit auditing is still in its infancy.',
    keywords: [
      'zk circuit',
      'zero knowledge',
      'snark soundness',
      'under-constrained',
      'underconstrained',
      'circuit bug',
      'circom',
      'plonk',
      'halo2',
      'zk rollup bug',
      'zk-rollup bug',
      'zk prover',
      'circuit vulnerability',
    ],
    weight: 1.2,
  },
  {
    id: 'supply-chain',
    label: 'Web3 Dev Supply-Chain & Dependency Attacks',
    description:
      'Malicious npm/pypi/cargo packages targeting Hardhat, Foundry, ethers.js, and wallet SDKs have stolen private keys from builders. Typosquats, hijacked maintainer accounts, and poisoned post-install scripts are the entry vectors.',
    keywords: [
      'malicious npm package',
      'malicious package',
      'typosquat',
      'supply chain attack',
      'supply-chain attack',
      'hardhat malicious',
      'ethers.js malicious',
      'foundry malicious',
      'postinstall',
      'wallet sdk malicious',
      'compromised package',
      'dependency confusion',
      'npm malware',
    ],
    weight: 1.15,
  },
  {
    id: 'rollup-sequencer',
    label: 'Rollup Sequencer & Forced-Inclusion Risks',
    description:
      'Most L2s still run a single sequencer. Censorship, liveness failures, and forced-inclusion gaps leave users dependent on operator good behavior, and recent outages have made this a live governance topic.',
    keywords: [
      'sequencer censorship',
      'sequencer outage',
      'sequencer down',
      'forced inclusion',
      'force inclusion',
      'l2 liveness',
      'rollup censorship',
      'centralized sequencer',
      'escape hatch',
      'l2 outage',
    ],
    weight: 1.1,
  },
  {
    id: 'account-abstraction',
    label: 'Account Abstraction & 4337 Pitfalls',
    description:
      'ERC-4337 and EIP-7702 introduce powerful new capabilities, and a new attack surface — paymaster griefing, bundler DoS, validation-phase storage rules, and delegated-EOA footguns.',
    keywords: [
      'erc-4337',
      'erc4337',
      'account abstraction',
      'paymaster',
      'bundler',
      'userop',
      'eip-7702',
      'eip7702',
      'smart account',
      '4337 vulnerability',
    ],
    weight: 1.1,
  },
  {
    id: 'key-management',
    label: 'Private Key & Seed Phrase Compromise',
    description:
      'Seed-phrase screenshots, leaky CI secrets, weak RNG in wallet generators, and clipboard malware still account for a huge slice of retail losses. Hardware wallets help but blind signing undermines them.',
    keywords: [
      'private key leaked',
      'private key compromised',
      'seed phrase',
      'mnemonic leaked',
      'wallet compromised',
      'hardware wallet',
      'cold wallet drained',
      'key management',
      'weak rng',
      'clipboard malware',
    ],
    weight: 1.0,
  },
  {
    id: 'frontend-compromise',
    label: 'DApp Frontend & DNS Compromises',
    description:
      'Even if the contracts are airtight, attackers hijack the UI: DNS takeovers, malicious frontend injections, compromised IPFS gateways, and squatted ENS domains redirect user signatures to drainers.',
    keywords: [
      'dns hijack',
      'dns attack',
      'frontend compromise',
      'frontend hack',
      'malicious frontend',
      'ipfs gateway',
      'ens domain',
      'dapp frontend',
      'dns takeover',
      'ui injection',
    ],
    weight: 1.05,
  },
]
