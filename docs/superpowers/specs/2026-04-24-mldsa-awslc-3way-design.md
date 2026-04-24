# ML-DSA diff-fuzz — AWS-LC 3-way integration

**Date:** 2026-04-24
**Operator:** Bhargava Shastry
**Status:** design approved, pre-implementation
**Supersedes:** nothing. Extends the completed 2-way (CIRCL ↔ BoringSSL) harness at `private/pqfuzz-recon/mldsa/diff-fuzz/`.

## 1. Goal

Extend the existing ML-DSA diff-fuzz harness from 2-way (CIRCL ↔ BoringSSL) to 3-way by adding AWS-LC at its latest FIPS-module tag. Produce a publishable fork-drift map between AWS-LC and upstream BoringSSL ML-DSA implementations.

This is the next ACS-for-signatures move. ACS (Assurance-Coverage Share) is the metric defined in `private/pqfuzz-recon/MONEY-METRIC.md` — fraction of Q-day-at-risk money-path library coverage under cross-implementation diff-fuzz.

## 2. Money-trail justification

As of April 2026, AWS KMS is the single largest shipped ML-DSA deployment. It has been GA since 2025-06-13 with three parameter sets (`ML_DSA_44/65/87`), served from FIPS 140-3 Security Level 3 HSMs.

Under AWS KMS sits AWS-LC, AWS's maintained fork of BoringSSL. The ML-DSA code compiled into CloudHSM firmware derives from the AWS-LC FIPS module at a CMVP-validated tag commit. The existing CIRCL ↔ BoringSSL harness does not transitively cover AWS-LC: AWS-LC's FIPS module pins its own commits, validates separately, and may carry hardening, lag, or divergent behavior relative to upstream BoringSSL.

Other near-term money-path deployments (Cloudflare mid-2026 edge→origin auth, Circle Arc mainnet 2026, Azure Key Vault PQ 2026, Go 1.27 public stdlib, CNSA 2.0 Jan 2027 cutoff) are pre-rollout. AWS KMS is the only live ML-DSA money path in production today.

Adding AWS-LC as a third leg raises ACS-for-signatures from "no shipped production surface covered" to "covers the library behind ~100% of today's shipped production ML-DSA signatures."

## 3. Scope

### In scope

- Clone AWS-LC, build at the latest FIPS-module tag, produce `libcrypto.a`.
- Add `mldsa/diff-fuzz/awslc/awslc.go` cgo shim mirroring the surface of `bssl/bssl.go`.
- Retrofit the eight existing harnesses to 3-way:
  - `smoke_test.go`
  - `keygen_seed_{44,65,87}_test.go`
  - `verify_65_test.go`
  - `parse_pk_65_test.go`
  - `malleability_65_test.go`
  - `ctx_boundary_65_test.go`
  - `crash_surface_65_test.go`
  - `verify_wrappers_test.go` (adds `safeVerifyAWSLC`)
- Produce `mldsa/diff-fuzz/awslc/fork-drift-map.md` — static textual-diff classification between AWS-LC and BoringSSL at the pinned commits.
- Append a new section "AWS-LC 3-way integration" to `mldsa/diff-fuzz/REPORT.md`.
- Append an ML-DSA 3-way section to `SESSION-LOG.md`.

### Out of scope

- Dual AWS-LC legs (main + FIPS tag). **Target the FIPS tag only.** Main-tip drift is a follow-on session if the FIPS-tag leg surfaces interesting divergence.
- SymCrypt integration (separate Phase-2 design).
- KMS-as-oracle live-service testing (Phase 3, conditional).
- New bug classes specific to ML-DSA-44 / ML-DSA-87 beyond the existing keygen-parity mirrors.
- Any upstream filing unless a concrete divergence is observed.

## 4. Technical design

### 4.1 Pinned commit

Target the latest AWS-LC FIPS-module tag on the day of the session. Candidate tag at time of writing: the most recent `fips-202x-xx-xx` branch on `aws/aws-lc`. The exact tag SHA is pinned in the fork-drift map header.

Rationale: matches the firmware compiled into current CloudHSM. `main`-tip is out of scope; it diverges from deployed firmware by unknown amount.

### 4.2 Build

- Clone to `/tmp/aws-lc-src/`.
- Checkout latest FIPS tag.
- CMake release build: `-DCMAKE_BUILD_TYPE=Release`, ML-DSA enabled (FIPS module default).
- Produce `build/crypto/libcrypto.a`.
- Record exact tag SHA + compile flags in `mldsa/diff-fuzz/awslc/fork-drift-map.md` header.

### 4.3 Shim surface

`mldsa/diff-fuzz/awslc/awslc.go` mirrors `bssl/bssl.go`:

```
MLDSA65GenerateFromSeed(seed [32]byte) (pk, sk []byte, err error)
MLDSA65ParsePublicKey(pkBytes []byte) (handle, error)
MLDSA65Sign(skHandle, msg, ctx []byte) (sig []byte, err error)
MLDSA65Verify(pkHandle, msg, ctx, sig []byte) (bool, error)
MLDSA65MarshalPublicKey(pkHandle) ([]byte, error)
MLDSA44/87 variants for keygen only
```

**Expected API-shape difference**: AWS-LC may expose ML-DSA through `EVP_PKEY` rather than direct `MLDSA65_*` symbols. The shim uses whichever path the pinned FIPS tag exposes publicly. Any non-trivial surface-shape differences go in the fork-drift map.

### 4.4 Harness invariants (extended to 3-way)

