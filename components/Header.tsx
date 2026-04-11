'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Github, Twitter, Linkedin } from 'lucide-react'

interface NavItem {
  name: string
  href: string
  id?: string
  external?: boolean
}

const navigation: NavItem[] = [
  { name: 'Home', href: '#home', id: 'home' },
  { name: 'About', href: '#about', id: 'about' },
  { name: 'Projects', href: '#projects', id: 'projects' },
  { name: 'CV', href: '#cv', id: 'cv' },
  { name: 'Contact', href: '#contact', id: 'contact' },
  { name: 'Blog', href: '/blog' },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('home')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
      const sections = ['home', 'about', 'projects', 'cv', 'contact']
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
    return `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'text-primary-600 bg-primary-50'
        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
    }`
  }

  const renderLink = (item: NavItem, onClick?: () => void) =>
    item.id ? (
      <a key={item.name} href={item.href} onClick={onClick} className={linkClass(item)}>
        {item.name}
      </a>
    ) : (
      <Link key={item.name} href={item.href} onClick={onClick} className={linkClass(item)}>
        {item.name}
      </Link>
    )

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 shadow-sm backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      <nav className="container-max section-padding">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0">
            <a
              href="#home"
              className="text-gradient text-xl font-bold transition-opacity hover:opacity-80"
            >
              Bhargava Shastry
            </a>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => renderLink(item))}
            </div>
          </div>

          <div className="hidden items-center space-x-4 md:flex">
            <a
              href="https://github.com/bshastry"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              className="text-gray-600 transition-colors hover:text-primary-600"
            >
              <Github size={20} />
            </a>
            <a
              href="https://twitter.com/ibags"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter profile"
              className="text-gray-600 transition-colors hover:text-primary-600"
            >
              <Twitter size={20} />
            </a>
            <a
              href="https://linkedin.com/in/bshastry"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
              className="text-gray-600 transition-colors hover:text-primary-600"
            >
              <Linkedin size={20} />
            </a>
          </div>

          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              className="text-gray-700 transition-colors hover:text-primary-600"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="mt-2 space-y-1 rounded-lg bg-white px-2 pb-3 pt-2 shadow-lg">
              {navigation.map((item) => renderLink(item, closeMobile))}
              <div className="flex items-center space-x-4 px-3 py-2">
                <a
                  href="https://github.com/bshastry"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub profile"
                  className="text-gray-600 transition-colors hover:text-primary-600"
                >
                  <Github size={20} />
                </a>
                <a
                  href="https://twitter.com/ibags"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter profile"
                  className="text-gray-600 transition-colors hover:text-primary-600"
                >
                  <Twitter size={20} />
                </a>
                <a
                  href="https://linkedin.com/in/bshastry"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn profile"
                  className="text-gray-600 transition-colors hover:text-primary-600"
                >
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
