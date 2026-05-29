'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

/**
 * Theme toggle. Dark is the default; preference persists in localStorage and is
 * applied pre-paint by the inline script in app/layout.tsx. Renders a stable
 * placeholder until mounted to avoid a hydration mismatch.
 */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    setMounted(true)
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const root = document.documentElement
    const next = !root.classList.contains('dark')
    root.classList.toggle('dark', next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {
      // localStorage unavailable — toggle still applies for this session
    }
    setIsDark(next)
  }

  const base = `inline-flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`

  if (!mounted) {
    return <span className={base} aria-hidden="true" />
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={base}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
