export type DisclosureCategory =
  | 'Memory corruption'
  | 'Out-of-bounds read'
  | 'Logic / denial of service'

export interface CveDisclosure {
  id: `CVE-${number}-${number}`
  summary: string
  category: DisclosureCategory
  impact?: string
}

export interface DisclosureGroup {
  project: string
  period: string
  description: string
  cves: CveDisclosure[]
  evidence?: { label: string; url: string }[]
}

const memoryCorruption = (
  id: CveDisclosure['id'],
  summary: string,
  impact?: string,
): CveDisclosure => ({ id, summary, category: 'Memory corruption', impact })

const outOfBoundsRead = (
  id: CveDisclosure['id'],
  summary: string,
  impact?: string,
): CveDisclosure => ({ id, summary, category: 'Out-of-bounds read', impact })

const logicOrDos = (id: CveDisclosure['id'], summary: string, impact?: string): CveDisclosure => ({
  id,
  summary,
  category: 'Logic / denial of service',
  impact,
})

export const disclosureGroups: DisclosureGroup[] = [
  {
    project: 'Open vSwitch',
    period: '2016–2017',
    description:
      'Packet and OpenFlow parser findings, including remotely reachable code execution, access-control bypass, denial of service, and over-read paths.',
    cves: [
      memoryCorruption(
        'CVE-2016-2074',
        'MPLS parser buffer overflow in ovs-vswitchd.',
        'Remote code execution in affected 2.2.x and 2.3.x releases; denial of service in 2.4.x.',
      ),
      outOfBoundsRead('CVE-2017-9264', 'Out-of-bounds reads in the TCP, UDP, and IPv6 parsers.'),
      outOfBoundsRead(
        'CVE-2016-10377',
        'Unsigned underflow in the flow parser could read past the packet buffer.',
        'Remote access-control-list bypass.',
      ),
      outOfBoundsRead('CVE-2017-9214', 'Out-of-bounds read in an OpenFlow parser.'),
      logicOrDos(
        'CVE-2017-9263',
        'Unhandled OpenFlow role-status reason reached abort().',
        'Remote denial of service from a malicious switch.',
      ),
      outOfBoundsRead('CVE-2017-9265', 'Out-of-bounds read in an OpenFlow parser.'),
    ],
    evidence: [
      {
        label: 'Open vSwitch advisory and reporter acknowledgement',
        url: 'https://mail.openvswitch.org/pipermail/ovs-announce/2016-March/000082.html',
      },
    ],
  },
  {
    project: 'GNU oSIP2',
    period: '2016–2017',
    description:
      'Malformed SIP messages reaching heap-buffer-overflow paths in parsing and serialization code.',
    cves: [
      memoryCorruption(
        'CVE-2017-7853',
        'Heap buffer overflow while parsing a SIP body.',
        'Remote denial of service.',
      ),
      memoryCorruption('CVE-2016-10324', 'Heap buffer overflow while copying parsed SIP data.'),
      memoryCorruption(
        'CVE-2016-10325',
        'Heap buffer overflow while serializing a SIP message.',
        'Remote denial of service.',
      ),
      memoryCorruption(
        'CVE-2016-10326',
        'Heap buffer overflow while serializing a SIP body.',
        'Remote denial of service.',
      ),
    ],
  },
  {
    project: 'Snort++',
    period: '2017',
    description:
      'Decoder-array validation findings in the pre-release Snort 3 packet-processing pipeline.',
    cves: [
      logicOrDos(
        'CVE-2017-6657',
        'EtherType validation error could select an incompatible protocol decoder.',
        'Remote crash / denial of service.',
      ),
      outOfBoundsRead(
        'CVE-2017-6658',
        'Off-by-one decoder-array size permitted a buffer over-read.',
      ),
    ],
    evidence: [
      {
        label: 'Snort vendor acknowledgement',
        url: 'https://blog.snort.org/2017/05/snort-vulnerabilities-found.html',
      },
    ],
  },
  {
    project: 'tcpdump',
    period: '2017',
    description:
      'A broad parser audit incorporated into tcpdump 4.9.2: one buffer overflow and 42 buffer over-reads across network-protocol dissectors.',
    cves: [
      memoryCorruption('CVE-2017-13011', 'Buffer overflow in util-print.c:bittok2str_internal().'),
      outOfBoundsRead('CVE-2017-13012', 'ICMP parser over-read in icmp_print().'),
      outOfBoundsRead('CVE-2017-13013', 'ARP parser over-read in print-arp.c.'),
      outOfBoundsRead('CVE-2017-13015', 'EAP parser over-read in eap_print().'),
      outOfBoundsRead('CVE-2017-13016', 'ISO ES-IS parser over-read in esis_print().'),
      outOfBoundsRead('CVE-2017-13017', 'DHCPv6 parser over-read in dhcp6opt_print().'),
      outOfBoundsRead('CVE-2017-13018', 'PGM parser over-read in pgm_print().'),
      outOfBoundsRead('CVE-2017-13019', 'PGM parser over-read in pgm_print().'),
      outOfBoundsRead('CVE-2017-13020', 'VTP parser over-read in vtp_print().'),
      outOfBoundsRead('CVE-2017-13021', 'ICMPv6 parser over-read in icmp6_print().'),
      outOfBoundsRead('CVE-2017-13022', 'IP parser over-read in ip_printroute().'),
      outOfBoundsRead('CVE-2017-13023', 'IPv6 mobility parser over-read in mobility_opt_print().'),
      outOfBoundsRead('CVE-2017-13024', 'IPv6 mobility parser over-read in mobility_opt_print().'),
      outOfBoundsRead('CVE-2017-13025', 'IPv6 mobility parser over-read in mobility_opt_print().'),
      outOfBoundsRead('CVE-2017-13026', 'ISO IS-IS parser over-read in print-isoclns.c.'),
      outOfBoundsRead('CVE-2017-13027', 'LLDP parser over-read in lldp_mgmt_addr_tlv_print().'),
      outOfBoundsRead('CVE-2017-13028', 'BOOTP parser over-read in bootp_print().'),
      outOfBoundsRead('CVE-2017-13029', 'PPP parser over-read in print_ccp_config_options().'),
      outOfBoundsRead('CVE-2017-13030', 'PIM parser over-read in print-pim.c.'),
      outOfBoundsRead(
        'CVE-2017-13031',
        'IPv6 fragmentation-header parser over-read in frag6_print().',
      ),
      outOfBoundsRead('CVE-2017-13032', 'RADIUS parser over-read in print_attr_string().'),
      outOfBoundsRead('CVE-2017-13033', 'VTP parser over-read in vtp_print().'),
      outOfBoundsRead('CVE-2017-13034', 'PGM parser over-read in pgm_print().'),
      outOfBoundsRead('CVE-2017-13035', 'ISO IS-IS parser over-read in isis_print_id().'),
      outOfBoundsRead('CVE-2017-13036', 'OSPFv3 parser over-read in ospf6_decode_v3().'),
      outOfBoundsRead('CVE-2017-13037', 'IP parser over-read in ip_printts().'),
      outOfBoundsRead('CVE-2017-13039', 'ISAKMP parser over-read in print-isakmp.c.'),
      outOfBoundsRead('CVE-2017-13042', 'HNCP parser over-read in dhcpv6_print().'),
      outOfBoundsRead('CVE-2017-13043', 'BGP parser over-read in decode_multicast_vpn().'),
      outOfBoundsRead('CVE-2017-13044', 'HNCP parser over-read in dhcpv4_print().'),
      outOfBoundsRead('CVE-2017-13688', 'OLSR parser over-read in olsr_print().'),
      outOfBoundsRead('CVE-2017-13045', 'VQP parser over-read in vqp_print().'),
      outOfBoundsRead('CVE-2017-13046', 'BGP parser over-read in bgp_attr_print().'),
      outOfBoundsRead('CVE-2017-13047', 'ISO ES-IS parser over-read in esis_print().'),
      outOfBoundsRead('CVE-2017-13048', 'RSVP parser over-read in rsvp_obj_print().'),
      outOfBoundsRead('CVE-2017-13050', 'RPKI-Router parser over-read in rpki_rtr_pdu_print().'),
      outOfBoundsRead('CVE-2017-13689', 'IKEv1 parser over-read in ikev1_id_print().'),
      outOfBoundsRead('CVE-2017-13690', 'IKEv2 parser over-read in print-isakmp.c.'),
      outOfBoundsRead('CVE-2017-13051', 'RSVP parser over-read in rsvp_obj_print().'),
      outOfBoundsRead(
        'CVE-2017-13055',
        'ISO IS-IS parser over-read in isis_print_is_reach_subtlv().',
      ),
      outOfBoundsRead('CVE-2017-13052', 'CFM parser over-read in cfm_print().'),
      outOfBoundsRead('CVE-2017-13053', 'BGP parser over-read in decode_rt_routing_info().'),
      outOfBoundsRead('CVE-2017-13054', 'LLDP parser over-read in lldp_private_8023_print().'),
    ],
    evidence: [
      {
        label: 'tcpdump 4.9.2 release record',
        url: 'https://github.com/the-tcpdump-group/tcpdump/blob/tcpdump-4.9.2/CHANGES',
      },
    ],
  },
]

