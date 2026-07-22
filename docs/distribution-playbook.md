# Distribution Playbook

This playbook turns each substantial public artifact into a small, repeatable distribution cycle.
It is intentionally selective: the goal is qualified conversations with protocol/security teams
and hiring teams, not maximum undifferentiated traffic.

Last channel-policy review: 2026-07-21.

## Expert verdict on the distribution advice

### Keep

- Distribution is the next likely constraint once the dedicated recruiter and engagement routes are
  live. In this niche, trusted people and project communities often precede direct website visits.
- Publish the canonical article on this site, then write channel-native summaries that link to it.
- When a fix or disclosure is public, tell the short engineering story and link both the upstream
  artifact and the relevant case study.
- Put the site one click away from GitHub, LinkedIn, X, speaker bios, and research-identity pages
  that actually support an external URL.
- Use the site's problem-language — differential testing, Ethereum client security, implementation
  review, and constant-time analysis — consistently in profiles and pitches.

### Modify

- Do not send every article to every channel. Choose channels by subject and community fit.
- Treat Hacker News and Lobsters as communities, not traffic faucets. Neither placement nor a front
  page result is predictable. Use the original title and source, participate personally, and never
  request votes.
- Pitch newsletters selectively; “syndication” is not assumed. A short, relevant note with one
  strong public artifact is better than a generic request to feature the site.
- Treat commercial search phrases as hypotheses until Search Console exposes impressions and
  queries. Publish only pages that can stand on first-hand evidence; do not manufacture keyword
  variants.
- Prefer summaries with a canonical link over automatic full-text cross-posting. This keeps one
  source of truth and makes updates, corrections, and evidence links easier to maintain.

### Reject or defer

- Do not claim that a particular post is likely to reach the Hacker News front page or that one
  newsletter mention will outperform months of search work. Those are outcomes to measure, not
  promises.
- Do not submit repeatedly to Lobsters without being a genuine participant. Its published rule of
  thumb keeps self-promotion below one quarter of a user's stories and comments.
- Do not assume an editable website field exists on every arXiv author surface. Verify the exact
  account capability; otherwise keep the site on ORCID and Google Scholar, which are intended as
  researcher profiles.
- Do not add tracking scripts or a new analytics vendor until the privacy and measurement tradeoff
  is an explicit owner decision.

## One-time profile alignment

The GitHub profile already includes `bshastry.github.io`; keep it. Consider replacing the generic
bio with:

> Differential testing for critical systems · Ethereum clients · cryptographic implementations · compilers

Suggested LinkedIn headline:

> Security Engineer, Ethereum Foundation | Differential testing for critical systems | Protocol, compiler & cryptographic implementation security

Suggested X bio:

> Differential testing for critical systems: Ethereum clients, cryptographic libraries, and compilers. Security Engineer @ethereum.

Set the X website field to `https://bshastry.github.io/`. On LinkedIn, add these in the Featured
section if the account tier and current interface expose external-link features:

1. `https://bshastry.github.io/` — evidence-led portfolio
2. `https://bshastry.github.io/blog/trust-no-single-witness/` — concise testing philosophy
3. `https://bshastry.github.io/recruiter-brief/` — hiring-team brief

Suggested short speaker bio:

> Bhargava Shastry is a Security Engineer at the Ethereum Foundation working on differential testing, hard-fork readiness, and vulnerability triage across critical implementations. His public work spans Ethereum clients, compilers, cryptographic libraries, and side-channel analysis. Evidence and writing: https://bshastry.github.io/

Re-check the website URL in conference profiles whenever a new event bio is submitted. Use the same
canonical `https://` URL everywhere.

## Channel-fit matrix

| Artifact                                 | Primary channels                        | Conditional channels              | Why                                                    |
| ---------------------------------------- | --------------------------------------- | --------------------------------- | ------------------------------------------------------ |
| Ethereum client or hard-fork result      | X, LinkedIn, relevant project community | Hacker News, New Week in Ethereum | Strong maintainer and protocol-engineering relevance   |
| Reusable fuzzing/oracle technique        | Hacker News, X, LinkedIn                | Lobsters, tl;dr sec               | Broad technical lesson beyond one project              |
| Public security advisory or upstream fix | Project community, X, LinkedIn          | tl;dr sec, Hacker News            | Concrete evidence, but only after disclosure is public |
| Cryptographic implementation analysis    | X, LinkedIn, tl;dr sec                  | Hacker News, Lobsters             | Security depth with a reusable engineering takeaway    |
| Career/recruiter update                  | LinkedIn                                | X                                 | High hiring relevance, low fit for link aggregators    |

“Conditional” means submit only when the artifact is independently useful to that community and the
author can participate in the resulting discussion.

## Per-article distribution packet

Before posting, write five facts in plain language:

