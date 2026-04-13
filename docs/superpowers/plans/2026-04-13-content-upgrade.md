# Content Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the Projects section to group by security research theme (instead of individual repos), add Talks + Publications sections, and add a build-time GitHub activity widget that auto-refreshes via weekly cron.

**Architecture:** Data-driven via `data/portfolio.json` for curated content (themes, talks, publications). New `lib/github.ts` fetches public contribution data from the GitHub API at build time. A weekly cron GitHub Action triggers a rebuild to keep the activity data fresh. Three new/rewritten components: `Projects.tsx` (theme cards), `Talks.tsx`, `Publications.tsx`, plus `GitHubActivity.tsx` (recent public activity widget). Media assets (slide PDFs) are copied from `legacy-archive/media/` to `public/media/`.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, lucide-react icons. GitHub REST API (unauthenticated for public repos; optional `GITHUB_TOKEN` for higher rate limits). No new npm dependencies needed (`fetch` is built into Node 18+).

**Spec:** Approved during brainstorming in conversation. Key decisions:
- Projects grouped by 6 themes (Ethereum Protocol Security, Compiler Security, P2P & Networking, Fuzzing Infrastructure, Application Security, ERC-4337)
- Talks: visual cards with venue, year, slide/video links
- Publications: compact citation list grouped by era (EF, PhD, Fraunhofer, B.Tech)
- No unit tests (matches "Solid" scope tier from prior plan)

---

## File Structure

**New files:**
```
public/media/*.pdf                        # Slide PDFs copied from legacy-archive/media/
components/Talks.tsx                      # Talks section (cards with slide/video links)
components/Publications.tsx               # Publications section (citation list by era)
lib/github.ts                             # Build-time GitHub API fetcher
components/GitHubActivity.tsx             # Recent public activity widget
.github/workflows/weekly-rebuild.yml      # Weekly cron to rebuild with fresh GitHub data
```

**Modified files:**
```
data/portfolio.json                       # Add themes[], talks[], publications[] arrays
components/Projects.tsx                   # Full rewrite: theme-based cards instead of repo list
components/Header.tsx                     # Add Research anchor to nav
app/page.tsx                              # Add Talks, Publications, GitHubActivity sections
next.config.js                            # (if needed) env var for GITHUB_TOKEN
```

**Deleted files:**
```
(none)
```

---

## Task 1: Add content data to portfolio.json

**Goal:** Add `themes`, `talks`, and `publications` arrays to `data/portfolio.json`. Remove the old `projects` array.

**Files:**
- Modify: `data/portfolio.json`

- [ ] **Step 1.1: Read the current `data/portfolio.json`**

Understand the existing structure (personal, experience, education, skills, projects).

- [ ] **Step 1.2: Replace the `projects` array with a `themes` array**

Each theme has: id, title, description (1-2 sentences of impact), tags (languages/tech), period, highlights (bullet points of specific work), and optional links.

