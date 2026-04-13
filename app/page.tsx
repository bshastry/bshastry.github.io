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
