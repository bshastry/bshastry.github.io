'use client'

import { useState, useEffect, useRef } from 'react'
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
  { name: 'Case Studies', href: '#case-studies', id: 'case-studies' },
  { name: 'About', href: '#about', id: 'about' },
  { name: 'Research', href: '#research', id: 'research' },
  { name: 'Findings', href: '#findings', id: 'findings' },
  { name: 'Talks', href: '#talks', id: 'talks' },
  { name: 'Papers', href: '#publications', id: 'publications' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '#contact', id: 'contact' },
]

// Hardcoded rather than imported from portfolio.json so this client component
// doesn't pull the whole data file into the bundle for three URLs.
const socialLinks = [
  { label: 'GitHub profile', href: 'https://github.com/bshastry', Icon: Github },
  { label: 'Twitter profile', href: 'https://twitter.com/ibags', Icon: Twitter },
  { label: 'LinkedIn profile', href: 'https://linkedin.com/in/bshastry', Icon: Linkedin },
]

const iconLinkClass = (size: string) =>
  `focus-ring inline-flex ${size} items-center justify-center rounded-md text-muted transition-colors hover:text-fg`

// Scroll-spy tracks every homepage section, including ones without a nav
// item (home, writing) — otherwise the previous section's link would stay
// highlighted while the user scrolls through them.
const sectionIds = [
  'home',
  'case-studies',
  'about',
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
  const progressRef = useRef<HTMLSpanElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let frame: number | null = null

    const updateScrollState = () => {
      setIsScrolled(window.scrollY > 10)

      // The progress bar is driven through a ref, not state: a per-frame
      // setState would re-render the whole header on every scrolled frame.
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress =
        scrollableHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight)) : 0
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`

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

    const requestUpdate = () => {
      if (frame === null) frame = window.requestAnimationFrame(updateScrollState)
    }

    window.addEventListener('scroll', requestUpdate, { passive: true })
    // Resize changes the scrollable height without firing a scroll event.
    window.addEventListener('resize', requestUpdate)
    updateScrollState()

    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        // Closing unmounts the dropdown; without this, focus falls to <body>.
        menuButtonRef.current?.focus()
      }
    }

    // Above lg the dropdown and its toggle are display:none; leaving the menu
    // "open" there would pin the opaque header chrome with no way to dismiss it.
    const desktopQuery = window.matchMedia('(min-width: 1024px)')
    const handleBreakpointChange = () => {
      if (desktopQuery.matches) setIsMenuOpen(false)
    }
    handleBreakpointChange()

    document.addEventListener('keydown', handleKeyDown)
    desktopQuery.addEventListener('change', handleBreakpointChange)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      desktopQuery.removeEventListener('change', handleBreakpointChange)
    }
  }, [isMenuOpen])

  const closeMobile = () => setIsMenuOpen(false)

  const renderLink = (item: NavItem, onClick?: () => void, block = false) => {
    const isActive = Boolean(item.id && activeSection === item.id)
    const className = `${block ? 'flex w-full' : 'inline-flex'} focus-ring min-h-11 items-center border-b-2 px-1 py-2 text-sm font-medium transition-colors duration-200 ${
      isActive ? 'border-accent text-fg' : 'border-transparent text-muted hover:text-fg'
    }`
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

  const renderSocialLinks = (size: string) =>
    socialLinks.map(({ label, href, Icon }) => (
      <a
        key={label}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className={iconLinkClass(size)}
      >
        <Icon size={20} />
      </a>
    ))

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
              className="focus-ring inline-flex min-h-11 items-center rounded-sm text-lg font-semibold tracking-tight text-fg transition-opacity hover:opacity-80 xl:text-xl"
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
            {renderSocialLinks('h-10 w-10')}
            <ThemeToggle />
          </div>

          <div className="lg:hidden">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-md text-muted transition-colors hover:text-fg"
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
                {renderSocialLinks('h-11 w-11')}
                <ThemeToggle className="h-11 w-11" />
              </div>
            </div>
          </div>
        )}
      </nav>
      {/* top-16 pins the bar to the 64px top bar even when the open mobile
          menu grows the header. No transition: it's rewritten every frame. */}
      <span
        ref={progressRef}
        aria-hidden="true"
        className="absolute left-0 top-16 h-px w-full origin-left bg-accent"
        style={{ transform: 'scaleX(0)' }}
      />
    </header>
  )
}
