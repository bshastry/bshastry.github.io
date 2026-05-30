---
title: "Cross-checking the post-quantum KEM behind the web — Part 2: the BoringSSL finding and coverage"
date: 2026-04-25
excerpt: "Part 2 of 3. G1, a §7.3 hash-check gap in BoringSSL found by reading rather than fuzzing; the assurance-coverage share across the encrypted web; who each finding affects; and the Compress/Decompress clean sweep."
tags: ["post-quantum", "ml-kem", "fips-203", "differential-fuzzing", "cryptography"]
---

[Part 1](/blog/cross-checking-post-quantum-kem) \| **Part 2** \| [Part 3](/blog/cross-checking-post-quantum-kem-part-3)

> **TL;DR (Part 2 of 3).** The second filing, **G1**, came from *reading* code
> rather than fuzzing: BoringSSL's BCM-boundary `mlkem_parse_private_key`
> skipped the §7.3 `H(ek)` recompute that Go stdlib enforces. The maintainer
> called the permissive reading defensible, then tightened it anyway. This part
> also lays out the assurance-coverage share — roughly 10–15% of at-risk human
> web traffic now cross-checked — who each finding affects, and the full-domain
> Compress/Decompress sweep that came back clean.

## G1 — BoringSSL §7.3 at the BCM boundary

The second filing sits at a similar layer but a different spec clause.
FIPS 203 §7.3 step 3 requires a parse-time hash consistency check on
decapsulation keys:

> Perform the computation `test ← H(dk̄[384k:768k+32])`. If
> `test ≠ dk̄[768k+32:768k+64]`, then input checking has failed.

Go stdlib enforces it at `crypto/internal/fips140/mlkem/mlkem768.go:236–247`:

```go
ek, err := NewEncapsulationKey768(b[:EncapsulationKeySize768])
if err != nil { return nil, err }
dk.h = ek.h
b = b[EncapsulationKeySize768:]
if !bytes.Equal(dk.h[:], b[:32]) {
    return nil, errors.New("mlkem: inconsistent H(ek) in encoded bytes")
}
```

BoringSSL's `mlkem_parse_private_key` template
(`crypto/fipsmodule/mlkem/mlkem.cc.inc:857–870`, as of the 2026-04-16
tip of tree)
copied the stored hash verbatim without recomputing it from the parsed
`ek`:

```cpp
template <int RANK>
int mlkem_parse_private_key(private_key<RANK> *priv, CBS *in) {
  CBS s_bytes;
  if (!CBS_get_bytes(in, &s_bytes, encoded_vector_size(RANK)) ||
      !vector_decode(&priv->s, CBS_data(&s_bytes), kLog2Prime) ||
      !mlkem_parse_public_key_no_hash(&priv->pub, in) ||
      !CBS_copy_bytes(in, priv->pub.public_key_hash,
                      sizeof(priv->pub.public_key_hash)) ||   // (*)
      !CBS_copy_bytes(in, priv->fo_failure_secret,
                      sizeof(priv->fo_failure_secret)) ||
      CBS_len(in) != 0) {
    return 0;
  }
  return 1;
}
```

The `_no_hash` suffix at line 6 is deliberate: the public-key parser,
`mlkem_parse_public_key`, *does* compute SHA3-256 over `ek`. The
private-key path skipped that step and trusted the 32 bytes that arrived
from the caller.

Two readings of §7.3 sit under this code. The **strict** one groups the
§7.3 steps under "input checking" and points at the preamble — *"shall
not be used"* — so a parser that returns OK on a dk whose stored hash
doesn't match `H(ek_embedded)` has accepted an un-checked key. The
**permissive** one treats §7.3 as a pre-condition for `ML-KEM.Decaps`,
satisfiable either by trusted keygen provenance or by caller
re-verification; under BoringSSL's architecture, where
`include/openssl/mlkem.h` exposes seed-based import only and
`BCM_mlkem{768,1024}_parse_private_key` is reachable only at the BCM
boundary (ACVP test harness, CAST self-test, downstream BCM consumers
like AWS-LC), the permissive reading is defensible.

Filed 2026-04-21. The maintainer response picked the permissive reading
and pushed back on the spec-compliance framing — *"BoringSSL only
exposes seed-based import, which means we don't have to care about this
silly format. The parse_private_key function only exists for testing."*
— then decided to tighten the parser anyway, for consistency with a
recent ML-DSA change that had added the equivalent hash check at the
ML-DSA private-key parser. [CL 93247][crbug-cl], authored by davidben on
2026-04-22, now recomputes `H(ek)` inside the parser and rejects on
mismatch.

