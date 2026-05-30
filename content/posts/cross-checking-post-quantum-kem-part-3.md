---
title: "Cross-checking the post-quantum KEM behind the web — Part 3: blind spots and what's next"
date: 2026-04-26
excerpt: "Part 3 of 3. What a clean multi-way negative does and doesn't prove — the methodology's blind spots — plus the takeaway and how to reproduce the work."
tags: ["post-quantum", "ml-kem", "fips-203", "differential-fuzzing", "cryptography"]
---

[Part 1](/blog/cross-checking-post-quantum-kem) \| [Part 2](/blog/cross-checking-post-quantum-kem-part-2) \| **Part 3**

> **TL;DR (Part 3 of 3).** A clean multi-way negative is narrower than it
> sounds. This part names the methodology's blind spots — shared-correctness
> bugs, embedded-key validation, the cgo-opaque coverage problem and the
> libFuzzer-direct companion that addresses it, side channels — then closes with
> the takeaway and how to reproduce the work.

## Known blind spots of the methodology

A clean multi-way negative is narrower than it sounds. Five gaps are
worth naming:

  1. **Shared-correctness bugs.** If every library misreads the same
     spec clause, misplaces the same domain-separation byte, or shares
     the same rejection-sampling interpretation, they agree with each
     other and the fuzzer passes. The SHAKE256 external oracle
     on implicit-reject decap partially addresses this, but only on
     that one path. Shared bugs inside SampleNTT, SampleCBD, or the
     NTT/INTT kernels would not surface here. Adding libcrux as a 4th
     leg and mlkem-native as a 5th narrows the window at the §7.2
     modulus-check surface specifically — both expose the check as a
     standalone public entry point (libcrux's `validate_public_key`,
     commented upstream as "This implements the Modulus check in 7.2
     2"; mlkem-native's `check_pk`, with an explicit FIPS 203 §7.2
     docstring in `mlkem_native.h`), so that clause now has five
     independent oracles reached by five different paths with five
     different verification stories. Narrower, not zero.
  2. **FIPS 203 §7.1 Key pair check item 2** — "Check ek̄ as
     specified in Section 7.2." The embedded ek inside a dk blob
     must itself pass the §7.2 modulus check. The harness probes
     §7.2 on standalone ek (covered, now 5-way) and §7.3 item 3
     (the hash check that surfaced G1). Embedded-ek modulus
     validation is only reached indirectly via CIRCL's SK parser,
     which was a 2-way target in the Go-cgo campaign: Go stdlib's
     seed-only sk API never parses an attacker-supplied embedded
     ek, BoringSSL exposes no public SK-bytes-import, libcrux's
     `validate_private_key_only` implements §7.3 item 3 (hash
     check) only — it does not additionally call
     `validate_public_key` on the embedded ek — and mlkem-native's
     `check_sk` likewise runs only the §7.3 hash check without
     re-validating the embedded ek's §7.2 modulus.

     The libFuzzer-direct companion (see *Reproducing this work*)
     subsequently reached BoringSSL's BCM-only
     `mlkem_parse_private_key` via a thin C-ABI wrapper around
     `BCM_mlkem768_parse_private_key` and fuzzed mlkem-native's
     `check_sk` against it three-way with libcrux's decap as a
     third oracle. The campaign confirmed F1's defect class on a
     **second** sk component: BoringSSL's BCM parser applies the
     §7.2 modulus check to both the embedded ek bytes *and* the
     `dkPKE` polynomial bytes (the K-PKE secret-key vector ŝ,
     bytes `[0, 1152)`). mlkem-native, libcrux, and CIRCL all
     omit the check on `dkPKE` too — mlkem-native's `check_sk`
     doesn't decode `dkPKE` at all (it's a §7.3 H(ek)-only
     check); libcrux's decap is total; CIRCL's
     `cpapke.PrivateKey.Unpack` silently `Normalize()`s mod q.

     Aggregating across both harnesses, the 5-way picture on §7.2
     *as applied to embedded sk components* (standalone-ek §7.2 is
     enforced by all five libraries via their public `check_pk` /
     `validate_public_key` / equivalent entry points — see F1 and
     the harness scope above) is:

     | Impl | dkPKE coef check (sk-internal) | Embedded-ek coef check (sk-internal) |
     |---|---|---|
     | mlkem-native | omitted | omitted |
     | libcrux | omitted | omitted |
     | CIRCL | omitted (`Normalize()`) | omitted (F1) |
     | BoringSSL | enforced (`vector_decode<kLog2Prime>`) | enforced |
     | Go stdlib | enforced | enforced |

     Three-of-five at the §7.3 minimum, two-of-five at §7.3 +
     §7.2-style defense-in-depth on the embedded sk components.
     Cloudflare's `invalid` disposition on F1 establishes the
     §7.3-minimum stance as spec-compliant; by the same argument,
     mlkem-native and libcrux are spec-compliant on this clause
     too. The 5-way picture is interop-relevant — multi-library
     deployments that mix a §7.3-minimum validator with a
     §7.2-strict consumer will see accept/reject splits on
     non-canonical sk imports, the same protocol-desync hazard
     F1's threat-model section called out — but it remains
     interop-class, not a vulnerability.
  3. **ML-KEM-512 is 2-way only.** The harness covers 768 and 1024 at
     5-way. 512 still runs CIRCL-vs-stdlib; no BoringSSL leg, and
     libcrux's portable C extract does not ship 512 either.
     (mlkem-native *does* ship 512 in the multilevel archive but the
     harness doesn't call it, matching the 4-way's original scope.)
  4. **Corpus depth and the cgo-opaque coverage problem.** Go's native
     fuzzer is coverage-guided on the *Go* side: it instruments Go
     branches and mutates toward inputs that expand the bitmap. The C
     libraries are called across the cgo boundary and return bytes;
     their branch coverage never reaches the mutation scheduler. Each
     harness body is roughly a hundred lines of Go, mostly
     `bytes.Equal` checks, so the Go bitmap saturates within about a
     minute — the "new interesting" counter plateaus in the first 60s
     and sits flat for the remaining 120s of every run, after which
     executions are uninformed random inputs into the cgo boundary
     rather than coverage-directed mutations. So the ~181M figure is an
     honest count of cross-library oracle-agreement checks on
     differentiated input — the right metric for *differential*
     fuzzing, where a byte divergence surfaces regardless of how the
     mutation was chosen — but it is **not** a coverage claim about the
     underlying C. The five libraries have roughly 1500–3000 lines of C
     each, plus libcrux's 370 KB extracted-C tree with monomorphised
     K=2/3/4 instances, all with deep branching through SampleNTT,
     SampleCBD, NTT/INTT, Barrett reduction, and polynomial
     encode/decode that the Go fuzzer cannot see. A libFuzzer harness
     compiled directly against the C static libs with SanitizerCoverage
     + ASan drives mutation from C-branch feedback and reaches orders
     of magnitude more effective coverage per exec — the next arc.

     The companion libFuzzer-direct project has since executed that
     arc on the 3-way mlkem-native / libcrux / BoringSSL slice of the
     matrix. A 5-minute × 11-process campaign per harness (keygen,
     encap, decap) produced **77.7 million C-branch-driven**
     cross-implementation oracle calls, with **zero primary-correctness
     divergences** and mlkem-native at **89.95% line coverage** on its
     ML-KEM kernel files (the unreached fraction is configuration-gated
     dead code: RNG-failure paths unreachable from `_derand`,
     `MLK_CONFIG_KEYGEN_PCT` build-disabled, custom-allocator paths
     off). libcrux and BoringSSL settle around 60% line on their
     respective ML-KEM files, the gap being mostly K=2 / K=4
     monomorphisations the K=3 harness never reaches. The full report
     is at `docs/fuzz-audit-report-mlkem-2026-04-28.md` in the
     libFuzzer-direct companion. The headline negative — no
     primary-correctness divergences across either harness — now
     holds at both API-level oracle agreement (181M, this post) and
     at C-branch coverage (77.7M, the companion).

     A 24-hour scale-up of the same 3-way harness on rented Hetzner
     Cloud compute (CCX33, 8 vCPU, total spend ~€3.10)
     extended the C-branch-driven count to **~1.47 billion** aggregate
     cross-implementation oracle calls, with **zero**
     primary-correctness divergences and **25,461** unique
     tier-1 strictness-disagreement entries (the bounded mn-vs-bssl
     §7.2-on-dkPKE class characterised in the *embedded-sk-validation
     blind spot* above; the harness logs these via
     dedup-by-`sk[0..8]` plus a per-process 50k-entry cap, so the
     file stayed at ~3.5 MB rather than the unbounded ~50 GB it would
     otherwise have grown to). Coverage held at the same plateau as
     the 5-minute audit — mlkem-native at 89.95% line on its ML-KEM
     kernel files, libcrux and BoringSSL at the
     K=2/K=4-dead-code-drag-bounded ~60% each.
     End-to-end setup (apt install → upstream clones → build → CCTV
     ingest → 24 h campaign) is documented at
     `docs/cloud-rental-howto.md` in the libFuzzer-direct repo; the
     underlying spec-clean negative scales linearly with budget.
  5. **Side channels.** Timing divergences, memory-access-pattern
     leaks, and any non-byte-level signal are not in scope. The
     harness makes no constant-time claims — byte-level diff-fuzz
     literally cannot make them.

