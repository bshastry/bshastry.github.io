import { Mail, Mic, FlaskConical, ShieldCheck, Key } from 'lucide-react'
import portfolioData from '@/data/portfolio.json'

const engagements = [
  {
    icon: Mic,
    title: 'Speaking',
    description:
      'Conference talks, podcasts, and workshops on fuzzing, Ethereum protocol security, and post-quantum cryptography testing.',
  },
  {
    icon: FlaskConical,
    title: 'Research collaboration',
    description:
      'Joint work on differential fuzzing, client testing, side-channel analysis, and AI-assisted vulnerability research.',
  },
  {
    icon: ShieldCheck,
    title: 'Security reviews',
    description:
      'Independent reviews of protocol implementations, cryptographic code, and fuzzing setups — subject to availability.',
  },
]

export default function Contact() {
  const { email, social } = portfolioData.personal

  return (
    <section id="contact" className="border-t border-line py-24 md:py-28">
      <div className="container-max section-padding">
        <div className="mb-16">
          <p className="eyebrow mb-4">07 — Contact</p>
          <h2 className="section-title">Work with me</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            I&apos;m open to a few kinds of engagements. A short email that says what you&apos;re
            working on and what you need gets the fastest reply.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {engagements.map((item) => (
            <div key={item.title} className="border-t border-line pt-6">
              <item.icon size={20} className="mb-4 text-accent" aria-hidden="true" />
              <h3 className="mb-2 text-lg font-semibold text-fg">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <a
            href={`mailto:${email}`}
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Mail size={16} />
            <span>{email}</span>
          </a>
          <a
            href={`https://keybase.io/${social.keybase}/pgp_keys.asc`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost inline-flex items-center gap-2 px-6 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Key size={16} />
            <span>PGP key for sensitive reports</span>
          </a>
        </div>
      </div>
    </section>
  )
}
