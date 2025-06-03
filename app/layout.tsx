import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bhargava Shastry - Security Engineer & Researcher',
  description: 'Security engineer at the Ethereum Foundation and indie security researcher specializing in smart contract security, fuzzing, and blockchain technology.',
  keywords: ['security engineer', 'ethereum', 'blockchain', 'smart contracts', 'fuzzing', 'security research'],
  authors: [{ name: 'Bhargava Shastry' }],
  openGraph: {
    title: 'Bhargava Shastry - Security Engineer & Researcher',
    description: 'Security engineer at the Ethereum Foundation and indie security researcher',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bhargava Shastry - Security Engineer & Researcher',
    description: 'Security engineer at the Ethereum Foundation and indie security researcher',
    creator: '@ibags',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}