None of these invalidate the clean negatives; they bound what the
negatives actually mean. The methodology finds the shape of F1 (two
libraries disagree on the same input) and the shape of G1 (one
library's check, read against another's enforcement, reveals the
gap). It doesn't find bugs where everyone is wrong together, bugs
below the byte layer, or bugs at API surfaces this harness doesn't
wrap.


## Takeaway

Diff-fuzz is the cheap insurance on a crypto migration. Pick the
libraries with the most traffic behind them. Wire them into one
harness. Run until an oracle disagrees or you run out of clock.

The API-surface oracle disagreed once, at CIRCL's expanded-SK parser:
F1, a compliance gap, not a vulnerability. It did not disagree anywhere
else, across ~181M cross-implementation oracle calls at the public
KEM-API surface, a full-domain sweep of Compress and Decompress, and
the 2-way BoGo matrix at the TLS-handshake surface — all clean, read
against the caveat in *Known blind spots* about what that count does
and does not prove. The second filing, G1, came from applying the same
methodology by static reading rather than byte-level fuzzing —
BoringSSL's `mlkem_parse_private_key` against Go stdlib's explicit
`H(ek)` equality check — and was tightened voluntarily for parity with
an earlier ML-DSA change. Two filings, two outcomes, both from holding
independent libraries against the same spec clauses.