export interface PublicFinding {
  project: string
  date: string
  title: string
  description: string
  url: string
  links?: { label: string; url: string }[]
}

export const additionalPublicFindings: PublicFinding[] = [
  {
    project: 'Supranational blst',
    date: 'Jul 2026',
    title: 'Two safe-Rust memory-safety issues in the blst Rust bindings',
    description:
      'Privately reported two issues in the blst 0.3.16 Rust bindings, both reachable from safe Rust and reproduced under AddressSanitizer: Pairing stored a raw pointer to a borrowed DST slice and could read freed memory after the slice was dropped, and Pairing::mul_n_aggregate (and the high-level verify_multiple_aggregate_signatures) accepted an nbits value unchecked against the scalar slice length, allowing out-of-bounds reads. The maintainer fixed both — a DST lifetime bound on Pairing and a scalar-length check that panics on mismatch. Reporter and maintainer agreed these are hardening fixes rather than a security issue: the affected parameters are fixed at application design time and not attacker-controlled, and downstream use in Lighthouse v8.2.0 was checked and not affected.',
    url: 'https://github.com/supranational/blst/commit/1172c188cfcc059121b024a2010884700402baf9',
    links: [
      {
        label: 'Fix: bind DST lifetime to Pairing',
        url: 'https://github.com/supranational/blst/commit/1172c188cfcc059121b024a2010884700402baf9',
      },
      {
        label: 'Fix: harden Pairing.mul_n_aggregate interface',
        url: 'https://github.com/supranational/blst/commit/96a46e6ca7360713d9bb1fb78469c28b3c043099',
      },
    ],
  },
  {
    project: 'Open vSwitch / OVN',
    date: 'May 2017',
    title: 'Truncated DHCPv6 and DNS packet validation in pinctrl',
    description:
      'Added missing full-header checks before pinctrl read UDP length and payload fields. The maintainer judged the normal installed path not exploitable, so this remains a public hardening finding rather than a CVE.',
    url: 'https://mail.openvswitch.org/pipermail/ovs-dev/2017-May/332712.html',
  },
]