1. The problem or decision the article addresses.
2. The surprising or counterintuitive claim.
3. The public evidence supporting it.
4. The limitation or blind spot.
5. The canonical URL.

Use those facts to create channel-native summaries. Do not copy the same promotional paragraph
everywhere.

### X structure

Use three to six posts:

1. State the technical tension or result without throat-clearing.
2. Explain the method in one concrete example.
3. Link the strongest public artifact or upstream fix.
4. Name the limitation or what the test cannot establish.
5. Link the canonical article and, when genuinely relevant, tag the project once.

Keep the website in the profile website field and pin the strongest current article or case study.

### LinkedIn structure

Use roughly 150–300 words:

- Two sentences on the engineering stakes.
- One short paragraph on the method.
- One concrete result with an upstream evidence link.
- One sentence on the limitation or transferable lesson.
- One canonical link to the article or relevant audience page.

For hiring reach, alternate technical posts with occasional synthesis posts that make the role fit
explicit. Avoid turning every technical result into a job-seeking post.

### Hacker News submission

- Submit the canonical URL and the original, non-editorialized title.
- Submit only when the article would be interesting without the service offering attached.
- Do not ask colleagues or followers for votes, comments, or submissions.
- Do not use the account primarily for promotion.
- Write any discussion comments personally. The current HN guidelines disallow generated or
  AI-edited comments.

### Lobsters submission

- Participate before promoting your own work; the site is invitation-based.
- Keep self-promotion below the site's published one-quarter rule of thumb across stories and
  comments.
- Submit only if the story fits an available technical tag and offers a durable programming or
  systems lesson.
- Do not add tracking parameters; Lobsters removes them and bans marketing-analytics domains.

### Newsletter pitch

Send one tailored note, not a bulk pitch:

```text
Subject: Possible item — [specific technical result]

I published a first-hand account of [problem] in [system/project].
The reusable takeaway is [one sentence], backed by [upstream fix/advisory/harness].
It may fit your [specific section/audience]: [canonical URL]
No action needed if it is outside the issue's scope.
```

For Ethereum-client and hard-fork work, consider New Week in Ethereum. For broadly reusable
security tooling, implementation analysis, or a public disclosure, consider tl;dr sec. Verify the
current editor/contact route before every pitch.

### Upstream-fix follow-up

Publish only after the fix or disclosure is public. A useful 200-word structure is:

1. What behavior disagreed or leaked.
2. Why the impact was non-obvious.
3. How the input or path was minimized.
4. What changed upstream.
5. What regression test or review lesson remains.

Link the exact pull request, advisory, or changelog entry. Tag maintainers only when their project is
the direct subject and the public artifact is ready for discussion.

## Six-week operating cadence

- Week 0: align profile copy and links; deploy the audience routes and service-detail pages.
- Every substantial article: publish on-site, then distribute to one or two primary channels.
- Within seven days: make at most one community submission and one newsletter pitch when the fit is
  strong.
- When an upstream result becomes public: publish the short follow-up and add it to the relevant
  case study or findings ledger.
- Every two weeks: spend more time responding to other people's technical work than promoting your
  own.
- At six weeks: review evidence and keep only the channels producing qualified conversations,
  maintainer engagement, newsletter placements, or relevant search impressions.

## Measurement without a tracking script

Record these manually in a small private spreadsheet:

- Date, artifact, and canonical URL
- Channels used and direct post/submission URLs
- Maintainer replies or reshares
- Newsletter placements
- Qualified engagement enquiries
- Relevant recruiter conversations
- “How did you find this page?” answers from email enquiries
- Search Console clicks, impressions, average position, and query themes by landing page

Do not optimize for raw impressions. The useful leading indicator is public engagement from the
people who maintain, secure, or hire for the systems covered. The useful lagging indicator is a
qualified conversation with a clear source.

## Official references

- Hacker News guidelines: <https://news.ycombinator.com/newsguidelines.html>
- Lobsters guidelines and invitation model: <https://lobste.rs/about>
- GitHub profile setup: <https://docs.github.com/en/get-started/start-your-journey/setting-up-your-profile>
- LinkedIn Featured work samples: <https://www.linkedin.com/help/linkedin/answer/a550399/manage-featured-samples-of-your-work-on-your-linkedin-profile>
- X profile customization: <https://help.x.com/articles/166743>
- Google people-first content guidance: <https://developers.google.com/search/docs/fundamentals/creating-helpful-content>
- Google title guidance: <https://developers.google.com/search/docs/appearance/title-link>
- Search Console query reporting: <https://developers.google.com/webmaster-tools/v1/how-tos/search_analytics>
- New Week in Ethereum contact page: <https://wie.ercref.org/>
- tl;dr sec: <https://tldrsec.com/>