Byte-equivalence between two libraries has a known blind spot: both can
be wrong the same way, agree, and pass. To close that I reconstructed
FIPS 203 Algorithm 18 step 7 — `K̄ := J(z || c)` with SHAKE256 —
directly in the test and compared each library's implicit-reject decap
output against that external oracle independently. Across ten thousand
random-invalid ciphertexts, both Go stdlib and BoringSSL matched it
bit-for-bit: a third oracle that doesn't route through either library
agreeing with the other.

What isn't covered: OpenSSH's `libmlkem` carries the SSH fleet and is
still not in the harness. CIRCL is in the KEM-API diff-fuzz but not the
BoGo handshake matrix — adding the cfgo fork makes it 3-way. libcrux
and mlkem-native are in at the KEM primitive layer, but Signal's PQXDH
handshake and AWS KMS's RPC sit a level above and haven't been
diff-fuzzed at the protocol surface. Each is a scoped unit of work that
raises the coverage number.

Filed issues: [cloudflare/circl#597][issue],
[issues.chromium.org/504820808][crbug].

## Reproducing this work

The 5-way diff-fuzz harness — Go-cgo-driven, targeting the public
KEM-API surface of all five libraries — is open source at
**private; available on request** under Apache 2.0. The repo carries
the cgo shims for all five libraries, the full 5-way harness set,
build scripts that pin each upstream library to the exact SHA tested
here (BoringSSL `eaaf6a8e…` (ToT 2026-04-16), CIRCL v1.6.3, Go stdlib
1.26, libcrux-ml-kem `d979ce59…`, mlkem-native v1.1.0 `d2cae2be…`), a
reproducible `make` entry point that clones + builds + runs the
full campaign, and the methodology note from this post in
`docs/`.

The libFuzzer-direct-against-C companion that addresses the cgo-opaque
coverage gap — SanitizerCoverage-instrumented, symbol-namespaced so all
five libs co-link in one binary — is a separate project, also
**private; available on request**. It's newer, exercises the C at the
branch level rather than the API level, and is the right fit for
coverage-driven exploration rather than differential oracle agreement.
It's also what extended F1's defect class to mlkem-native and libcrux on
the `dkPKE` polynomial-bytes path. Its first audit report,
`docs/fuzz-audit-report-mlkem-2026-04-28.md`, is the quantitative
complement to this series: 77.7 million C-branch-driven oracle calls
across the 3-way slice, zero primary-correctness divergences,
mlkem-native at 89.95% line coverage on its ML-KEM kernel files.

## References

- FIPS 203 — [NIST FIPS 203 PDF][fips203]
- Cloudflare, *The state of the post-quantum Internet in 2025* — [blog.cloudflare.com/pq-2025][pq2025]
- Cloudflare Radar 2025 Year in Review — [radar.cloudflare.com/year-in-review/2025][radar2025]
- CIRCL PR #470 — *Add ML-KEM (FIPS 203)*, [cloudflare/circl#470][pr470]
- CIRCL PR #507 — *Add ML-KEM decapsulation key check*, [cloudflare/circl#507][pr507]
- Chromium Issue Tracker #504820808 — *mlkem_parse_private_key: FIPS 203 §7.3 step 3 hash-check question*, [issues.chromium.org/504820808][crbug]
- BoringSSL CL 93247 — *Check hashes when parsing test-only, semi-expand ML-KEM private keys*, [boringssl-review.googlesource.com/93247][crbug-cl]
- C2SP/CCTV ML-KEM negative test vectors — [C2SP/CCTV][cctv]
- Filippo Valsorda, *Post-quantum Cryptography for the Go Ecosystem* — [words.filippo.io/mlkem768][filippo]
- Filippo Valsorda, *ML-KEM seeds* — [words.filippo.io/ml-kem-seeds][seeds]
- Quarkslab on HQC diff-fuzzing (CVE-2024-54137) — [Quarkslab blog][qb]
- Fenzi, Gilcher, Virdia, *Finding Bugs and Features Using Cryptographically-Informed Functional Testing*, TCHES 2026 — [eprint/2024/1122][tches]
- Guido Vranken, *Cryptofuzz — differential fuzzing of cryptographic libraries* — [github.com/guidovranken/cryptofuzz][cryptofuzz]. The canonical diff-fuzz project for classical crypto (AES / SHA / HMAC / RSA / ECC across BoringSSL, OpenSSL, libsodium, Botan, wolfCrypt, etc.); runs under OSS-Fuzz. As of this writing it does not yet cover ML-KEM, which is the gap this work fills.
- Cryspen libcrux — [github.com/cryspen/libcrux][libcrux]
- pq-code-package/mlkem-native — [github.com/pq-code-package/mlkem-native][mlkemnative]
- mlkem-native v1.1.0 release notes — [github.com/pq-code-package/mlkem-native/releases/tag/v1.1.0][mlkemnative-v110]
- AWS-LC PR #3090 — *Import mlkem-native v1.1.0 into crypto/fipsmodule/ml_kem*, [github.com/aws/aws-lc/pull/3090][mlkemnative-awslc-pr]
- Signal PQXDH specification — [signal.org/docs/specifications/pqxdh][pqxdh]
- Algorand, *Pioneering Falcon Post-Quantum Technology on Blockchain* — [algorand.co][algofalcon]
- Circle, *How Blockchains are Preparing for Quantum Computing* — [circle.com/blog/preparing-blockchains-for-q-day][circlepq]
- QRL, *Project Zond* — [theqrl.org/project-zond][qrlzond]
- Craig Gidney (Google Quantum AI), *How to factor 2048 bit RSA integers with less than a million noisy qubits* — [arXiv:2505.15917][gidney]

[issue]: https://github.com/cloudflare/circl/issues/597
[pr470]: https://github.com/cloudflare/circl/pull/470
[pr507]: https://github.com/cloudflare/circl/pull/507
[cctv]: https://github.com/C2SP/CCTV/tree/main/ML-KEM
[filippo]: https://words.filippo.io/mlkem768/
[seeds]: https://words.filippo.io/ml-kem-seeds/
[fips203]: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf
[qb]: https://blog.quarkslab.com/finding-bugs-in-implementations-of-hqc-the-fifth-post-quantum-standard.html
[tches]: https://eprint.iacr.org/2024/1122
[pq2025]: https://blog.cloudflare.com/pq-2025/
[radar2025]: https://radar.cloudflare.com/year-in-review/2025
[crbug]: https://issues.chromium.org/504820808
[crbug-cl]: https://boringssl-review.googlesource.com/93247
[cryptofuzz]: https://github.com/guidovranken/cryptofuzz
[libcrux]: https://github.com/cryspen/libcrux
[mlkemnative]: https://github.com/pq-code-package/mlkem-native
[mlkemnative-v110]: https://github.com/pq-code-package/mlkem-native/releases/tag/v1.1.0
[mlkemnative-awslc-pr]: https://github.com/aws/aws-lc/pull/3090
[pqxdh]: https://signal.org/docs/specifications/pqxdh/
[algofalcon]: https://algorand.co/blog/pioneering-falcon-post-quantum-technology-on-blockchain
[circlepq]: https://www.circle.com/blog/preparing-blockchains-for-q-day
[qrlzond]: https://www.theqrl.org/project-zond/
[gidney]: https://arxiv.org/abs/2505.15917