- **Keygen parity**: `(pk, sk)` byte-identical across CIRCL, BoringSSL, AWS-LC for every seed.
- **Verify parity**: accept/reject identical across all three for every `(pk, msg, ctx, sig)`.
- **Parse parity**: accept/reject identical; Parse→Marshal roundtrip `== pk` on each library on the both-accept branch.
- **Malleability parity**: `bothAccept && sig != sigOK → fatal` extended across three libraries. Per-pair and three-way-unanimous branches both oracle-checked.
- **Panic parity**: `safeVerifyAWSLC` wrapper returns `verifyOutcome{accept, panicked}`, fires on any panic-divergence with either of the other two.

### 4.5 Fork-drift map

File: `mldsa/diff-fuzz/awslc/fork-drift-map.md`.

Classify each textual delta between AWS-LC `crypto/fipsmodule/mldsa/mldsa.cc.inc` and BoringSSL equivalent at the two pinned commits as:

- **cosmetic** — whitespace, comment, namespace or symbol renaming with no semantic change.
- **hardening** — AWS-LC adds a validation check BoringSSL lacks.
- **lag** — AWS-LC is missing a BoringSSL fix that has already landed upstream.
- **independent** — AWS-LC has a local addition not present in BoringSSL (e.g. extra POST self-test).

Header records exact commit SHAs for both pins and the fuzz campaign start/end timestamps. This artifact stands on its own — a reader who cares about AWS-LC vs upstream can consume it without reading the fuzz writeup.

### 4.6 Fuzz budget

Mirror existing per-harness budget: 30s each, 22 workers. Honest reporting if Go fuzz bitmap saturates earlier (expected on length-strict parsers).

## 5. Expected outcome space

Probability estimates (qualitative, not calibrated):

1. **Clean-negative** (~70%) — AWS-LC ML-DSA tracks BoringSSL byte-identically on the public API under ~X million executions. Publishable as ACS-coverage claim: the library behind AWS KMS verified byte-equivalent to upstream BoringSSL at the tested surface.
2. **Fork-drift with hardening only** (~25%) — AWS-LC carries defensive additions BoringSSL lacks; fuzz stays clean at the public-API level but the fork-drift map documents the deltas. Publishable as contribution to ecosystem visibility — nobody has published this map.
3. **Lag-window divergence** (~5%) — AWS-LC is behind a BoringSSL fix and the fuzz catches pre-fix behavior on the AWS-LC leg. Direct upstream-contribution target + AWS security notification path.

## 6. Deliverables

- `private/pqfuzz-recon/mldsa/diff-fuzz/awslc/awslc.go` — cgo shim.
- Build instructions or script producing `libcrypto.a` at the pinned tag (not checking the binary in).
- `private/pqfuzz-recon/mldsa/diff-fuzz/awslc/fork-drift-map.md` — textual-diff classification.
- Retrofitted 3-way harness files.
- New section in `private/pqfuzz-recon/mldsa/diff-fuzz/REPORT.md`.
- New section appended to `private/pqfuzz-recon/SESSION-LOG.md`.

## 7. Risks

- **Symbol collisions at cgo link** between two statically-linked BoringSSL-lineage libraries. Mitigation: distinct cgo sub-packages with separate `#cgo LDFLAGS`. Escalation: split to separate Go modules if collisions persist.
- **FIPS-tag rotation** — the "latest FIPS tag" at session start may not match current CloudHSM firmware if AWS has rotated since. Mitigation: record tag SHA prominently; caveat explicitly as "the most recent AWS-LC FIPS tag at time of writing."
- **API surface differences** — AWS-LC may route ML-DSA through different public headers than BoringSSL. Mitigation: shim adapts; document in fork-drift map.
- **License** — AWS-LC is ISC-licensed, same as BoringSSL. No blocker for research test-binary static linking.

## 8. Budget

4–6 hours wall-time for one focused session:

- Clone + build AWS-LC at tag: 30 min
- Write shim: 1–2 hours
- Retrofit 8 harnesses: 1–2 hours
- Run fuzz suite: 30 min
- Fork-drift static-diff + writeup: 1 hour

## 9. Follow-ons

Conditional on Phase-1 outcome:

- **Clean-negative or hardening-only** → proceed to Phase 2 (SymCrypt as independent 4th leg).
- **Lag-window divergence** → upstream AWS-LC contribution + AWS security touchpoint before returning to Phase 2.
- **KMS-as-oracle (Phase 3)** — only invoked if Phase 1 or 2 surfaces a question requiring live CloudHSM firmware confirmation that source-level audit cannot answer.

## 10. Success criteria

- `mldsa/diff-fuzz/awslc/awslc.go` compiles and links cleanly alongside existing CIRCL and BoringSSL legs.
- All 8 retrofitted harnesses build and run to completion.
- Fork-drift map classifies every textual delta between the two pinned `mldsa.cc.inc` trees with the four-class taxonomy.
- REPORT.md states results honestly: exec counts, divergences (or clean-negative), reproducer snippet.
- Reproducer in REPORT.md reproduces the reported result on re-run at the pinned commits.

## 11. What this doesn't claim

- It does **not** claim coverage of the HSM firmware binary itself. Source-level audit only.
- It does **not** claim independence from BoringSSL — AWS-LC is a fork. The fork-drift map is the honest framing; treating AWS-LC as an independent oracle would overstate the signal.
- It does **not** raise ACS for Azure Key Vault (Phase 2 territory) or for Cloudflare's mid-2026 rollout (same library as existing BoringSSL leg — already covered).
- It does **not** substitute for a live-KMS oracle test. That's Phase 3, conditional.