```json
"themes": [
  {
    "id": "protocol-security",
    "title": "Ethereum Protocol Security",
    "description": "Differential fuzzing and testing tools for validating EIP implementations and consensus-critical code across Ethereum execution layer clients.",
    "tags": ["Go", "Solidity", "Python"],
    "period": "2019 - Present",
    "highlights": [
      "Built differential fuzzers for EIP-7702 (account abstraction) across geth, Nethermind, and Besu",
      "Developed PrecompileFuzzer for testing EVM precompile implementations targeting the Prague hard fork",
      "Created EthFuzzNet, an Ethereum network resilience testing framework",
      "33 commits to goevmlab for EVM trace analysis and test generation"
    ],
    "links": [
      { "label": "goevmlab", "url": "https://github.com/holiman/goevmlab", "type": "github" }
    ]
  },
  {
    "id": "compiler-security",
    "title": "Compiler Security",
    "description": "Core contributor to the Solidity compiler's testing infrastructure, with 300+ commits focused on fuzzing and correctness testing.",
    "tags": ["C++", "Solidity"],
    "period": "2018 - Present",
    "highlights": [
      "303 commits to the Solidity compiler, primarily in fuzzing and testing",
      "Built ABI encoder v2 differential fuzzer",
      "Discovered and reported numerous compiler correctness bugs through structure-aware fuzzing"
    ],
    "links": [
      { "label": "Solidity", "url": "https://github.com/ethereum/solidity", "type": "github" }
    ]
  },
  {
    "id": "p2p-networking",
    "title": "P2P & Networking Security",
    "description": "Security testing of peer-to-peer networking stacks used in Ethereum consensus and execution clients.",
    "tags": ["Rust", "Go", "C++"],
    "period": "2018 - 2022",
    "highlights": [
      "Fuzzed libp2p (Rust implementation) for protocol-level vulnerabilities",
      "Built mplex-dos stress testing tool for libp2p multiplexing",
      "Contributed yamux stream multiplexer security patches",
      "Security research on Prysm (Ethereum consensus client)"
    ],
    "links": [
      { "label": "rust-libp2p", "url": "https://github.com/libp2p/rust-libp2p", "type": "github" }
    ]
  },
  {
    "id": "fuzzing-infra",
    "title": "Fuzzing Infrastructure",
    "description": "Tools and frameworks for automated vulnerability discovery, contributed to Google's OSS-Fuzz and built standalone fuzzing frameworks.",
    "tags": ["Python", "C++"],
    "period": "2017 - 2020",
    "highlights": [
      "Built orthrus, a fuzzing framework for managing parallel fuzz campaigns (216 commits)",
      "69 commits to Google's OSS-Fuzz continuous fuzzing platform",
      "Developed custom protocol-buffer based mutation strategies for structure-aware fuzzing"
    ],
    "links": [
      { "label": "orthrus", "url": "https://github.com/bshastry/orthrus", "type": "github" },
      { "label": "oss-fuzz", "url": "https://github.com/google/oss-fuzz", "type": "github" }
    ]
  },
  {
    "id": "application-security",
    "title": "Application Security",
    "description": "Fuzzing open-source networking and language runtime software to find and fix memory safety and logic bugs.",
    "tags": ["C", "C++", "Ruby"],
    "period": "2017 - 2021",
    "highlights": [
      "Fuzzed Open vSwitch (16 commits) — found packet parsing vulnerabilities",
      "Contributed to OVN (16 commits) — virtual network security testing",
      "Built mruby proto fuzzer using structure-aware fuzzing techniques",
      "Discovered and reported Boost Filesystem crash bugs"
    ],
    "links": [
      { "label": "Open vSwitch", "url": "https://github.com/openvswitch/ovs", "type": "github" }
    ]
  },
  {
    "id": "erc4337",
    "title": "ERC-4337 / Account Abstraction",
    "description": "Testing and compliance infrastructure for Ethereum's account abstraction ecosystem.",
    "tags": ["Go", "Solidity"],
    "period": "2023 - 2024",
    "highlights": [
      "Built bundler test executor for ERC-4337 compliance testing",
      "Contributed to Holesky funding vault smart contract infrastructure"
    ],
    "links": []
  }
]
```

- [ ] **Step 1.3: Add `talks` array**

```json
"talks": [
  {
    "title": "Fuzzing the Solidity Compiler",
    "venue": "Devcon 5",
    "location": "Osaka",
    "year": 2019,
    "slides": "/media/Fuzzing_Solidity.pdf",
    "video": "https://youtu.be/cAU5NbrXst0"
  },
  {
    "title": "Fuzzing the Solidity Compiler",
    "venue": "EthCC 3",
    "location": "Paris",
    "year": 2020,
    "slides": "/media/Fuzzing_Solidity_EthCC3.pdf"
  },
  {
    "title": "Fuzzing the Solidity Compiler",
    "venue": "FuzzCon EU",
    "location": "Europe",
    "year": 2020,
    "slides": "/media/Fuzzing_Solidity_FuzzconEU.pdf"
  },
  {
    "title": "Can A Fuzzer Match A Human: Solidity Case Study",
    "venue": "Ethereum Foundation",
    "location": "",
    "year": 2020,
    "slides": "/media/Can_A_Fuzzer_Match_A_Human.pdf"
  },
  {
    "title": "Open Discussion on Solidity Fuzzing",
    "venue": "Ethereum Meetup",
    "location": "Berlin",
    "year": 2019,
    "slides": "/media/Eth_Meetup_Slides.pdf"
  },
  {
    "title": "Vulnerability Search Problem and Methods",
    "venue": "TU Berlin (Invited Talk)",
    "location": "Berlin",
    "year": 2019,
    "slides": "/media/Vulnerability_Search_Problem_and_Methods.pdf"
  }
]
```

