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

Adding AWS-LC as a third leg raises **deployment-weighted** ACS-for-signatures from "no shipped production surface covered" to "covers the library behind ~100% of today's shipped production ML-DSA signatures." The underlying cross-implementation oracle remains CIRCL ↔ BoringSSL-lineage; AWS-LC as a BoringSSL fork adds deployment coverage, not a new independent reading of the spec. See §11 for the consistent independence framing.

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
MLDSA65GenerateFromSeed(seed [32]byte) (pk, skHandle, err error)
MLDSA65ParsePublicKey(pkBytes []byte) (pkHandle, error)
MLDSA65Sign(skHandle, msg, ctx []byte) (sig []byte, err error)
MLDSA65Verify(pkHandle, msg, ctx, sig []byte) (bool, error)
MLDSA65MarshalPublicKey(pkHandle) ([]byte, error)
MLDSA44/87 variants for keygen only
```

**sk is returned as an opaque handle, not raw bytes.** If AWS-LC's public ML-DSA API routes through `EVP_PKEY`, the underlying sk may be a PKCS#8 envelope or an opaque struct pointer rather than the 4032-byte expanded FIPS 204 encoding. The shim exposes sk as an opaque handle to avoid premature byte-level commitments; raw-sk parity is tested only on libraries that expose the raw encoding (CIRCL does; BoringSSL does via BCM; AWS-LC via EVP_PKEY does not publicly).

**Expected API-shape hazard**: AWS-LC may route ML-DSA through `EVP_PKEY` rather than direct `MLDSA65_*` symbols. The shim uses whichever path the pinned FIPS tag exposes publicly. First implementation step: inspect the pinned tag's `include/openssl/mldsa.h` (if present) and `include/openssl/evp.h` to determine the actual surface. Any non-trivial surface-shape differences go in the fork-drift map.

### 4.3.1 cgo symbol-collision hazard and mitigation

Both BoringSSL and AWS-LC statically archive `libcrypto.a` that defines overlapping symbols (`EVP_PKEY_new`, `SHA256_Init`, `ERR_*`, hundreds more). Two cgo sub-packages with distinct `#cgo LDFLAGS` **do not solve this** — the final Go binary performs one link step and the resolver picks one archive's `EVP_PKEY_new` for both packages. Concrete hazards:

- **Header-path ordering** — both ship `<openssl/*.h>` with same-name but ABI-different struct definitions. Whichever include path is first in `-I` order per cgo file determines which ABI is compiled into that call site; mixing them within one Go binary is UB.
- **Duplicate-symbol link** — linker services calls from both Go packages through whichever archive it picked, silently. This is the sneakiest failure mode because everything links and runs, but one package effectively calls the other library's code.
- **ERR_* / thread-local state collisions** — both forks initialize their own error queue; first-to-init-wins.

**Primary mitigation: build AWS-LC with `BORINGSSL_PREFIX`.** AWS-LC inherits BoringSSL's symbol-prefix build option. Setting `-DBORINGSSL_PREFIX=awslc` + generating the prefix header namespaces every exported symbol (`EVP_PKEY_new` → `awslc_EVP_PKEY_new`). This is the cleanest path if the pinned FIPS tag supports it. Verify support as the first implementation step.

**Fallback mitigations, in order of preference:**

1. `objcopy --redefine-syms` post-build pass over AWS-LC's `libcrypto.a` using a symbol map generated from `nm`.
2. Build AWS-LC as a versioned shared object (`libawslc_crypto.so.N`) with an explicit export list; load via cgo with `-l:libawslc_crypto.so.N`.
3. Split to entirely separate Go modules + separate test binaries; lose single-binary fuzz-campaign ergonomics but trivially correct.

**Park-point**: if symbol collision is unresolved at T+3h (BORINGSSL_PREFIX + objcopy both fail), fall back to separate Go modules and document the reason in the fork-drift map. Do not burn the whole session chasing a link-ghost.

### 4.4 Harness invariants (extended to 3-way)

