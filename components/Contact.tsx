import Link from 'next/link'
import { ArrowRight, Briefcase, Mail, ShieldCheck } from 'lucide-react'
import portfolioData from '@/data/portfolio.json'

const paths = [
  {
    icon: Briefcase,
    eyebrow: 'For hiring teams',
    title: 'Evaluate role fit quickly',
    description:
      'A concise recruiter brief with current focus areas, selected evidence, experience, working model, and direct links to the CV and professional profiles.',
    href: '/recruiter-brief',
    cta: 'Open recruiter brief',
  },
  {
    icon: ShieldCheck,
    eyebrow: 'For product & security teams',
    title: 'Scope an independent review',
    description:
      'Conflict-screened differential testing, implementation review, and workshops for critical multi-implementation systems approaching a milestone.',
    href: '/engagements',
    cta: 'Explore engagements',
  },
] as const

export default function Contact() {
  const { email } = portfolioData.personal

  return (
    <section id="contact" className="border-t border-line py-24 md:py-28">
      <div className="container-max section-padding">
        <p className="eyebrow mb-4">08 — Work with me</p>
        <h2 className="section-title">Choose the shortest path</h2>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted">
          I&apos;m a security engineer at the Ethereum Foundation. I&apos;m also glad to hear from
          hiring teams working on hard verification problems and from teams considering a scoped,
          independent engagement.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {paths.map((path) => (
            <article
              key={path.href}
              className="rounded-xl border border-line bg-surface/50 p-6 md:p-8"
            >
              <path.icon size={22} className="text-accent" aria-hidden="true" />
              <p className="eyebrow mt-5 text-accent">{path.eyebrow}</p>
              <h3 className="mt-3 text-2xl font-semibold text-fg">{path.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted">{path.description}</p>
              <Link
                href={path.href}
                className="link-accent mt-6 inline-flex items-center gap-2 text-sm font-medium"
              >
                <span>{path.cta}</span>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <a href={`mailto:${email}`} className="link-accent inline-flex items-center gap-2">
            <Mail size={15} aria-hidden="true" />
            {email}
          </a>
          <span className="text-faint">
            No formality needed for a first, non-confidential note.
          </span>
        </div>
      </div>
    </section>
  )
}
