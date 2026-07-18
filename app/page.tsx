import Header from '@/components/Header'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Projects from '@/components/Projects'
import Findings from '@/components/Findings'
import Talks from '@/components/Talks'
import Writing from '@/components/Writing'
import Publications from '@/components/Publications'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import { getAllPostsMeta } from '@/lib/blog'

const SITE_URL = 'https://bshastry.github.io'

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
  sameAs: [
    'https://github.com/bshastry',
    'https://twitter.com/ibags',
    'https://linkedin.com/in/bshastry',
    'https://scholar.google.com/citations?hl=en&authuser=2&user=lsdZxf8AAAAJ',
  ],
  knowsAbout: [
    'Fuzzing',
    'Ethereum protocol security',
    'Differential testing',
    'Post-quantum cryptography',
    'Vulnerability research',
  ],
}

export default function Home() {
  const posts = getAllPostsMeta()
  const recentPosts = posts.slice(0, 3)
  const latestPost = posts[0]
    ? { slug: posts[0].slug, title: posts[0].title, date: posts[0].date }
    : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <Header />
      <main id="main-content" className="min-h-screen">
        <Hero latestPost={latestPost} />
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
