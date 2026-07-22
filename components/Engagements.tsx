import Link from 'next/link'
import { ArrowRight, FlaskConical, GraduationCap, Key, Mail, ShieldCheck } from 'lucide-react'
import portfolioData from '@/data/portfolio.json'
import { engagementInquiryHref, engagementOffers } from '@/lib/engagements'

const process = ['Enquiry', 'EF COI check', 'Availability discussion']

const offerIcons = {
  'differential-testing': FlaskConical,
  'implementation-review': ShieldCheck,
  workshops: GraduationCap,
} as const

export default function Engagements() {
  const { social } = portfolioData.personal

  return (
    <div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {engagementOffers.map((item) => {
          const Icon = offerIcons[item.slug]
          return (
            <article key={item.title} className="rounded-xl border border-line bg-surface/50 p-6">
              <Icon size={20} className="mb-4 text-accent" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-fg">{item.title}</h2>
              <p className="mt-2 font-mono text-xs text-accent">{item.mechanics}</p>
              <p className="mt-5 text-sm leading-relaxed text-muted">{item.audience}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                <strong className="font-medium text-fg">You get:</strong> {item.deliverables}
              </p>
              <Link
                href={`/engagements/${item.slug}/`}
                className="link-accent mt-5 inline-flex items-center gap-2 text-sm font-medium"
              >
                <span>Review the detailed scope</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </article>
          )
        })}
      </div>

      <div className="mt-8 rounded-xl border border-line bg-surface/30 p-6 sm:flex sm:items-center sm:justify-between sm:gap-8">
        <div>
          <p className="eyebrow text-accent">Specialist review track</p>
          <h2 className="mt-2 text-xl font-semibold text-fg">Constant-time analysis</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
            For cryptographic implementation paths where secret-dependent control flow, arithmetic,
            or timing behavior needs a bounded, independently evidenced review.
          </p>
        </div>
        <Link
          href="/engagements/constant-time-analysis/"
          className="btn-ghost mt-5 inline-flex flex-shrink-0 items-center gap-2 px-5 py-2.5 sm:mt-0"
        >
          <span>See the review boundary</span>
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-8 border-t border-line pt-10 md:grid-cols-2">
        <div>
          <h2 className="eyebrow mb-3">Good fit</h2>
          <p className="text-sm leading-relaxed text-muted">
            Multi-implementation systems — L1/L2 clients, cryptographic libraries, compilers, and
            virtual machines — approaching a release, upgrade, audit, or standardization milestone,
            where a reproducible divergence is worth far more than an opinion.
          </p>
        </div>
        <div>
          <h2 className="eyebrow mb-3">Poor fit</h2>
          <p className="text-sm leading-relaxed text-muted">
            Smart-contract application audits, generic penetration testing, or anything that
            conflicts with my Ethereum Foundation responsibilities. I run a conflict check before
            any details are shared.
          </p>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-fg">What happens next</h2>
        <ol className="mt-6 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-3">
          {process.map((step, index) => (
            <li key={step} className="flex items-center gap-3 bg-bg px-4 py-4">
              <span className="font-mono text-xs text-accent">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-sm font-medium text-fg">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <a
          href={engagementInquiryHref}
          className="btn-primary inline-flex items-center gap-2 px-6 py-3"
        >
          <Mail size={16} aria-hidden="true" />
          <span>Start a structured enquiry</span>
        </a>
        <Link href="/#case-studies" className="btn-ghost inline-flex items-center gap-2 px-6 py-3">
          <span>Review public case studies</span>
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
        <a
          href={`https://keybase.io/${social.keybase}/pgp_keys.asc`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost inline-flex items-center gap-2 px-6 py-3"
        >
          <Key size={16} aria-hidden="true" />
          <span>PGP key</span>
        </a>
      </div>

      <p className="mt-10 max-w-3xl border-l-2 border-accent pl-4 text-sm leading-relaxed text-muted">
        Do not include vulnerability details, secrets, credentials, or source code in an enquiry.
        Use the PGP key for sensitive reports.
      </p>

      <p className="mt-8 max-w-3xl text-xs leading-relaxed text-faint">
        Independent engagements are limited, subject to conflict review, and represent my own views
        and work. They are not offered, endorsed, or reviewed by the Ethereum Foundation.
      </p>
    </div>
  )
}
