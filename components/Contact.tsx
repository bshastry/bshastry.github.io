import {
  FileDown,
  FlaskConical,
  GraduationCap,
  Key,
  Linkedin,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import portfolioData from '@/data/portfolio.json'

const engagements = [
  {
    icon: FlaskConical,
    title: 'Differential-testing diagnostic',
    mechanics: 'Typical duration · 1–2 weeks',
    audience: 'For teams that suspect cross-implementation or oracle risk.',
    deliverables:
      'A divergence and threat model, a target matrix, a harness and coverage roadmap, and a prioritized-risk debrief — the same artifact structure as the case studies above.',
  },
  {
    icon: ShieldCheck,
    title: 'Critical implementation review',
    mechanics: 'Typical duration · 3–6 weeks',
    audience: 'For teams approaching a hard fork, protocol upgrade, or cryptographic rollout.',
    deliverables:
      'Independent tests of high-consequence behavior, reproducible findings with severity analysis, and remediation verification.',
  },
  {
    icon: GraduationCap,
    title: 'Team workshop & advisory',
    mechanics: '½–1 day session · 1–2 weeks preparation',
    audience: 'For teams building their own fuzzing or differential-testing capability.',
    deliverables:
      'A tailored workshop with practical exercises and reference material, followed by focused office hours.',
  },
]

const process = ['Enquiry', 'EF COI check', 'Availability discussion']

// Structured inquiry template (agreed qualification fields, nothing sensitive).
// A prefilled mailto keeps the site static and the privacy page truthful.
const inquirySubject = 'Scoped engagement enquiry'
const inquiryBody = `Organization and role:
Engagement type (diagnostic / review / workshop / speaking / research):
Trigger (release, hard fork, audit, standardization, other):
Desired start window:
Expected duration or immovable deadline:
Budget band:
Problem, in one sentence (nothing confidential):
Possible conflicts (does this touch Ethereum Foundation responsibilities?):
`

export default function Contact() {
  const { email, social, cv } = portfolioData.personal
  const inquiryHref = `mailto:${email}?subject=${encodeURIComponent(
    inquirySubject,
  )}&body=${encodeURIComponent(inquiryBody)}`

  return (
    <section id="contact" className="border-t border-line py-24 md:py-28">
      <div className="container-max section-padding">
        <div>
          <p className="eyebrow mb-4">08 — Work</p>
          <h2 className="section-title">Work with me</h2>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted">
            I&apos;m a security engineer at the Ethereum Foundation. Beyond that, I&apos;m glad to
            hear about roles and teams working on hard verification problems, research
            collaboration, conference talks, and podcasts — no formality needed, just email.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <a href={`mailto:${email}`} className="link-accent inline-flex items-center gap-2">
              <Mail size={15} />
              {email}
            </a>
            <a
              href={`https://linkedin.com/in/${social.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link-accent inline-flex items-center gap-2"
            >
              <Linkedin size={15} />
              LinkedIn
            </a>
            <a
              href={cv}
              target="_blank"
              rel="noopener noreferrer"
              className="link-accent inline-flex items-center gap-2"
            >
              <FileDown size={15} />
              CV (PDF)
            </a>
          </div>

          <p className="mt-8 max-w-3xl border-l-2 border-accent pl-4 text-sm leading-relaxed text-muted">
            My work has been merged upstream by the Nethermind, Erigon, revm, Mbed TLS, and Solidity
            teams — the review threads are public.
          </p>
        </div>

        <div className="mt-16 border-t border-line pt-12">
          <p className="eyebrow mb-3 text-accent">
            Independent engagements · availability subject to enquiry
          </p>
          <h3 className="text-2xl font-semibold text-fg">Scoped security engagements</h3>
          <p className="mt-3 max-w-2xl text-muted">
            For teams that need independent evidence before a release, upgrade, or standardization
            milestone.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-faint">
            The ranges below are planning estimates for a focused scope, not availability
            commitments. Timing is confirmed only after an Ethereum Foundation conflict-of-interest
            (COI) check and an availability discussion.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            {engagements.map((item) => (
              <article key={item.title} className="border-t border-line pt-6">
                <item.icon size={20} className="mb-4 text-accent" aria-hidden="true" />
                <h4 className="text-lg font-semibold text-fg">{item.title}</h4>
                <p className="mt-1 font-mono text-xs text-accent">{item.mechanics}</p>
                <p className="mt-4 text-sm leading-relaxed text-muted">{item.audience}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  <strong className="font-medium text-fg">You get:</strong> {item.deliverables}
                </p>
              </article>
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
                conflicts with my Ethereum Foundation responsibilities — I run a conflict check
                before any details are shared.
              </p>
            </div>
          </div>

          <ol className="mt-10 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-3">
            {process.map((step, index) => (
              <li key={step} className="flex items-center gap-3 bg-bg px-4 py-4">
                <span className="font-mono text-xs text-accent">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-sm font-medium text-fg">{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <a href={inquiryHref} className="btn-primary inline-flex items-center gap-2 px-6 py-3">
              <Mail size={16} />
              <span>Start a structured enquiry</span>
            </a>
            <a
              href={`https://keybase.io/${social.keybase}/pgp_keys.asc`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost inline-flex items-center gap-2 px-6 py-3"
            >
              <Key size={16} />
              <span>PGP key for sensitive reports</span>
            </a>
          </div>

          <p className="mt-10 max-w-3xl border-l-2 border-accent pl-4 text-sm leading-relaxed text-muted">
            Do not include vulnerability details, secrets, credentials, or source code in an inquiry
            — use the PGP key for sensitive reports.
          </p>

          <p className="mt-8 max-w-3xl text-xs leading-relaxed text-faint">
            Independent engagements are limited, subject to conflict review, and represent my own
            views and work — they are not offered, endorsed, or reviewed by the Ethereum Foundation.
          </p>
        </div>
      </div>
    </section>
  )
}
