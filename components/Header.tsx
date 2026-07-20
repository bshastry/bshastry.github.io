'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Github, Twitter, Linkedin } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

interface NavItem {
  name: string
  href: string
  id?: string
  external?: boolean
}

const navigation: NavItem[] = [
  { name: 'About', href: '#about', id: 'about' },
  { name: 'Case Studies', href: '#case-studies', id: 'case-studies' },
  { name: 'Research', href: '#research', id: 'research' },
  { name: 'Findings', href: '#findings', id: 'findings' },
  { name: 'Talks', href: '#talks', id: 'talks' },
  { name: 'Pubs', href: '#publications', id: 'publications' },
  { name: 'Blog', href: '/blog' },
  { name: 'Work', href: '#contact', id: 'contact' },
]

// Scroll-spy tracks every homepage section, including ones without a nav
// item (home, writing) — otherwise the previous section's link would stay
// highlighted while the user scrolls through them.
const sectionIds = [
  'home',
  'about',
  'case-studies',
  'research',
  'findings',
  'talks',
  'writing',
  'publications',
  'contact',
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('home')
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    let frame: number | null = null

    const updateScrollState = () => {
      setIsScrolled(window.scrollY > 10)

      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(
        scrollableHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight)) : 0,
      )

      const scrollPosition = window.scrollY + 100
      for (const section of sectionIds) {
        const element = document.getElementById(section)
        if (!element) continue
        const { offsetTop, offsetHeight } = element
        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          setActiveSection(section)
          break
        }
      }

      frame = null
    }

    const handleScroll = () => {
      if (frame === null) frame = window.requestAnimationFrame(updateScrollState)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    updateScrollState()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen])

  const closeMobile = () => setIsMenuOpen(false)

  const linkClass = (item: NavItem, block = false) => {
    const isActive = item.id && activeSection === item.id
    return `${block ? 'flex w-full' : 'inline-flex'} min-h-11 items-center border-b-2 px-1 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
      isActive ? 'text-fg border-accent' : 'text-muted border-transparent hover:text-fg'
    }`
  }

  const renderLink = (item: NavItem, onClick?: () => void, block = false) => {
    const className = linkClass(item, block)
    const isActive = Boolean(item.id && activeSection === item.id)
    return item.id ? (
      <a
        key={item.name}
        href={item.href}
        onClick={onClick}
        className={className}
        aria-current={isActive ? 'location' : undefined}
      >
        {item.name}
      </a>
    ) : (
      <Link key={item.name} href={item.href} onClick={onClick} className={className}>
        {item.name}
      </Link>
    )
  }

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled || isMenuOpen ? 'border-b border-line bg-bg/90 backdrop-blur' : 'bg-transparent'
      }`}
    >
      <nav aria-label="Primary navigation" className="container-max section-padding">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0">
            <a
              href="#home"
              className="inline-flex min-h-11 items-center rounded-sm text-lg font-semibold tracking-tight text-fg transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg xl:text-xl"
            >
              Bhargava Shastry
            </a>
          </div>

          <div className="hidden lg:block">
            <div className="ml-6 flex items-baseline space-x-4 xl:ml-10 xl:space-x-6">
              {navigation.map((item) => renderLink(item))}
            </div>
          </div>

          <div className="hidden items-center space-x-1 lg:flex xl:space-x-2">
            <a
              href="https://github.com/bshastry"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <Github size={20} />
            </a>
            <a
              href="https://twitter.com/ibags"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter profile"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <Twitter size={20} />
            </a>
            <a
              href="https://linkedin.com/in/bshastry"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <Linkedin size={20} />
            </a>
            <ThemeToggle />
          </div>

          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div id="mobile-navigation" className="lg:hidden">
            <div className="mb-3 mt-2 space-y-1 rounded-xl border border-line bg-surface px-3 py-3 shadow-xl shadow-black/10">
              {navigation.map((item) => renderLink(item, closeMobile, true))}
              <div className="flex items-center space-x-4 px-1 py-2">
                <a
                  href="https://github.com/bshastry"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub profile"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Github size={20} />
                </a>
                <a
                  href="https://twitter.com/ibags"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter profile"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Twitter size={20} />
                </a>
                <a
                  href="https://linkedin.com/in/bshastry"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn profile"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Linkedin size={20} />
                </a>
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </nav>
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-px w-full origin-left bg-accent transition-transform duration-150"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />
    </header>
  )
}
