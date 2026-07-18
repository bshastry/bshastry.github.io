import { Mail, FlaskConical, ShieldCheck, Key, GraduationCap } from 'lucide-react'
import portfolioData from '@/data/portfolio.json'

const engagements = [
  {
    icon: FlaskConical,
    title: 'Differential-testing diagnostic',
    description:
      'A bounded entry engagement for teams that suspect cross-implementation or oracle risk: a threat and divergence model, a target matrix, a harness and coverage roadmap, and a prioritized-risk debrief.',
  },
  {
    icon: ShieldCheck,
    title: 'Critical implementation review',
    description:
      'For teams approaching a hard fork, protocol upgrade, or cryptographic rollout: independent testing of high-consequence behavior, reproducible findings with severity analysis, and remediation verification.',
  },
  {
    icon: GraduationCap,
    title: 'Team workshop & advisory',
    description:
      'For security and engineering teams building their own fuzzing or differential-testing capability: a tailored workshop with exercises and reference material, plus follow-up office hours.',
  },
]

// Structured inquiry template (agreed qualification fields, nothing sensitive).
// A prefilled mailto keeps the site static and the privacy page truthful.
const inquirySubject = 'Scoped engagement inquiry'
const inquiryBody = `Organization and role:
Engagement type (diagnostic / review / workshop / speaking / research):
Trigger (release, hard fork, audit, standardization, other):
Desired start window:
Budget band:
Problem, in one sentence (nothing confidential):
Possible conflicts (does this touch Ethereum Foundation responsibilities?):
`

export default function Contact() {
  const { email, social } = portfolioData.personal
  const inquiryHref = `mailto:${email}?subject=${encodeURIComponent(
    inquirySubject,
  )}&body=${encodeURIComponent(inquiryBody)}`

  return (
    <section id="contact" className="border-t border-line py-24 md:py-28">
      <div className="container-max section-padding">
        <div className="mb-16">
          <p className="eyebrow mb-4">08 — Work</p>
          <h2 className="section-title">Work with me</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            For protocol, infrastructure, and cryptographic implementation teams that need
            independent evidence their critical implementations behave consistently before release.
            I take on a small number of engagements, in three shapes:
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

        <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
          <div>
            <h4 className="eyebrow mb-2">Good fit</h4>
            <p className="text-sm leading-relaxed text-muted">
              Multi-implementation systems — L1/L2 clients, cryptographic libraries, compilers,
              virtual machines — approaching a release, upgrade, audit, or standardization
              milestone, where a reproducible divergence is worth far more than an opinion.
            </p>
          </div>
          <div>
            <h4 className="eyebrow mb-2">Poor fit</h4>
            <p className="text-sm leading-relaxed text-muted">
              Smart-contract application audits, generic penetration testing, or anything that
              conflicts with my Ethereum Foundation responsibilities — I run a conflict check before
              any details are shared.
            </p>
          </div>
        </div>

        <p className="mt-10 max-w-3xl border-l-2 border-accent pl-4 text-sm leading-relaxed text-muted">
          Do not include vulnerability details, secrets, credentials, or source code in an inquiry —
          use the PGP key for sensitive reports. Also open to conference talks, podcasts, and
          research collaboration.
        </p>

        <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <a
            href={inquiryHref}
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Mail size={16} />
            <span>Start a structured inquiry</span>
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

        <p className="mt-6 text-sm text-faint">
          Prefer plain email?{' '}
          <a href={`mailto:${email}`} className="link-accent">
            {email}
          </a>
        </p>

        <p className="mt-8 max-w-3xl text-xs leading-relaxed text-faint">
          Independent engagements are limited, subject to conflict review, and represent my own
          views and work — they are not offered, endorsed, or reviewed by the Ethereum Foundation.
        </p>
      </div>
    </section>
  )
}