export type SolidityBugClass =
  | 'Incorrect optimization'
  | 'Code generation / storage'
  | 'Front-end validation'

export interface SoliditySecurityBug {
  uid: `SOL-${number}-${number}`
  name: string
  severity: string
  bugClass: SolidityBugClass
  versions: string
  conditions: string
  summary: string
  impact: string
  issueUrl: string
  advisoryUrl?: string
}

export const solidityBugLedgerUrl =
  'https://github.com/argotorg/solidity/blob/develop/docs/bugs.json'
export const solSmithPaperUrl = 'https://arxiv.org/abs/2607.07217'

// Cross-reference of the 25 SolSmith findings in the paper against Solidity's
// official docs/bugs.json list. Solidity describes this list as known
// security-relevant compiler bugs; these records are not CVEs.
export const soliditySecurityBugs: SoliditySecurityBug[] = [
  {
    uid: 'SOL-2019-1',
    name: 'DoubleShiftSizeOverflow',
    severity: 'low',
    bugClass: 'Incorrect optimization',
    versions: 'Introduced 0.5.5 · fixed 0.5.6',
    conditions: 'Optimizer enabled; Constantinople-compatible EVM target',
    summary:
      'Nested constant shifts whose combined size overflowed 256 bits could be folded to the wrong value.',
    impact: 'Incorrect computation in optimized bytecode.',
    issueUrl: 'https://github.com/argotorg/solidity/issues/6246',
    advisoryUrl:
      'https://www.soliditylang.org/blog/2019/03/26/solidity-optimizer-and-abiencoderv2-bug/',
  },
  {
    uid: 'SOL-2019-2',
    name: 'IncorrectByteInstructionOptimization',
    severity: 'very low',
    bugClass: 'Incorrect optimization',
    versions: 'Introduced 0.5.5 · fixed 0.5.7',
    conditions: 'Optimizer enabled; BYTE with constant second argument 31',
    summary:
      'A BYTE optimization rule used the operands in the wrong order when the second argument was 31.',
    impact: 'Unexpected values in optimized bytecode.',
    issueUrl: 'https://github.com/argotorg/solidity/issues/6316',
    advisoryUrl:
      'https://www.soliditylang.org/blog/2019/03/26/solidity-optimizer-and-abiencoderv2-bug/',
  },
  {
    uid: 'SOL-2020-1',
    name: 'YulOptimizerRedundantAssignmentBreakContinue',
    severity: 'medium (0.6.x) · low (0.5.x)',
    bugClass: 'Incorrect optimization',
    versions: '0.6.0 → 0.6.1 · 0.5.8 → 0.5.16',
    conditions: 'Yul optimizer; for-loops containing break or continue',
    summary:
      'The redundant-assignment eliminator could remove an essential assignment inside a Yul for-loop.',
    impact: 'Incorrect computation after a break or continue path.',
    issueUrl: 'https://github.com/argotorg/solidity/issues/8072',
  },
  {
    uid: 'SOL-2020-9',
    name: 'FreeFunctionRedefinition',
    severity: 'low',
    bugClass: 'Front-end validation',
    versions: 'Introduced 0.7.1 · fixed 0.7.2',
    conditions: 'Duplicate or aliased free functions with identical parameter types',
    summary: 'The type checker accepted multiple free functions with the same effective signature.',
    impact: 'Ambiguous resolution and undefined compiler behavior.',
    issueUrl: 'https://github.com/argotorg/solidity/issues/9851',
  },
  {
    uid: 'SOL-2021-1',
    name: 'KeccakCaching',
    severity: 'medium',
    bugClass: 'Incorrect optimization',
    versions: 'All prior releases · fixed 0.8.3',
    conditions: 'Bytecode optimizer; repeated Keccak-256 over equal content at different lengths',
    summary:
      'The bytecode optimizer could reuse a cached Keccak-256 value for a different input length.',
    impact: 'Incorrect hashes and therefore incorrect computation.',
    issueUrl: 'https://github.com/argotorg/solidity/issues/11131',
    advisoryUrl: 'https://www.soliditylang.org/blog/2021/03/23/keccak-optimizer-bug/',
  },
  {
    uid: 'SOL-2022-5',
    name: 'DirtyBytesArrayToStorage',
    severity: 'low',
    bugClass: 'Code generation / storage',
    versions: 'Introduced 0.0.1 · fixed 0.8.15',
    conditions: 'Legacy code generator; bytes copied from memory or calldata to storage',
    summary:
      'A partial final word could copy bytes beyond the logical end of a bytes array into storage.',
    impact: 'Dirty storage became observable after a later push operation.',
    issueUrl: 'https://github.com/argotorg/solidity/issues/11602',
    advisoryUrl: 'https://www.soliditylang.org/blog/2022/06/15/dirty-bytes-array-to-storage-bug/',
  },
  {
    uid: 'SOL-2022-7',
    name: 'StorageWriteRemovalBeforeConditionalTermination',
    severity: 'medium/high',
    bugClass: 'Incorrect optimization',
    versions: 'Introduced 0.8.13 · fixed 0.8.17',
    conditions: 'Yul optimizer; a called function may terminate with return or stop',
    summary:
      'The redundant-store eliminator could remove a storage write before a conditionally terminating call.',
    impact: 'Incorrect persistent state when the later write was never reached.',
    issueUrl: 'https://github.com/argotorg/solidity/issues/13478',
    advisoryUrl:
      'https://www.soliditylang.org/blog/2022/09/08/storage-write-removal-before-conditional-termination/',
  },
]

