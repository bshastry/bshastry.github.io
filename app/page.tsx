import Header from '@/components/Header'
import Hero from '@/components/Hero'
import About from '@/components/About'
// TODO(T3): Temporarily commented out — Projects.tsx references removed `projects` key
// import Projects from '@/components/Projects'
import CV from '@/components/CV'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <About />
      {/* TODO(T3): Temporarily commented out — Projects.tsx references removed `projects` key */}
      {/* <Projects /> */}
      <CV />
      <Contact />
      <Footer />
    </main>
  )
}
