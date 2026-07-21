import Header from '@/components/Header'
import Hero from '@/components/Hero'
import About from '@/components/About'
import CaseStudies from '@/components/CaseStudies'
import Projects from '@/components/Projects'
import Findings from '@/components/Findings'
import Talks from '@/components/Talks'
import Writing from '@/components/Writing'
import Publications from '@/components/Publications'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import { getAllPostsMeta } from '@/lib/blog'
import { SITE_URL, serializeJsonLd } from '@/lib/seo'
import portfolioData from '@/data/portfolio.json'

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Bhargava Shastry',
  url: SITE_URL,
  jobTitle: 'Security Engineer',
  worksFor: {
    '@type': 'Organization',
    name: 'Ethereum Foundation',
  },
  alumniOf: {
    '@type': 'CollegeOrUniversity',
    name: 'Technische Universität Berlin',
  },
  hasCredential: {
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'degree',
    educationalLevel: 'Ph.D.',
    about: {
      '@type': 'Thing',
      name: 'Static analysis and fuzzing techniques for open source bug detection',
    },
    recognizedBy: {
      '@type': 'CollegeOrUniversity',
      name: 'Technische Universität Berlin',
    },
  },
  sameAs: [
    'https://github.com/bshastry',
    'https://twitter.com/ibags',
    'https://linkedin.com/in/bshastry',
    'https://scholar.google.com/citations?hl=en&user=lsdZxf8AAAAJ',
    'https://keybase.io/bshastry',
  ],
  knowsAbout: [
    'Differential testing',
    'Fuzzing',
    'Ethereum protocol security',
    'Compiler security',
    'AI-assisted vulnerability research',
    'Post-quantum cryptography',
    'Side-channel analysis',
  ],
}

export default function Home() {
  const posts = getAllPostsMeta()
  const recentPosts = posts.slice(0, 3)
  const latestPost = posts[0] ?? null
  const publicationsCount = portfolioData.publications.reduce(
    (sum, group) => sum + group.papers.length,
    0,
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(personJsonLd) }}
      />
      <Header />
      <main id="main-content" className="min-h-screen">
        <Hero latestPost={latestPost} publicationsCount={publicationsCount} />
        <CaseStudies />
        <About />
        <Projects />
        <Findings />
        <Talks />
        <Writing posts={recentPosts} />
        <Publications />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
