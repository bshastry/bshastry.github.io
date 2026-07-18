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
  { name: 'Home', href: '#home', id: 'home' },
  { name: 'About', href: '#about', id: 'about' },
  { name: 'Research', href: '#research', id: 'research' },
  { name: 'Findings', href: '#findings', id: 'findings' },
  { name: 'Talks', href: '#talks', id: 'talks' },
  { name: 'Pubs', href: '#publications', id: 'publications' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '#contact', id: 'contact' },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('home')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
      const sections = ['home', 'about', 'research', 'findings', 'talks', 'publications', 'contact']
      const scrollPosition = window.scrollY + 100
      for (const section of sections) {
        const element = document.getElementById(section)
        if (!element) continue
        const { offsetTop, offsetHeight } = element
        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          setActiveSection(section)
          break
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMobile = () => setIsMenuOpen(false)

  const linkClass = (item: NavItem) => {
    const isActive = item.id && activeSection === item.id
    return `px-1 py-2 text-sm font-medium border-b-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
      isActive ? 'text-fg border-accent' : 'text-muted border-transparent hover:text-fg'
    }`
  }

  const renderLink = (item: NavItem, onClick?: () => void, block = false) => {
    const className = block ? `block ${linkClass(item)}` : linkClass(item)
    return item.id ? (
      <a key={item.name} href={item.href} onClick={onClick} className={className}>
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
        isScrolled ? 'border-b border-line bg-bg/90 backdrop-blur' : 'bg-transparent'
      }`}
    >
      <nav className="container-max section-padding">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0">
            <a
              href="#home"
              className="rounded-sm text-xl font-semibold tracking-tight text-fg transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Bhargava Shastry
            </a>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              {navigation.map((item) => renderLink(item))}
            </div>
          </div>

          <div className="hidden items-center space-x-4 md:flex">
            <a
              href="https://github.com/bshastry"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              className="rounded-sm text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Github size={20} />
            </a>
            <a
              href="https://twitter.com/ibags"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter profile"
              className="rounded-sm text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Twitter size={20} />
            </a>
            <a
              href="https://linkedin.com/in/bshastry"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
              className="rounded-sm text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Linkedin size={20} />
            </a>
            <ThemeToggle />
          </div>

          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              className="rounded-sm text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="mt-2 space-y-1 rounded-lg border border-line bg-surface px-2 pb-3 pt-2">
              {navigation.map((item) => renderLink(item, closeMobile, true))}
              <div className="flex items-center space-x-4 px-1 py-2">
                <a
                  href="https://github.com/bshastry"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub profile"
                  className="rounded-sm text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Github size={20} />
                </a>
                <a
                  href="https://twitter.com/ibags"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter profile"
                  className="rounded-sm text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Twitter size={20} />
                </a>
                <a
                  href="https://linkedin.com/in/bshastry"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn profile"
                  className="rounded-sm text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Linkedin size={20} />
                </a>
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
