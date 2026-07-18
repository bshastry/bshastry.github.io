/**
 * Reader-facing collections for the blog index. Posts keep their granular
 * frontmatter tags; this maps them onto six curated collections so the
 * archive reads as a handful of coherent threads instead of 69 topics.
 *
 * Kept free of node imports so client components can use it.
 */

export const COLLECTIONS = [
  'Ethereum & protocol security',
  'Differential testing & fuzzing',
  'Cryptography & post-quantum',
  'Program analysis & compilers',
  'AI-assisted security',
  'Archive',
] as const

export type Collection = (typeof COLLECTIONS)[number]

// Matching runs top-to-bottom; the first rule whose tag set intersects the
// post's tags wins, so more specific collections must precede broader ones
// (e.g. the PQC posts also carry "differential-fuzzing").
const rules: Array<{ collection: Collection; tags: string[] }> = [
  { collection: 'AI-assisted security', tags: ['llm-as-judge', 'llm', 'ai', 'agents'] },
  {
    collection: 'Cryptography & post-quantum',
    tags: ['cryptography', 'post-quantum', 'ml-kem', 'ml-dsa', 'fips-203', 'fips-204', 'ecc'],
  },
  {
    collection: 'Ethereum & protocol security',
    tags: ['solidity', 'smart-contracts', 'blockchain', 'slither', 'ethereum', 'evm'],
  },
  {
    collection: 'Program analysis & compilers',
    tags: [
      'program-analysis',
      'static-analysis',
      'taint-analysis',
      'reverse-engineering',
      'input-format',
    ],
  },
  {
    collection: 'Differential testing & fuzzing',
    tags: [
      'fuzzing',
      'differential-fuzzing',
      'differential-testing',
      'oss-fuzz',
      'continuous-fuzzing',
      'structure-aware-fuzzing',
      'structure-aware',
      'libfuzzer',
      'afl',
      'oracle-problem',
      'test-harness',
      'crash-analysis',
      'mutation',
      'dictionary',
      'testing',
    ],
  },
]

export function collectionFor(tags: string[]): Collection {
  for (const rule of rules) {
    if (rule.tags.some((t) => tags.includes(t))) return rule.collection
  }
  return 'Archive'
}
