'use client'

import { Github, Linkedin, Twitter, Mail, ExternalLink } from 'lucide-react'
import portfolioData from '@/data/portfolio.json'

export default function Footer() {
  const { personal } = portfolioData
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 py-12 text-white">
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="mb-4 text-2xl font-bold">{personal.name}</h3>
            <p className="mb-6 max-w-md text-gray-300">
              {personal.title} specializing in security engineering, blockchain security, and
              vulnerability research. Building secure systems and advancing cybersecurity.
            </p>
            <div className="flex space-x-4">
              <a
                href={`https://github.com/${personal.social.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 transition-colors hover:bg-gray-700"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
              <a
                href={`https://linkedin.com/in/${personal.social.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 transition-colors hover:bg-gray-700"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href={`https://twitter.com/${personal.social.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 transition-colors hover:bg-gray-700"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a
                href={`mailto:${personal.email}`}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 transition-colors hover:bg-gray-700"
                aria-label="Email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="text-gray-300 transition-colors hover:text-white">
                  About
                </a>
              </li>
              <li>
                <a href="#projects" className="text-gray-300 transition-colors hover:text-white">
                  Projects
                </a>
              </li>
              <li>
                <a href="#cv" className="text-gray-300 transition-colors hover:text-white">
                  CV
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-300 transition-colors hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-4 text-lg font-semibold">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href={personal.social.scholar}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-gray-300 transition-colors hover:text-white"
                >
                  <span>Google Scholar</span>
                  <ExternalLink size={14} />
                </a>
              </li>
              <li>
                <a
                  href={`https://keybase.io/${personal.social.keybase}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-gray-300 transition-colors hover:text-white"
                >
                  <span>Keybase</span>
                  <ExternalLink size={14} />
                </a>
              </li>
              <li>
                <a
                  href={`https://github.com/${personal.social.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-gray-300 transition-colors hover:text-white"
                >
                  <span>Open Source</span>
                  <ExternalLink size={14} />
                </a>
              </li>
              <li>
                <a href="/blog" className="text-gray-300 transition-colors hover:text-white">
                  Blog
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-gray-800 pt-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <p className="text-sm text-gray-400">
              © {currentYear} {personal.name}. All rights reserved.
            </p>
            <div className="mt-4 flex items-center space-x-6 md:mt-0">
              <a
                href="/privacy"
                className="text-sm text-gray-400 transition-colors hover:text-white"
              >
                Privacy Policy
              </a>
              <a href="/terms" className="text-sm text-gray-400 transition-colors hover:text-white">
                Terms of Service
              </a>
              <p className="text-sm text-gray-400">Built with Next.js & Tailwind CSS</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
