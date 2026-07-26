# Verifiable machine-readable claims

The site publishes an evidence-linked professional claims document at
[`/.well-known/claims.json`](https://bshastry.github.io/.well-known/claims.json).
It is intended for first-pass candidate and vendor screening, agent discovery,
and evidence verification.

## Files

- `claims.json` is the versioned claims document.
- `claims.schema.json` is its JSON Schema contract.
- `claims.sigstore.json` is a Sigstore bundle generated during each production
  deployment. It is deliberately not stored in the repository because every
  deployment signs the exact bytes it publishes.

The claim document separates the statement, typed value, status, evidence, and
assurance basis. A signature proves which workflow published those bytes; it
does not make the underlying statement independently true. Consumers should
follow the evidence and apply their own freshness and trust policy.

## Verify a deployed claim set

Install
[Cosign](https://docs.sigstore.dev/cosign/system_config/installation/), download
the deployed document and bundle without modifying them, then run:

```bash
curl -fsSLO https://bshastry.github.io/.well-known/claims.json
curl -fsSLO https://bshastry.github.io/.well-known/claims.sigstore.json
cosign verify-blob \
  --bundle claims.sigstore.json \
  --certificate-identity https://github.com/bshastry/bshastry.github.io/.github/workflows/deploy.yml@refs/heads/master \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  claims.json
```

Successful verification establishes that:

1. `claims.json` has not changed since signing.
2. The signing certificate was issued to this repository's `deploy.yml`
   workflow running from `refs/heads/master`.
3. The bundle contains the verification material and transparency-log proof
   expected by Cosign.

## Maintain claims

When changing a claim:

1. Keep the statement narrow enough for every cited source to support it.
2. Label first-party assertions as `self-asserted`; use `evidence-linked` only
   when the claim includes evidence beyond the assertion itself.
3. Update `reviewedAt`, `issuedAt`, and `validUntil`.
4. Run `npm run check:claims`.
5. If the structure changes, version the schema and update the document's
   `$schema` reference.

The claims check validates the document with the published JSON Schema and
cross-checks the CVE and SolSmith counts against `lib/disclosures.ts`. After a
static build, `npm run check:links` also resolves same-origin URLs from both the
claims document and `llms.txt`, including HTML fragments, against `out/`. The
Sigstore bundle is the one exception in ordinary CI because it is generated
during deployment; the deploy workflow runs the same link check after creating
the bundle.

External evidence URLs are not fetched in blocking CI. Availability checks
against third-party services are prone to rate limits, bot protection, and
transient outages, so consumers must still evaluate those links under their own
retrieval and freshness policy.

Production deploys validate the document, use keyless GitHub Actions OIDC to
sign it, verify the resulting bundle against the expected workflow identity,
and only then build the static site.
