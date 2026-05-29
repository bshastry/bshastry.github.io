import Header from '@/components/Header'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Projects from '@/components/Projects'
import Talks from '@/components/Talks'
import Publications from '@/components/Publications'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <About />
      <Projects />
      <Talks />
      <Publications />
      <Footer />
    </main>
  )
}