So G1 isn't the compliance win F1 would have been had CIRCL accepted
it; it's a parser hardening the maintainer classified as belt-and-braces
given the function's BCM-boundary reach. It was worth filing because the
code pattern — *parser copies a cached hash that a downstream operation
then trusts* — is the same shape as F1, and the same differential-reading
approach (three libraries against one spec clause) surfaced both.

## Assurance-coverage share

I'll call the metric this work tries to hold itself against
Assurance-Coverage Share (ACS): the fraction of today's encrypted human
communication whose ML-KEM library has been cross-implementation
diff-fuzzed against at least one other independent implementation at the
KEM API surface. It's a coverage number, not a soundness number. "Not
diverged under ~181M executions" is not the same as "correct," and that
evidence is about oracle-agreement on mutated input, not branch
exploration inside the C libraries (see *Known blind spots* in Part 3).

By that definition, the three web-facing libraries cover on the order
of 10–15% of Q-day-at-risk human web traffic: BoringSSL's ~8% via
Cloudflare and Chrome (the Radar-times-PQ-adoption product in [the 2025
PQ report][pq2025]), the Go 1.24+ fleet (hard to put a traffic figure
on — Kubernetes, etcd, Docker, Terraform agents, every default Go
server — but large), and CIRCL's smaller named footprint. libcrux-ml-kem
extends coverage off the web onto Signal's PQXDH path, ~40 million daily
users. Cryspen's F* proofs cover the math kernel and lower the expected
find-rate, but the cross-check still matters: the C actually linked into
Signal comes out of the Charon/Eurydice/KaRaMeL transpile, and that
encoding boundary is exactly where F1 and G1 lived. An earlier 4-way
harness ran ~10M executions over the libcrux surface with zero
divergences, superseded by the 5-way campaign below.

Adding **mlkem-native** as a fifth leg is what makes the number stick.
AWS-LC imported `pq-code-package/mlkem-native` v1.1.0 on 2026-03-16 and
shipped it in `v1.50.0`, replacing BoringSSL's
`crypto/fipsmodule/mlkem/mlkem.cc.inc` for every downstream AWS-LC
consumer. As of April 2026 those include AWS KMS (ML-KEM ops execute
inside FIPS 140-3 Level 3 HSMs), libOQS ≥ 0.13.0 (default provider, so
nginx-OQS, openssl-oqs, curl-oqs all pick it up), and rustls ≥ 0.23.28
(transitively via AWS-LC's `aws-lc-rs` default provider — essentially
every Rust TLS server on that line). It's a genuinely independent
codebase — not a BoringSSL fork, not a Rust transpile — hand-written C
with CBMC memory- and type-safety proofs on all imported C, plus
HOL-Light + s2n-bignum proofs of functional correctness *and*
constant-time for the aarch64/x86_64 asm backends at the object-code
level. The 5-way harness ran ~181M cross-library oracle calls covering
its surface with zero divergences, and the deterministic-encap
byte-equality invariant now holds across stdlib, libcrux, *and*
mlkem-native: three independent implementations of FIPS 203 Algorithm 17
produce bit-identical ciphertexts on the same `(pk, r)`.

Two steps would raise the number further. An OpenSSH `libmlkem` shim
picks up the SSH path. And the TLS-handshake matrix — the surface
adversaries on the wire actually reach — is partly done: BoGo driving
Go stdlib and BoringSSL across 34 adversarial `X25519MLKEM768` tests
(low-order X25519 point, non-canonical encap-key coefficients, key-share
padding and truncation, both client and server roles) produced zero
semantic divergences. CIRCL via the cfgo fork is the remaining leg that
turns this into a 3-way handshake matrix.


## Who this actually affects, by library

