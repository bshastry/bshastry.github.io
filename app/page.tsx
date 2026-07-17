import Header from '@/components/Header'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Projects from '@/components/Projects'
import Findings from '@/components/Findings'
import Talks from '@/components/Talks'
import Writing from '@/components/Writing'
import Publications from '@/components/Publications'
import Footer from '@/components/Footer'
import { getAllPostsMeta } from '@/lib/blog'

export default function Home() {
  const posts = getAllPostsMeta()
  const recentPosts = posts.slice(0, 3)
  const latestPost = posts[0]
    ? { slug: posts[0].slug, title: posts[0].title, date: posts[0].date }
    : null

  return (
    <main className="min-h-screen">
      <Header />
      <Hero latestPost={latestPost} />
      <About />
      <Projects />
      <Findings />
      <Talks />
      <Writing posts={recentPosts} />
      <Publications />
      <Footer />
    </main>
  )
}