- [ ] **Step 1.4: Add `publications` array**

```json
"publications": [
  {
    "era": "Ethereum Foundation",
    "papers": []
  },
  {
    "era": "Ph.D. — TU Berlin",
    "papers": [
      {
        "title": "Follow the White Rabbit: Simplifying Fuzz Testing Using FuzzExMachina",
        "authors": "V. Ulitzsch, D. Maier, B. Shastry",
        "venue": "Black Hat 2018",
        "award": null
      },
      {
        "title": "Taking Control of SDN-based Cloud Systems via the Data Plane",
        "authors": "K. Thimmaraju, B. Shastry, T. Fiebig, F. Hetzelt, J.P. Seifert, A. Feldmann, S. Schmid",
        "venue": "Symposium on SDN Research 2018",
        "award": "Best Paper Award"
      },
      {
        "title": "The vAMP Attack: Taking Control of Cloud Systems via the Unified Packet Parser",
        "authors": "K. Thimmaraju, B. Shastry, T. Fiebig, F. Hetzelt, J.P. Seifert, A. Feldmann, S. Schmid",
        "venue": "Cloud Computing Security Workshop 2017",
        "award": null
      },
      {
        "title": "Static Program Analysis as a Fuzzing Aid",
        "authors": "B. Shastry, M. Leutner, T. Fiebig, K. Thimmaraju, F. Yamaguchi, K. Rieck, S. Schmid, J.P. Seifert, A. Feldmann",
        "venue": "RAID 2017",
        "award": null
      },
      {
        "title": "Static exploration of taint-style vulnerabilities found by fuzzing",
        "authors": "B. Shastry, F. Maggi, F. Yamaguchi, K. Rieck, J.P. Seifert",
        "venue": "USENIX WOOT 2017",
        "award": null
      },
      {
        "title": "Leveraging flawed tutorials for seeding large-scale web vulnerability discovery",
        "authors": "T. Unruh, B. Shastry, M. Skoruppa, F. Maggi, K. Rieck, J.P. Seifert, F. Yamaguchi",
        "venue": "USENIX WOOT 2017",
        "award": null
      },
      {
        "title": "Towards Vulnerability Discovery Using Staged Program Analysis",
        "authors": "B. Shastry, F. Yamaguchi, K. Rieck, J.P. Seifert",
        "venue": "DIMVA 2016",
        "award": null
      },
      {
        "title": "A First Look at Firefox OS Security",
        "authors": "D. Defreez, B. Shastry, H. Chen, J.P. Seifert",
        "venue": "MoST 2014",
        "award": null
      }
    ]
  },
  {
    "era": "Fraunhofer Secure IT",
    "papers": [
      {
        "title": "Towards Taming Privilege-Escalation Attacks on Android",
        "authors": "S. Bugiel, L. Davi, A. Dmitrienko, T. Fischer, A.R. Sadeghi, B. Shastry",
        "venue": "NDSS 2012",
        "award": null
      },
      {
        "title": "Practical and lightweight domain isolation on android",
        "authors": "S. Bugiel, L. Davi, A. Dmitrienko, S. Heuser, A.R. Sadeghi, B. Shastry",
        "venue": "ACM SPSM 2011",
        "award": null
      }
    ]
  }
]
```

Note: B.Tech papers are omitted (not security-related; from electrical engineering era). The EF era has an empty `papers` array since current EF work is protocol security (talks + private tools, not academic papers).

- [ ] **Step 1.5: Run `npm run check` and commit**

