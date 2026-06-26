'use client'

import Link from 'next/link'
import { Github, Linkedin, Twitter, Mail, ExternalLink } from 'lucide-react'
import portfolioData from '@/data/portfolio.json'

export default function Footer() {
  const { personal } = portfolioData
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-line bg-bg py-12">
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="mb-4 text-2xl font-semibold tracking-tight text-fg">{personal.name}</h3>
            <p className="mb-6 max-w-md text-muted">
              {personal.title} specializing in security engineering, blockchain security, and
              vulnerability research. Building secure systems and advancing cybersecurity.
            </p>
            <div className="flex space-x-5">
              <a
                href={`https://github.com/${personal.social.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
              <a
                href={`https://linkedin.com/in/${personal.social.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href={`https://twitter.com/${personal.social.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a
                href={`mailto:${personal.email}`}
                className="text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="eyebrow mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="text-muted transition-colors hover:text-fg">
                  About
                </a>
              </li>
              <li>
                <a href="#projects" className="text-muted transition-colors hover:text-fg">
                  Projects
                </a>
              </li>
              <li>
                <Link href="/blog" className="text-muted transition-colors hover:text-fg">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="eyebrow mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href={personal.social.scholar}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-muted transition-colors hover:text-fg"
                >
                  <span>Google Scholar</span>
                  <ExternalLink size={14} className="text-faint" />
                </a>
              </li>
              <li>
                <a
                  href={`https://keybase.io/${personal.social.keybase}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-muted transition-colors hover:text-fg"
                >
                  <span>Keybase</span>
                  <ExternalLink size={14} className="text-faint" />
                </a>
              </li>
              <li>
                <a
                  href={`https://github.com/${personal.social.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-muted transition-colors hover:text-fg"
                >
                  <span>Open Source</span>
                  <ExternalLink size={14} className="text-faint" />
                </a>
              </li>
              <li>
                <Link href="/blog" className="text-muted transition-colors hover:text-fg">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-line pt-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <p className="font-mono text-xs text-faint">
              © {currentYear} {personal.name}. All rights reserved.
            </p>
            <div className="mt-4 flex items-center space-x-6 md:mt-0">
              <Link
                href="/privacy"
                className="font-mono text-xs text-faint transition-colors hover:text-fg"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="font-mono text-xs text-faint transition-colors hover:text-fg"
              >
                Terms of Service
              </Link>
              <p className="font-mono text-xs text-faint">Built with Next.js &amp; Tailwind CSS</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