// Total patched miscompilation bugs reported in the SolSmith paper
// (solSmithPaperUrl). The seven bugs in soliditySecurityBugs are the subset
// also catalogued in Solidity's security-relevant known-bug ledger; every
// surface that cites the paper total must read it from here.
export const solSmithPatchedMiscompilations = 25

export const soliditySecuritySummary = {
  total: soliditySecurityBugs.length,
  incorrectOptimization: soliditySecurityBugs.filter(
    (item) => item.bugClass === 'Incorrect optimization',
  ).length,
  codeGeneration: soliditySecurityBugs.filter(
    (item) => item.bugClass === 'Code generation / storage',
  ).length,
  frontEnd: soliditySecurityBugs.filter((item) => item.bugClass === 'Front-end validation').length,
}

export const allCveDisclosures = disclosureGroups.flatMap((group) => group.cves)

// Derived from the group periods so the hero label can't drift from the ledger.
const disclosureYears = disclosureGroups.flatMap((group) =>
  (group.period.match(/\d{4}/g) ?? []).map(Number),
)
const oldestYear = Math.min(...disclosureYears)
const newestYear = Math.max(...disclosureYears)
export const disclosureYearRange =
  oldestYear === newestYear ? String(oldestYear) : `${oldestYear}–${String(newestYear).slice(-2)}`

export const disclosureSummary = {
  cves: allCveDisclosures.length,
  projects: disclosureGroups.length,
  memoryCorruption: allCveDisclosures.filter((item) => item.category === 'Memory corruption')
    .length,
  outOfBoundsReads: allCveDisclosures.filter((item) => item.category === 'Out-of-bounds read')
    .length,
  logicOrDos: allCveDisclosures.filter((item) => item.category === 'Logic / denial of service')
    .length,
  additionalPublicFindings: additionalPublicFindings.length,
}

export const cveRecordUrl = (id: CveDisclosure['id']) => `https://www.cve.org/CVERecord?id=${id}`