F1 and G1's blast radii are both small; the harness's coverage is not.
All five libraries showed zero divergences against each other over the
~181M cross-library oracle calls on the comparable public surface
(seed-based keygen, parse/marshal public-key, public-from-private,
encap roundtrip, decap, §7.2 validate). The per-library specifics:

  - **BoringSSL** — ~8% of the human web via Cloudflare, Chrome, and
    Android. Randomized `*_generate_key` is the one public entry point
    that admits no cross-implementation comparison (no shared input);
    the seed variant covers the deterministic equivalent. The one
    filing here, G1, sits at the BCM-boundary `mlkem_parse_private_key`
    parser (reachable via BCM symbols, not the public `mlkem.h` API)
    and was tightened post-filing in [CL 93247][crbug-cl]. AWS-LC swapped
    *its* ML-KEM out of this tree on 2026-03-16 and now routes AWS KMS,
    libOQS, and rustls through mlkem-native; BoringSSL's `mlkem.cc.inc`
    is what still ships in Chrome, Android, and the Cloudflare edge.
  - **Go stdlib `crypto/mlkem`** — every default Go HTTPS/gRPC server,
    including Kubernetes v1.33+, is implicitly on this path. It was also
    the static oracle for G1: the explicit `bytes.Equal(dk.h[:], b[:32])`
    in `mlkem768.go` is what made the BoringSSL gap visible at a read.
  - **CIRCL Go `mlkem768`** — small footprint (cfgo fork, Lux Network's
    warp messaging). Carries F1. Whether Lux's warp flow ever feeds
    `PrivateKey.Unpack` an attacker-controlled blob is not public. The
    circl#597 filing was closed wontfix ("use seed-based SKs"); the §7.2
    gap remains.
  - **libcrux-ml-kem** — Signal's PQXDH backend. Cryspen's F* proofs
    cover the Rust math kernel, not the transpiled-C encoding layer
    where F1 and G1 lived in the other libraries.
  - **mlkem-native** — AWS KMS, libOQS, rustls. Its CBMC proofs sit
    directly on the C that ends up in the archive, a stronger story
    than libcrux's F* proofs on the Rust kernel (not the extracted C).
    No filings. The library is ~16 months old; its CVE-class wrapper
    bugs (a 4-byte x86_64 rej-uniform overread, missing zeroization of
    pkpv/pk/sk) were caught and fixed before v1.1.0, and the maintainer
    lineage is the same two people who built the HOL-Light + s2n-bignum
    infrastructure it's verified against.

What this work does *not* cover: **OpenSSH ≥ 9.9 `libmlkem`** — same
`X25519MLKEM768` group, the C implementation from libmlkem, not in my
harness. A cgo shim is the next obvious move.


## A harness footnote on seed APIs

CIRCL exposes two keygen-from-seed APIs: `NewKeyFromSeedMLKEM` (adds the
FIPS 203 §5.1 domain separator byte `k=3`) and `NewKeyFromSeed`
(pre-FIPS Kyber mode, no domain separator). Same 32-byte seed, two
completely different key pairs. Not a bug — by design — but a footgun
for anyone naively wiring a differential harness at the PKE layer
against Go stdlib, which has no pre-FIPS path. Check your library's
seed API before you trust "same seed, same key" as an invariant.

## Compress / Decompress, swept end to end

`Compress_d` and `Decompress_d` use different integer approximations
between Go stdlib (Barrett-exact) and CIRCL (rational
approximations — `315/2^20` for `d=4,5`, `20642679/2^36` for `d=10,11`).
The CIRCL source comment for `d=4,5` admits "doesn't compute division by
`x/q` correctly for all inputs, but it's close enough that the end result
of the compression is correct." If that "close enough" is literally wrong
for even a single `x in [0, 3328]`, the consequence is silent decapsulation
failure via implicit rejection — a correctness bug, not a security one.

So I swept the full input domain. `d in {1, 4, 5, 10, 11}`, spec-exact
integer reference on one side, CIRCL scalar kernels on the other, Go
stdlib `compress`/`decompress` as a third oracle. Both stdlib and CIRCL
live inside `internal/` packages, so I vendored both by copy from
`field.go:42–122` and `poly.go:134–332` respectively — documented, no
modifications. 16,645 Compress inputs. 3,122 Decompress inputs. 19,767
three-way comparisons.

```
--- PASS: TestF4CompressSweep (0.00s)
--- PASS: TestF4DecompressSweep (0.00s)
PASS
```

Zero divergences. Every `x` agrees across all three oracles. The `+q/2`
rounding offset combined with the `& ((1<<d)-1)` mask makes the
approximation exact over the whole valid range, despite what the comment
suggests — the comment is conservative, not sloppy.

So Compress/Decompress is not a silent-correctness bug hiding in CIRCL,
and the only API-surface finding from this exercise remains F1. Most of
what a diff-fuzz matrix produces, if it's working, is clean negatives;
those are worth writing down too.

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
