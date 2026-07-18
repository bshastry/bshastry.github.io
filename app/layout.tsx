import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { pageAlternates } from '@/lib/seo'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://bshastry.github.io'),
  title: {
    default: 'Bhargava Shastry — Security Engineer & Researcher',
    template: '%s — Bhargava Shastry',
  },
  description:
    'Differential testing for critical protocol and cryptographic implementations — finding cross-implementation failures in Ethereum clients, cryptographic libraries, and compilers before they become production incidents.',
  keywords: [
    'differential testing',
    'differential fuzzing',
    'ethereum',
    'protocol security',
    'post-quantum cryptography',
    'AI-assisted vulnerability research',
    'bug bounty',
    'fuzzing',
    'security research',
  ],
  authors: [{ name: 'Bhargava Shastry' }],
  alternates: pageAlternates('/'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bshastry.github.io',
    siteName: 'Bhargava Shastry',
    title: 'Bhargava Shastry — Security Engineer & Researcher',
    description:
      'Differential testing for critical protocol and cryptographic implementations — finding cross-implementation failures before they become production incidents.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bhargava Shastry — Security Engineer & Researcher',
    description:
      'Differential testing for critical protocol and cryptographic implementations — finding cross-implementation failures before they become production incidents.',
    creator: '@ibags',
  },
}

// Runs before paint to apply the saved theme and avoid a flash. Dark is the
// default; only an explicit 'light' preference removes the `dark` class.
const themeScript = `
(function () {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'light') document.documentElement.classList.remove('dark');
    else document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={inter.className}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}