```bash
npm run check
git add data/portfolio.json
git commit -m "$(cat <<'EOF'
data: Replace projects with themes, add talks and publications

- Replace individual project entries with 6 theme-based groups
  (Protocol Security, Compiler Security, P2P, Fuzzing Infra,
  Application Security, ERC-4337)
- Add 6 talks with venue, year, and slide/video links
- Add 10 publications grouped by era (PhD, Fraunhofer)

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Copy media assets to public/

**Goal:** Make slide PDFs accessible at `/media/*.pdf` by copying them from `legacy-archive/media/` to `public/media/`.

**Files:**
- Create: `public/media/*.pdf` (6 PDF files referenced by talks)

- [ ] **Step 2.1: Copy relevant PDFs**

```bash
mkdir -p public/media
cp legacy-archive/media/Fuzzing_Solidity.pdf public/media/
cp legacy-archive/media/Fuzzing_Solidity_EthCC3.pdf public/media/
cp legacy-archive/media/Fuzzing_Solidity_FuzzconEU.pdf public/media/
cp legacy-archive/media/Can_A_Fuzzer_Match_A_Human.pdf public/media/
cp legacy-archive/media/Eth_Meetup_Slides.pdf public/media/
cp legacy-archive/media/Vulnerability_Search_Problem_and_Methods.pdf public/media/
```

Do NOT copy all files from `legacy-archive/media/` — only the 6 PDFs referenced by talks in portfolio.json.

- [ ] **Step 2.2: Add `public/media/` to `.prettierignore`**

Append `public/media` to `.prettierignore`.

- [ ] **Step 2.3: Commit**

```bash
git add public/media/ .prettierignore
git commit -m "$(cat <<'EOF'
assets: Copy talk slide PDFs to public/media/

6 PDFs referenced by the talks data in portfolio.json,
copied from legacy-archive/media/ to the Next.js public dir
so they're served at /media/*.pdf.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Rewrite Projects.tsx as theme-based cards

**Goal:** Replace the repo-list Projects component with theme-based cards. Each card shows: title, description, tech tags, time period, highlight bullets, and optional links. No more language filter or "Show All" toggle — 6 cards always visible.

**Files:**
- Modify: `components/Projects.tsx`

- [ ] **Step 3.1: Rewrite `components/Projects.tsx`**

```tsx
import { Shield, Code, Network, Bug, Globe, Wallet, ExternalLink, Github } from 'lucide-react'
import portfolioData from '@/data/portfolio.json'

const themeIcons: Record<string, React.ReactNode> = {
  'protocol-security': <Shield size={24} />,
  'compiler-security': <Code size={24} />,
  'p2p-networking': <Network size={24} />,
  'fuzzing-infra': <Bug size={24} />,
  'application-security': <Globe size={24} />,
  erc4337: <Wallet size={24} />,
}

export default function Projects() {
  const { themes } = portfolioData

  return (
    <section id="projects" className="bg-gray-50 py-20">
      <div className="container-max section-padding">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Security Research</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Building tools and techniques to find vulnerabilities before attackers do
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <div key={theme.id} className="card flex flex-col p-6">
              <div className="mb-4 flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                  {themeIcons[theme.id] || <Shield size={24} />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{theme.title}</h3>
                  <span className="text-sm text-gray-500">{theme.period}</span>
                </div>
              </div>

              <p className="mb-4 text-sm leading-relaxed text-gray-600">{theme.description}</p>

              <ul className="mb-4 flex-1 space-y-2">
                {theme.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-600">
                    <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
                    {highlight}
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {theme.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {theme.links.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {theme.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-sm text-gray-600 transition-colors hover:text-primary-600"
                      >
                        {link.type === 'github' ? <Github size={14} /> : <ExternalLink size={14} />}
                        <span>{link.label}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

Note: This component is no longer `'use client'` — no useState needed without the language filter. It can be a Server Component.

- [ ] **Step 3.2: Verify in browser**

Navigate to `http://localhost:3000/#projects`. Verify:
- 6 theme cards visible (not individual repo cards)
- Each card has: icon, title, period, description, highlight bullets, tech tags, links
- No "Show All" toggle or language filter buttons
- Cards are responsive (3-col on desktop, 2-col on tablet, 1-col on mobile)

- [ ] **Step 3.3: `npm run check` and commit**

```bash
npm run check
git add components/Projects.tsx
git commit -m "$(cat <<'EOF'
feat(projects): Rewrite as theme-based security research cards

Replaces individual repo cards with 6 themed groups:
Protocol Security, Compiler Security, P2P & Networking,
Fuzzing Infrastructure, Application Security, ERC-4337.
Each card shows impact highlights instead of commit counts.
Now a Server Component (no client state needed).

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Create Talks.tsx component

**Goal:** Talks section with visual cards showing venue, year, location, and slide/video links.

**Files:**
- Create: `components/Talks.tsx`

- [ ] **Step 4.1: Create `components/Talks.tsx`**

```tsx
import { FileText, Video, MapPin, Calendar } from 'lucide-react'
import portfolioData from '@/data/portfolio.json'

export default function Talks() {
  const { talks } = portfolioData

  return (
    <section id="talks" className="py-20">
      <div className="container-max section-padding">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Talks</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Conference presentations and invited talks on fuzzing, compiler security, and
            vulnerability research
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {talks.map((talk, i) => (
            <div key={i} className="card p-6">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{talk.title}</h3>
              </div>

              <div className="mb-4 space-y-1.5">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar size={14} className="mr-2 flex-shrink-0 text-gray-400" />
                  {talk.venue}, {talk.year}
                </div>
                {talk.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin size={14} className="mr-2 flex-shrink-0 text-gray-400" />
                    {talk.location}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {talk.slides && (
                  <a
                    href={talk.slides}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-600"
                  >
                    <FileText size={14} />
                    <span>Slides</span>
                  </a>
                )}
                {talk.video && (
                  <a
                    href={talk.video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                  >
                    <Video size={14} />
                    <span>Video</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4.2: `npm run check` and commit**

```bash
npm run check
git add components/Talks.tsx
git commit -m "$(cat <<'EOF'
feat: Add Talks section with venue/slide/video cards

Server Component rendering talk cards from portfolio.json.
Each card shows title, venue, year, location, and links
to slides (PDF) and video (YouTube) where available.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Create Publications.tsx component

**Goal:** Publications section with compact academic citations grouped by era.

**Files:**
- Create: `components/Publications.tsx`

- [ ] **Step 5.1: Create `components/Publications.tsx`**

```tsx
import { Award, BookOpen } from 'lucide-react'
import portfolioData from '@/data/portfolio.json'

export default function Publications() {
  const { publications } = portfolioData
  const nonEmpty = publications.filter((group) => group.papers.length > 0)

  return (
    <section id="publications" className="bg-gray-50 py-20">
      <div className="container-max section-padding">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Publications</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Peer-reviewed research in security, fuzzing, and program analysis
          </p>
        </div>

        <div className="mx-auto max-w-4xl space-y-10">
          {nonEmpty.map((group) => (
            <div key={group.era}>
              <h3 className="mb-4 flex items-center text-xl font-semibold text-gray-900">
                <BookOpen size={20} className="mr-2 text-primary-600" />
                {group.era}
              </h3>
              <div className="space-y-4">
                {group.papers.map((paper, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{paper.title}</p>
                        <p className="mt-1 text-sm text-gray-600">{paper.authors}</p>
                        <p className="mt-1 text-sm font-medium text-primary-600">{paper.venue}</p>
                      </div>
                      {paper.award && (
                        <span className="ml-3 inline-flex flex-shrink-0 items-center space-x-1 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-800">
                          <Award size={12} />
                          <span>{paper.award}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5.2: `npm run check` and commit**

```bash
npm run check
git add components/Publications.tsx
git commit -m "$(cat <<'EOF'
feat: Add Publications section with citations by era

Server Component rendering academic papers grouped by era
(PhD, Fraunhofer). Each citation shows title, authors, venue,
and award badges where applicable.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Wire into homepage and header

**Goal:** Add Talks and Publications sections to the homepage between CV and Contact. Add nav entries to Header.

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/Header.tsx`

- [ ] **Step 6.1: Update `app/page.tsx`**

Add imports for Talks and Publications. Insert them between `<CV />` and `<Contact />`:

```tsx
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Projects from '@/components/Projects'
import CV from '@/components/CV'
import Talks from '@/components/Talks'
import Publications from '@/components/Publications'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <About />
      <Projects />
      <CV />
      <Talks />
      <Publications />
      <Contact />
      <Footer />
    </main>
  )
}
```

- [ ] **Step 6.2: Update Header nav**

In `components/Header.tsx`, find the `navigation` array and add entries for Talks and Publications. Replace the current array with:

```tsx
const navigation: NavItem[] = [
  { name: 'Home', href: '#home', id: 'home' },
  { name: 'About', href: '#about', id: 'about' },
  { name: 'Research', href: '#projects', id: 'projects' },
  { name: 'CV', href: '#cv', id: 'cv' },
  { name: 'Talks', href: '#talks', id: 'talks' },
  { name: 'Pubs', href: '#publications', id: 'publications' },
  { name: 'Contact', href: '#contact', id: 'contact' },
  { name: 'Blog', href: '/blog' },
]
```

Changes: renamed "Projects" to "Research" (matches the new section title "Security Research"), added "Talks" and "Pubs" (short for Publications — saves nav space).

Also update the `sections` array in the scroll-spy `useEffect` to include the new section IDs:

```tsx
const sections = ['home', 'about', 'projects', 'cv', 'talks', 'publications', 'contact']
```

- [ ] **Step 6.3: Verify in browser**

Navigate to `http://localhost:3000`. Verify:
- Nav shows: Home, About, Research, CV, Talks, Pubs, Contact, Blog (8 items)
- Scrolling through the page shows all sections in order
- Clicking "Talks" and "Pubs" in nav scrolls to the correct sections
- Active section highlighting works for all sections including new ones

- [ ] **Step 6.4: `npm run check`, `npm run build`, commit**

```bash
npm run check
npm run build
git add app/page.tsx components/Header.tsx
git commit -m "$(cat <<'EOF'
feat: Wire Talks and Publications into homepage and header nav

- Add Talks and Publications sections between CV and Contact
- Update nav: rename Projects → Research, add Talks + Pubs entries
- Update scroll spy to track new section IDs
- Build verifies all new sections render in static export

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Create lib/github.ts — build-time GitHub API fetcher

**Goal:** Fetch public contribution data from the GitHub API at build time. This runs during `npm run build` (Node.js server context), so no CORS or rate-limit concerns for visitors.

**Files:**
- Create: `lib/github.ts`

- [ ] **Step 7.1: Create `lib/github.ts`**

```ts
const GITHUB_USERNAME = 'bshastry'
const GITHUB_API = 'https://api.github.com'

export interface GitHubRepo {
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  fork: boolean
  pushed_at: string
}

export interface GitHubEvent {
  type: string
  repo: { name: string; url: string }
  created_at: string
  payload: {
    action?: string
    ref?: string
    ref_type?: string
    commits?: { message: string }[]
  }
}

export interface GitHubActivityData {
  recentRepos: {
    name: string
    description: string | null
    url: string
    language: string | null
    stars: number
    pushedAt: string
  }[]
  recentEvents: {
    type: string
    repo: string
    repoUrl: string
    date: string
    summary: string
  }[]
  totalPublicRepos: number
  fetchedAt: string
}

function headers(): HeadersInit {
  const h: HeadersInit = { Accept: 'application/vnd.github.v3+json' }
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  return h
}

function summarizeEvent(event: GitHubEvent): string {
  const repo = event.repo.name.replace(`${GITHUB_USERNAME}/`, '')
  switch (event.type) {
    case 'PushEvent': {
      const count = event.payload.commits?.length ?? 0
      return `Pushed ${count} commit${count !== 1 ? 's' : ''} to ${repo}`
    }
    case 'CreateEvent':
      return `Created ${event.payload.ref_type ?? 'repository'} in ${repo}`
    case 'PullRequestEvent':
      return `${event.payload.action ?? 'Updated'} PR in ${repo}`
    case 'IssuesEvent':
      return `${event.payload.action ?? 'Updated'} issue in ${repo}`
    case 'ForkEvent':
      return `Forked ${repo}`
    case 'WatchEvent':
      return `Starred ${repo}`
    default:
      return `Activity in ${repo}`
  }
}

export async function getGitHubActivity(): Promise<GitHubActivityData> {
  try {
    const [reposRes, eventsRes] = await Promise.all([
      fetch(`${GITHUB_API}/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=100`, {
        headers: headers(),
      }),
      fetch(`${GITHUB_API}/users/${GITHUB_USERNAME}/events/public?per_page=30`, {
        headers: headers(),
      }),
    ])

    if (!reposRes.ok || !eventsRes.ok) {
      console.warn('GitHub API fetch failed, returning empty activity data')
      return { recentRepos: [], recentEvents: [], totalPublicRepos: 0, fetchedAt: new Date().toISOString() }
    }

    const repos: GitHubRepo[] = await reposRes.json()
    const events: GitHubEvent[] = await eventsRes.json()

    const ownRepos = repos.filter((r) => !r.fork)

    const recentRepos = ownRepos.slice(0, 6).map((r) => ({
      name: r.name,
      description: r.description,
      url: r.html_url,
      language: r.language,
      stars: r.stargazers_count,
      pushedAt: r.pushed_at,
    }))

    const recentEvents = events
      .filter((e) => ['PushEvent', 'CreateEvent', 'PullRequestEvent', 'IssuesEvent'].includes(e.type))
      .slice(0, 8)
      .map((e) => ({
        type: e.type,
        repo: e.repo.name,
        repoUrl: `https://github.com/${e.repo.name}`,
        date: e.created_at,
        summary: summarizeEvent(e),
      }))

    return {
      recentRepos,
      recentEvents,
      totalPublicRepos: ownRepos.length,
      fetchedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.warn('GitHub API fetch error:', error)
    return { recentRepos: [], recentEvents: [], totalPublicRepos: 0, fetchedAt: new Date().toISOString() }
  }
}
```

Key design decisions:
- **Graceful fallback:** If the API is down or rate-limited, returns empty data (the widget renders nothing or a "data unavailable" message). Build never fails due to GitHub being unreachable.
- **Optional `GITHUB_TOKEN`:** If set as env var, uses authenticated requests (5000 req/hr instead of 60). Not required for weekly builds.
- **Filters out forks:** Only shows repos the user owns.
- **Event summarization:** Human-readable strings like "Pushed 3 commits to goevmlab".

- [ ] **Step 7.2: `npm run check` and commit**

```bash
npm run check
git add lib/github.ts
git commit -m "$(cat <<'EOF'
feat: Add lib/github.ts for build-time GitHub activity fetching

Fetches public repos (sorted by recent push) and recent events
from the GitHub API at build time. Graceful fallback if API is
unreachable. Supports optional GITHUB_TOKEN for higher rate limits.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Create GitHubActivity.tsx component

**Goal:** A widget showing recent public open-source activity: recently pushed repos and a feed of recent events. Placed at the bottom of the Projects section or as its own section.

**Files:**
- Create: `components/GitHubActivity.tsx`
- Modify: `app/page.tsx` (add the component)

- [ ] **Step 8.1: Create `components/GitHubActivity.tsx`**

```tsx
import { GitCommit, Star, Github, Clock, ExternalLink } from 'lucide-react'
import type { GitHubActivityData } from '@/lib/github'

interface GitHubActivityProps {
  activity: GitHubActivityData
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export default function GitHubActivity({ activity }: GitHubActivityProps) {
  if (activity.recentRepos.length === 0 && activity.recentEvents.length === 0) {
    return null
  }

  return (
    <section id="activity" className="py-20">
      <div className="container-max section-padding">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Open Source Activity
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Recent public contributions — auto-updated weekly
          </p>
        </div>

        <div className="mx-auto max-w-5xl grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recently active repos */}
          {activity.recentRepos.length > 0 && (
            <div>
              <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                <Github size={20} className="mr-2 text-primary-600" />
                Recently Active Repos
              </h3>
              <div className="space-y-3">
                {activity.recentRepos.map((repo) => (
                  <a
                    key={repo.name}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{repo.name}</p>
                        {repo.description && (
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                            {repo.description}
                          </p>
                        )}
                      </div>
                      <ExternalLink size={14} className="ml-2 mt-1 flex-shrink-0 text-gray-400" />
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                      {repo.language && (
                        <span className="flex items-center">
                          <span className="mr-1 h-2 w-2 rounded-full bg-primary-500" />
                          {repo.language}
                        </span>
                      )}
                      {repo.stars > 0 && (
                        <span className="flex items-center">
                          <Star size={12} className="mr-0.5" />
                          {repo.stars}
                        </span>
                      )}
                      <span className="flex items-center">
                        <Clock size={12} className="mr-0.5" />
                        {timeAgo(repo.pushedAt)}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Recent events feed */}
          {activity.recentEvents.length > 0 && (
            <div>
              <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                <GitCommit size={20} className="mr-2 text-primary-600" />
                Recent Activity
              </h3>
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                {activity.recentEvents.map((event, i) => (
                  <a
                    key={`${event.repo}-${event.date}-${i}`}
                    href={event.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block px-4 py-3 transition-colors hover:bg-gray-50 ${
                      i !== activity.recentEvents.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <p className="text-sm text-gray-900">{event.summary}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{timeAgo(event.date)}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {activity.fetchedAt && (
          <p className="mt-8 text-center text-xs text-gray-400">
            Data from GitHub API · Last updated{' '}
            {new Date(activity.fetchedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        )}
      </div>
    </section>
  )
}
```

Note: This is NOT `'use client'` — it receives pre-fetched data as props from the server component (page.tsx). The `timeAgo` function runs at build time so the times shown are relative to the build date (which is fine for weekly rebuilds).

Wait — `timeAgo` uses `Date.now()` which will be the BUILD time, not the viewer's time. For a static site, this is correct since the data was fetched at build time. But the relative times will look stale between rebuilds. Better approach: show the actual date instead of relative time for the `fetchedAt` footer, and use relative for events (they'll be reasonably fresh with weekly rebuilds).

Actually, `timeAgo` will be calculated at build time and baked into the HTML. "3d ago" will remain "3d ago" for the whole week until the next rebuild. That's acceptable for a weekly-rebuild portfolio. The `fetchedAt` footer shows the absolute date so visitors know when data was last pulled.

- [ ] **Step 8.2: Update `app/page.tsx` to fetch and pass activity data**

Replace `app/page.tsx` with:

```tsx
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Projects from '@/components/Projects'
import CV from '@/components/CV'
import Talks from '@/components/Talks'
import Publications from '@/components/Publications'
import GitHubActivity from '@/components/GitHubActivity'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import { getGitHubActivity } from '@/lib/github'

export default async function Home() {
  const activity = await getGitHubActivity()

  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <About />
      <Projects />
      <CV />
      <Talks />
      <Publications />
      <GitHubActivity activity={activity} />
      <Contact />
      <Footer />
    </main>
  )
}
```

Note: `app/page.tsx` is now an `async` Server Component (it was already a Server Component; adding `async` is fine for Next.js App Router). The `getGitHubActivity()` call runs at build time during static export.

- [ ] **Step 8.3: Verify in browser and build**

```bash
npm run check
npm run build
```

During build, you should see the GitHub API being called (check build output for any warnings). The activity section should appear on the homepage with recent repos and events.

Browse `http://localhost:3000` and verify the "Open Source Activity" section appears after Publications.

- [ ] **Step 8.4: Commit**

```bash
git add components/GitHubActivity.tsx app/page.tsx
git commit -m "$(cat <<'EOF'
feat: Add GitHub Activity widget with build-time API fetch

Shows recently active public repos and a feed of recent events,
fetched from the GitHub API at build time. Gracefully hidden if
API data is unavailable. Data refreshes on each rebuild.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Add weekly cron rebuild workflow

**Goal:** A GitHub Actions workflow that triggers a rebuild + deploy weekly, keeping the GitHub activity widget fresh without manual intervention.

**Files:**
- Create: `.github/workflows/weekly-rebuild.yml`

- [ ] **Step 9.1: Create `.github/workflows/weekly-rebuild.yml`**

```yaml
name: Weekly Rebuild

on:
  schedule:
    # Every Monday at 06:00 UTC
    - cron: '0 6 * * 1'
  workflow_dispatch: # Allow manual trigger

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./out
      - id: deployment
        uses: actions/deploy-pages@v4
```

Notes:
- `secrets.GITHUB_TOKEN` is automatically available in GitHub Actions — no setup needed. This gives 1000 req/hr (GitHub App token), plenty for a weekly build.
- `workflow_dispatch` allows manual trigger from the Actions tab if you want to force a refresh.
- Shares the `pages` concurrency group with `deploy.yml` so they don't conflict.

- [ ] **Step 9.2: Commit**

```bash
git add .github/workflows/weekly-rebuild.yml
git commit -m "$(cat <<'EOF'
ci: Add weekly cron rebuild for fresh GitHub activity data

Rebuilds and deploys every Monday at 06:00 UTC. Uses the
built-in GITHUB_TOKEN for authenticated API requests during
build. Also supports manual trigger via workflow_dispatch.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Final verification and push

- [ ] **Step 10.1: Full quality check**

```bash
npm run check
```

- [ ] **Step 10.2: Clean build**

```bash
rm -rf .next out && npm run build
```

- [ ] **Step 10.3: Browser walkthrough**

Verify each section renders correctly on the homepage:
1. Projects → 6 theme cards (not repo list)
2. Talks → 6 talk cards with slide/video links
3. Publications → Citations grouped by era with award badges
4. GitHub Activity → Recent repos + event feed (may be empty locally if rate-limited; that's OK — the section gracefully hides)

- [ ] **Step 10.4: Push**

```bash
git push origin master
```