- **pk byte-equality** (firm claim): encoded pk byte-identical across CIRCL, BoringSSL, AWS-LC for every seed. FIPS 204 §5.1 pins the pk encoding deterministically; any divergence here is a noteworthy finding, not a design uncertainty.
- **sk byte-equality** (conditional): tested only on libraries that expose the raw 4032-byte FIPS 204 §5.1 sk encoding. CIRCL does; BoringSSL does via BCM boundary. AWS-LC's public surface may be EVP_PKEY-opaque; in that case sk parity is not asserted at byte level, only behavioral (a sig produced under AWS-LC's sk handle verifies against the CIRCL- and BoringSSL-derived pk).
- **Verify parity**: accept/reject identical across all three for every `(pk, msg, ctx, sig)`.
- **Parse parity**: accept/reject identical; Parse→Marshal roundtrip `== pk` on each library on the both-accept branch.
- **Malleability parity**: `bothAccept && sig != sigOK → fatal` extended across three libraries. Per-pair and three-way-unanimous branches both oracle-checked.
- **Panic parity**: `safeVerifyAWSLC` wrapper returns `verifyOutcome{accept, panicked}`, fires on any panic-divergence with either of the other two.

### 4.5 Fork-drift map

File: `mldsa/diff-fuzz/awslc/fork-drift-map.md`.

Classify each textual delta between AWS-LC `crypto/fipsmodule/mldsa/mldsa.cc.inc` and BoringSSL equivalent at the two pinned commits as:

- **cosmetic** — whitespace, comment, namespace or symbol renaming with no semantic change.
- **hardening** — AWS-LC adds a validation check BoringSSL lacks at the time of the tag cut.
- **lag** — AWS-LC is missing a BoringSSL fix that has already landed upstream.
- **backport** — AWS-LC cherry-picks a BoringSSL fix onto its FIPS branch ahead of the FIPS-tag cut. Distinguished from "hardening" because the code originated upstream.
- **independent** — AWS-LC has a local addition not present in BoringSSL (e.g. extra POST self-test) that is not a security-validation hardening.
- **FIPS-structural** — deltas whose sole purpose is CMVP module boundary, self-test, or FIPS indicator requirements. Not security-relevant to signature correctness but called out because readers care about "is this a security-relevant delta."

**Tie-break rule**: classify against BoringSSL `HEAD` as of the AWS-LC tag cut date. A check that appears in AWS-LC `fips-202X-YY-ZZ` and is also in BoringSSL HEAD on `YYYY-MM-DD` is a **backport**; a check that appears only in AWS-LC is **hardening** or **independent** depending on whether it's a validation check or a structural addition.

Header records exact commit SHAs for both pins (use `git rev-parse`, not branch names — branches move, readers six months later need the SHA to reproduce) and the fuzz campaign start/end timestamps. This artifact stands on its own — a reader who cares about AWS-LC vs upstream can consume it without reading the fuzz writeup.

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

- **Symbol collisions at cgo link** — see §4.3.1 for the full hazard analysis (header-path ordering, duplicate-symbol resolution, ERR_* thread-local collisions). Primary mitigation `BORINGSSL_PREFIX`; fallbacks `objcopy --redefine-syms`, shared-object-with-versioned-symbols, or separate Go modules. Park-point at T+3h if unresolved.
- **FIPS-tag rotation** — the "latest FIPS tag" at session start may not match current CloudHSM firmware if AWS has rotated since. Mitigation: record tag SHA prominently; caveat explicitly as "the most recent AWS-LC FIPS tag at time of writing."
- **API surface differences** — AWS-LC may route ML-DSA through `EVP_PKEY` rather than direct `MLDSA65_*` symbols. Mitigation: shim adapts to whichever surface the FIPS tag exposes; document in fork-drift map.
- **License** — AWS-LC is ISC-licensed, same as BoringSSL. No blocker for research test-binary static linking.

## 8. Budget

**8–12 hours wall-time**, revised upward from initial 4–6h estimate after review-phase realism check. Symbol-collision debugging is the long-tail risk.

- Clone + build AWS-LC at FIPS tag: 30 min (may extend if CMake pins to specific toolchain versions)
- Resolve symbol-collision mitigation (BORINGSSL_PREFIX + verify link): **1–3 hours, variable** — first implementation step, gates everything else
- Write shim (EVP_PKEY path likely → more complex than direct-symbol path): 2–3 hours
- Retrofit 8 harnesses to 3-way: 1–2 hours
- Run fuzz suite: 30 min
- Fork-drift static-diff + writeup: 1 hour
- Cushion for debugging: 1 hour

**Park-point**: if BORINGSSL_PREFIX + `objcopy` + shared-object fallbacks all fail within T+3h of the session, accept the separate-Go-modules fallback, document the reason in the fork-drift map, and proceed with slightly degraded ergonomics. Do not burn the session on link ghosts.

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
