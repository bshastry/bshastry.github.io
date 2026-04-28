---
title: "Cross-checking the post-quantum KEM behind the web"
date: 2026-04-24
excerpt: "Five ML-KEM libraries, one diff-fuzz harness, one BoGo handshake matrix, one SHAKE256 external oracle, two upstream filings — circl#597 (wontfix on policy) and chromium/504820808 (voluntarily tightened)."
tags: ["post-quantum", "ml-kem", "fips-203", "differential-fuzzing", "cryptography"]
---

## Roughly one in twelve

Roughly one in every twelve human web connections right now rides
`X25519MLKEM768` — a hybrid post-quantum key exchange hedging against the
day somebody finishes a cryptographically relevant quantum computer. The
hedge only holds if both halves are correctly implemented, and if the
two ends of the channel agree on which inputs to accept.

Five libraries sit behind essentially all of that traffic — three on
the web, one in secure messaging, and one under AWS KMS and the Rust
TLS fleet:

  - BoringSSL — Chrome, Android, and Cloudflare's edge. The ~60% figure in
    Cloudflare's [2025 PQ report][pq2025] multiplies out to roughly 8% of
    the global human web ([Radar 2025][radar2025]).
  - Go 1.24+ `crypto/mlkem` — every default Go HTTP/gRPC/SSH server,
    Kubernetes v1.33+ control plane, most Go-based infrastructure.
  - Cloudflare's CIRCL `kem/mlkem/mlkem768` — cfgo fork, Lux Network's
    warp bridge, a long tail of Go applications.
  - Cryspen's **libcrux-ml-kem** — Signal's [PQXDH][pqxdh] backend,
    roughly 40 million daily users, billions of messages a day.
    Rust-native, formally verified by Cryspen against a spec model in
    F*, and exposed to downstream consumers (Signal, Microsoft
    SymCrypt) as auto-generated portable C via the
    Charon/Eurydice/KaRaMeL pipeline.
  - **pq-code-package/mlkem-native** — AWS KMS's ML-KEM, the default in
    libOQS (≥ 0.13.0), and the ML-KEM backing rustls (≥ 0.23.28, via
    AWS-LC's [2026-03-16 import][mlkemnative-awslc-pr] of upstream
    v1.1.0). Pure C, CBMC-verified on the C, HOL-Light + s2n-bignum
    verified on the aarch64 / x86_64 asm for functional correctness
    *and* constant-time. Maintained by Hanno Becker (AWS) and Matthias
    Kannwischer (zeroRISC); hosted under the PQCA / Linux Foundation
    consortium.

I also run a small scraper over Reddit, Ethereum Magicians, and a few
other feeds to flag security topics trending in web3. It kept surfacing
post-quantum — [Algorand's Falcon mainnet numbers][algofalcon],
[Circle's roadmap][circlepq], [QRL's testnet][qrlzond],
[Google's quantum threat paper][gidney]. Almost all of that is the
signature side (ML-DSA, Falcon), which is a different library set. But
it was enough of a nudge to go look at the KEM side, which is where the
actual deployed traffic is.

So I wired the five libraries into a single diff-fuzz harness.
Roughly 181 million cross-implementation oracle calls across the
EK/SK/encap/decap surface, plus a full-domain integer sweep over
Compress and Decompress. The 181M is an exec count, not a coverage
claim — more on that in *Known blind spots* below. Two spec-tightness
questions came out of the exercise — one from byte-level divergence
in the harness, one from static reading against the same spec
clauses — each filed upstream, each resolved differently.

**F1** — [cloudflare/circl#597][issue] — is a §7.2 modulus-check bypass
in CIRCL's expanded-SK parser, caught by the harness as a byte-level
accept/reject divergence against Go stdlib. Closed wontfix on policy
grounds (use seed-based keygen, not expanded-SK imports).

**G1** — [issues.chromium.org/504820808][crbug] — is a §7.3 H(ek)
hash-check gap in BoringSSL's `mlkem_parse_private_key`, found not via
byte divergence but by reading the BoringSSL parser against Go stdlib's
explicit equality check at the same layer. The maintainer called the
permissive reading defensible — the function is reachable only at the
BCM boundary, not from the public `mlkem.h` API — then tightened it
anyway in [CL 93247][crbug-cl] for parity with a recent ML-DSA parser
change.

No CVE, no CVSS, no advisory on either one. The interesting story is
mostly what *didn't* diverge; the two filings are the receipt that the
methodology produced something.

## Disclaimer

I am not a post-quantum cryptographer. I can't evaluate the mathematical
security of Module-LWE, the lattice problem ML-KEM reduces to — that's a
different discipline. What I can do is read a rule in a 100-page spec
carefully, line it up against two implementations, and write a small harness
when they disagree.

The technique generalizes. Diff fuzzing doesn't care whether you can do the
math. It treats two implementations as oracles of each other and leans on the
fact that *they should not disagree*. If they do, somebody is wrong. The
fuzzer doesn't know which one. That's a problem for the spec authors and the
maintainers.

## F1 — the one defect the harness caught

Here is the concrete finding. FIPS 203 defines two MUST-level
input-validation checks on decapsulation-key bytes, one in each of two
adjacent clauses:

1. **§7.3 item 3 — hash check (Eq 7.2).** `H(ek_embedded)` inside the
   decapsulation key must equal the cached 32-byte hash stored alongside it.
2. **§7.2 item 2 — modulus check (Eq 7.1).** Every 12-bit coefficient of
   the embedded encapsulation key must be in `[0, q)` with `q = 3329`.
   Equivalently: `ByteEncode_12(ByteDecode_12(ek)) == ek`.

An ML-KEM public key is 1184 bytes encoding 768 twelve-bit coefficients.
Twelve bits can hold 4095; the prime is 3329. Values in `[3329, 4095]` are
representable on the wire but mathematically non-canonical. The §7.2 check
says: if you see one, reject.

## The PR that did half of it

CIRCL's `PrivateKey.Unpack` used to implement neither. In August 2024,
[PR #507][pr507] by `bwesterb` added clause (1), the §7.3 `H(pk)` equality,
and shipped it as "Add ML-KEM decapsulation key check." The PR title reads as
if it covered both input-validation clauses; the implementation delivered
only §7.3. The §7.2 modulus check at clause (2) was not added.

The embedded public-key bytes in `PrivateKey.Unpack` flow through
`cpapke.PublicKey.Unpack`, which silently `Normalize()`s coefficients mod `q`
and returns no error. There is a sibling method,
`cpapke.PublicKey.UnpackMLKEM`, that does implement the §7.2 check — it
repacks and byte-compares. `PrivateKey.Unpack` does not call it.

The KEM-layer `PublicKey.Unpack` (same file) *does* call the strict
`UnpackMLKEM`. So the public-key path on the KEM layer is compliant. The
private-key path is not.

## Why the H(pk) check doesn't save you

The tempting read is: "if the modulus check is missing but the hash check is
there, a tampered `ek` has the wrong hash, so the whole thing still gets
rejected." It doesn't. `H(pk)` is computed over the *raw caller-supplied*
encapsulation-key bytes on both `Pack` and `Unpack`. The relevant lines:

```go
// kem/mlkem/mlkem768/kyber.go, PrivateKey.Unpack, ~line 219
var hpk [32]byte
h := sha3.New256()
h.Write(buf[:cpapke.PublicKeySize])   // raw caller bytes
h.Read(hpk[:])
buf = buf[cpapke.PublicKeySize:]
copy(sk.hpk[:], buf[:32])             // claimed hash, also caller bytes
...
if !bytes.Equal(hpk[:], sk.hpk[:]) {
    return kem.ErrPrivKey
}
```

Both sides of the equality are derived from the attacker-supplied buffer. A
fabricated SK with a non-canonical `ek` embed simply writes
`SHA3-256(tampered_ek)` into the `hpk` slot and the check passes.
`Pack` has the mirror property — it writes `sk.hpk` verbatim — so the
fabricated blob is its own fixed point. No oracle, no side channel, no SHA3
preimage. Just symmetry.

## The demo

Start from a real CIRCL keypair. Serialize. Flip coefficient 0 of the
embedded encapsulation key to `q = 3329` (one coefficient past the modulus).
Recompute `H(pk)` over the tampered bytes so clause (1) still passes. Feed
the result to `PrivateKey.Unpack`. Feed the same 1184 ek bytes to the strict
`UnpackMLKEM` as a cross-oracle.

```go
// tamperEKFirstCoefficientTo writes v into the first 12-bit coefficient
// slot of an ML-KEM encapsulation key.
func tamperEKFirstCoefficientTo(ek []byte, v uint16) {
    ek[0] = byte(v & 0xff)
    ek[1] = (ek[1] & 0xf0) | byte((v>>8)&0x0f)
}

func TestFIPS203_7_2_Bypass_In_PrivateKey_Unpack(t *testing.T) {
    _, sk, _ := mlkem.GenerateKeyPair(rand.Reader)
    var packed [mlkem.PrivateKeySize]byte
    sk.Pack(packed[:])

    // Layout: [ cpapke_sk | cpapke_pk | H(pk) | z ]
    ekStart := cpapke.PrivateKeySize
    ekEnd   := ekStart + cpapke.PublicKeySize
    hpkEnd  := ekEnd + 32

    // Coefficient 0 = q. Non-canonical per FIPS 203 §7.2.
    tamperEKFirstCoefficientTo(packed[ekStart:ekEnd], 3329)

    // Recompute cached H(pk) over the tampered bytes.
    h := sha3.New256()
    h.Write(packed[ekStart:ekEnd])
    copy(packed[ekEnd:hpkEnd], h.Sum(nil))

    // PrivateKey.Unpack must reject per §7.2. It doesn't.
    var tampered mlkem.PrivateKey
    if err := tampered.Unpack(packed[:]); err != nil {
        t.Fatalf("not reproduced: %v", err)
    }

    // Strict oracle: same bytes, strict path, correctly rejected.
    var strictPK cpapke.PublicKey
    if err := strictPK.UnpackMLKEM(packed[ekStart:ekEnd]); err == nil {
        t.Fatal("UnpackMLKEM unexpectedly accepted non-canonical EK")
    }
}
```

```
$ go test -v -run TestFIPS203_7_2_Bypass_In_PrivateKey_Unpack
--- PASS: TestFIPS203_7_2_Bypass_In_PrivateKey_Unpack (0.00s)
PASS
```

Same behavior on `v1.6.3` and on master (`9798df7`, 2026-04-02). All three
parameter sets (`mlkem512`, `mlkem768`, `mlkem1024`) share the pattern; they
are generated from the same template.

The one-line fix:

```diff
 sk.pk = new(cpapke.PublicKey)
-sk.pk.Unpack(buf[:cpapke.PublicKeySize])
+if err := sk.pk.UnpackMLKEM(buf[:cpapke.PublicKeySize]); err != nil {
+    return err
+}
```

## Not a vulnerability — the threat model

This is worth saying plainly: under any reasonable threat model, a missing
§7.2 modulus check in `PrivateKey.Unpack` is not a vulnerability. CIRCL's own
keygen emits canonical keys. Non-canonical SK bytes can only come from:

  - **(a) a peer ML-KEM implementation with its own bug** — CIRCL silently
    fixes their output, and the peer's bug stays hidden,
  - **(b) an actor with write access to SK storage** — who already has
    game-over capability and can substitute any key they like, or
  - **(c) corruption.**

In (b) the defect gives the attacker nothing new. The genuine real-world
bite is (a): CIRCL masks §7.2 violations in peer implementations, so
downstream bugs stay invisible. The secondary bite is mixed-library
deployments — CIRCL vs Go stdlib `crypto/mlkem`, vs BoringSSL, vs
libcrux-ml-kem — will disagree on accept/reject for the same SK bytes, which
is a protocol-desync hazard in key migration, multi-party, and backup-export
flows.

That's why the upstream filing is tagged "compliance defect," not
"vulnerability." No CVE, no CVSS, no embargo. It was filed as a public issue.

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
(`crypto/fipsmodule/mlkem/mlkem.cc.inc:857–870`, as of the 2026-04-16 ToT)
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
re-verification; under BoringSSL's architecture, where `include/openssl/
mlkem.h` exposes seed-based import only and `BCM_mlkem{768,1024}_parse_
private_key` is reachable only at the BCM boundary (ACVP test harness,
CAST self-test, downstream BCM consumers like AWS-LC), the permissive
reading is defensible.

Filed 2026-04-21. The maintainer response picked the permissive reading
and pushed back on the spec-compliance framing — *"BoringSSL only
exposes seed-based import, which means we don't have to care about this
silly format. The parse_private_key function only exists for testing."*
— then decided to tighten the parser anyway, for consistency with a
recent ML-DSA change that had added the equivalent hash check at the
ML-DSA private-key parser. [CL 93247][crbug-cl], authored by davidben on
2026-04-22, now recomputes `H(ek)` inside the parser and rejects on
mismatch.

So G1 is not a compliance win in the shape F1 would have been if CIRCL
had accepted it; it's a parser hardening the maintainer classified as
belt-and-braces given the function's BCM-boundary reach. Worth filing
because the code pattern — *parser copies a cached hash that a
downstream operation then trusts* — is the same shape as F1, and the
same differential-reading approach (three libraries against one spec
clause) surfaced both.

## Assurance-coverage share

The metric I've been trying to hold this work against is something I'll
call Assurance-Coverage Share, or ACS: the fraction of today's
encrypted human communication whose ML-KEM library has been
cross-implementation diff-fuzzed against at least one other independent
implementation at the KEM API surface. It is a coverage number, not a
soundness number. "Not diverged under ~181M executions" is not the same
thing as "correct." It is the evidence we actually have, and — as
*Known blind spots* spells out below — that evidence is about
oracle-agreement on randomly-mutated input, not about branch
exploration inside the C libraries themselves.

By that definition, the three web-facing libraries cover on the order
of 10–15% of Q-day-at-risk human web traffic: BoringSSL's share via
Cloudflare and Chrome (~8% of the human web, from the
Cloudflare-Radar-times-PQ-adoption product in [the 2025 PQ
report][pq2025]), plus the Go 1.24+ fleet (hard to put a traffic-%
figure on — Kubernetes, etcd, Docker, Terraform agents, every
default-configured Go server — but large), plus CIRCL's smaller but
named footprint. Adding libcrux-ml-kem extends coverage off the web
and onto Signal's messaging path: roughly 40 million daily users,
billions of encrypted messages a day through PQXDH. Cryspen's formal
verification against the Rust kernel lowers the expected find-rate —
F* proofs cover the math — but the cross-check still matters, because
the C actually linked into Signal comes out of the
Charon/Eurydice/KaRaMeL transpile pipeline, and that encoding boundary
is exactly where F1 and G1 lived in the other libraries. The 4-way
harness ran ~10M cross-library executions over the libcrux surface
with zero divergences.

Adding **mlkem-native** as a fifth leg is what makes the coverage
number stick. AWS-LC imported `pq-code-package/mlkem-native` v1.1.0 on
2026-03-16 and shipped it in release `v1.50.0`, replacing BoringSSL's
`crypto/fipsmodule/mlkem/mlkem.cc.inc` as the ML-KEM implementation
for every downstream AWS-LC consumer. As of April 2026 those consumers
include AWS KMS (ML-KEM keys live under FIPS 140-3 Level 3 HSMs; the
ML-KEM ops execute inside the validated module), libOQS ≥ 0.13.0 (where
mlkem-native is the default provider and the reference libOQS-built
servers like nginx-OQS, openssl-oqs, and curl-oqs all pick it up), and
rustls ≥ 0.23.28 (transitively via AWS-LC's `aws-lc-rs` default crypto
provider, which means essentially every Rust TLS server updated to
that line). mlkem-native is a genuinely independent codebase — not a
BoringSSL fork, not a Rust transpile — hand-written C with CBMC
memory-safety and type-safety proofs on all imported C, plus HOL-Light
+ s2n-bignum proofs of functional correctness *and* constant-time for
the aarch64 and x86_64 asm backends at the object-code level. Its
primary contributors are Hanno Becker (AWS Principal Applied
Scientist) and Matthias Kannwischer (zeroRISC); the project is hosted
by the PQCA at the Linux Foundation. The 5-way harness ran ~181M
cross-library oracle calls covering the mlkem-native surface — at
180 seconds per harness across seven harnesses, read against the
caveat in *Known blind spots* below — with zero divergences, and the
three-library deterministic-encap byte-equality invariant now holds
across stdlib, libcrux, *and* mlkem-native on the same `(pk, r)` —
three independent implementations of FIPS 203 Algorithm 17 produce
bit-identical ciphertexts on the same inputs.

Two further steps still raise the number. An OpenSSH `libmlkem` shim
picks up the SSH money path. And the TLS-handshake-level matrix — the
surface adversaries on the wire actually reach — is now partly done:
BoGo driving Go stdlib and BoringSSL across 34 adversarial
`X25519MLKEM768` tests (low-order X25519 point, non-canonical
encap-key coefficients, key-share padding and truncation, both client
and server roles) produced zero semantic divergences. CIRCL via the
cfgo fork is the remaining leg; wiring it in is what turns this into
a 3-way handshake matrix.

## Why the gap survived

A few structural reasons:

  1. **Layer isolation.** PR #470 added `UnpackMLKEM` as the FIPS 203 layer
     and placed the §7.2 check there. The pre-existing Kyber `Unpack` stayed
     unchanged. PR #507 then added the §7.3 hash check to `PrivateKey.Unpack`
     but routed the embedded `ek` through the older, non-checking `Unpack`.
     The two PRs were each self-consistent; the composition was not.
  2. **ACVP under-testing.** Both CIRCL and Go stdlib run NIST ACVP `AFT`
     (encapsulation) and `VAL` (decapsulation) vectors. Neither lists the
     `encapsulationKeyCheck` capability, which is the ACVP mode that
     exercises §7.2 rejection with non-canonical keys. Opt-in. Nobody opted.
  3. **The C2SP/CCTV negative vectors exist but aren't in CI.** Filippo
     Valsorda's `modulus/` vectors at [C2SP/CCTV][cctv] exercise exactly
     this clause ("every value from 3329 to 2^12-1, every coefficient
     position"). He has written that these vectors "identified a defect in
     a major implementation." Whether that defect was F1 in CIRCL or
     something else is not public. Either way, neither CIRCL's nor Go
     stdlib's CI ingests them.
  4. **Reachability is indirect.** `PrivateKey.Unpack` is not the common
     path — most users create keys from seeds via `NewKeyFromSeedMLKEM`
     (Valsorda's [ML-KEM seeds][seeds] argument). `Unpack` is reached when
     a caller deserializes the 2400-byte expanded NIST format — a rarer
     but legitimate surface.

Taken together: §7.2 is under-tested across the ecosystem, not just in CIRCL.
The mode exists in ACVP. Almost nobody exercises it.

## Who this actually affects, by library

F1 and G1's blast radii are both small. The harness's coverage is not.
Separate those two things:

  - **BoringSSL** — protects roughly 8% of the global human web via
    Cloudflare plus Chrome plus Android. Zero divergences against Go
    stdlib, CIRCL, libcrux, *and* mlkem-native across the cross-lib-
    comparable public `mlkem.h` surface — seed-based keygen,
    parse/marshal public-key, public-from-private, encap roundtrip,
    decap — over ~181M cross-library oracle calls. Randomized
    `*_generate_key` is the
    one public entry point that doesn't admit cross-implementation
    comparison (no shared input); the seed variant covers the
    deterministic equivalent. The one filing here, G1, sits at the
    BCM-boundary `mlkem_parse_private_key` parser (reachable via BCM
    symbols, not from the public `mlkem.h` API) and was tightened
    post-filing in [CL 93247][crbug-cl] for parity with a recent
    ML-DSA parser change. Note that AWS-LC — BoringSSL's most prominent
    downstream fork — swapped *its* ML-KEM out of this tree on
    2026-03-16 and now routes AWS KMS, libOQS, and rustls through
    mlkem-native (see below); BoringSSL's `mlkem.cc.inc` is the
    implementation that still ships in Chrome, Android, and the
    Cloudflare edge.
  - **Go stdlib `crypto/mlkem`** — Go 1.24+ enables `X25519MLKEM768` by
    default in `crypto/tls`. Every default-configured Go HTTP/gRPC/SSH
    server is implicitly on this path, including Kubernetes v1.33+.
    Same clean result across the same comparable surface. Go stdlib was also the
    static oracle against which G1 was identified — the explicit
    `bytes.Equal(dk.h[:], b[:32])` in `mlkem768.go` is what made the
    BoringSSL gap visible at a read.
  - **CIRCL Go `mlkem768`** — small deployment footprint. Cloudflare's
    cfgo toolchain fork for experimental PQ work; Lux Network's
    cross-chain warp messaging. Carries F1. Whether Lux's warp flow
    ever feeds `PrivateKey.Unpack` an attacker-controlled blob is not
    public. The public filing at circl#597 was closed wontfix on
    policy grounds ("use seed-based SKs"); the §7.2 gap remains.
  - **libcrux-ml-kem** — Signal's PQXDH backend, ~40M daily users,
    billions of messages a day. Rust-native; the C linked here is the
    Charon/Eurydice/KaRaMeL extract that Signal and Microsoft SymCrypt
    consume. Zero divergences against the other four libraries over
    the same ~181M 5-way cross-library oracle calls at the seed-keygen
    / encap / decap / §7.2-validate surface. Cryspen's F* proofs cover
    the Rust math kernel, not the transpiled-C encoding layer — which
    is exactly where F1 and G1 lived in the other libraries.
  - **mlkem-native** — AWS KMS, libOQS (as of ≥ 0.13.0, default),
    rustls (as of ≥ 0.23.28, transitively via AWS-LC). Pure C,
    CBMC-verified memory / type safety on all imported C, plus
    HOL-Light + s2n-bignum functional-correctness and constant-time
    proofs on the aarch64 and x86_64 asm backends at the object-code
    level. This is a stronger formal-verification story than libcrux
    delivers on the *C that gets compiled and linked* — libcrux's F*
    proofs cover the Rust kernel but not the extracted C, whereas
    mlkem-native's CBMC proofs sit directly on the C that ends up in
    the archive. Zero divergences against the other four libraries
    over ~181M 5-way cross-library oracle calls across the full
    seed-keygen / parse-public-key / §7.2-validate / encap / decap
    surface, plus a three-way
    deterministic-encap byte-equality invariant with stdlib and
    libcrux that held exactly on every `(pk, r)` we threw at it. No
    filings. The library is ~16 months old, has had its CVE-class
    wrapper bugs (a 4-byte x86_64 rej-uniform overread; missing
    zeroization of pkpv/pk/sk) already caught and fixed in releases
    prior to v1.1.0, and the maintainer lineage is the same two people
    who built the HOL-Light + s2n-bignum infrastructure this is
    verified against.

What this work does *not* cover:

  - **OpenSSH ≥ 9.9 `libmlkem`** — same `X25519MLKEM768` group, the C
    implementation from libmlkem. Not in my harness. Adding a cgo shim
    is the next obvious move.

If the blast radius of F1 or G1 were wider, this post would be a
private advisory, not a methodology note. It isn't. The blast radius of
the methodology itself — the clean negative — is the part worth
writing about.

## Known blind spots of the methodology

A clean multi-way negative is narrower than it sounds. Five gaps are
worth naming so the negative isn't over-read:

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
     independent oracles reached by five different implementation
     paths with five different formal-verification stories. Narrower
     is not zero.
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

     Aggregating across both harnesses, the 5-way picture on the
     §7.2-on-sk-components clauses is:

     | Impl | dkPKE coef check | Embedded ek coef check |
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
     branches, builds a bitmap from them, and mutates toward inputs
     that expand it. The C libraries — BoringSSL, libcrux,
     mlkem-native — are called across the cgo boundary and return
     bytes; their branch coverage never reaches the mutation
     scheduler. Each harness body in this work is roughly a hundred
     lines of Go, mostly `bytes.Equal` checks, so the Go bitmap
     saturates within about a minute per harness — the "new
     interesting" counter plateaus in the first 60s and sits flat for
     the remaining 120s of every run. After that point, additional
     executions are uninformed random inputs into the cgo boundary
     rather than coverage-directed mutations. So the ~181M figure is
     an honest count of cross-library oracle-agreement checks on
     differentiated input — the right metric for *differential*
     fuzzing, where a byte divergence surfaces regardless of whether
     the mutation was coverage-guided — but it is **not** a coverage
     claim about the underlying C libraries, and it would be
     misleading to read it as one. The five libraries have roughly
     1500–3000 lines of C each (mlkem-native at the high end,
     BoringSSL's `mlkem.cc.inc` in the middle, the Go stdlib's
     `internal/fips140/mlkem` at the low end because it is split
     across helpers), plus libcrux's 370 KB extracted-C tree with
     monomorphised K=2/3/4 instances, all with deep branching through
     SampleNTT, SampleCBD, NTT/INTT, Barrett reduction, polynomial
     encode/decode; the Go fuzzer cannot see any of it. A libFuzzer
     harness compiled directly against the C static libs with
     SanitizerCoverage + ASan would drive mutation from C-branch
     feedback and would almost certainly reach orders of magnitude
     more effective coverage per exec. That's the next arc, not this
     one. It's the honest caveat under which the 181M number should
     be read.

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
     libFuzzer-direct companion. The headline negative — no spec
     violations across either harness — now holds at both API-level
     oracle agreement (181M, this post) and at C-branch coverage
     (77.7M, the companion).
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

Zero divergences. Every single `x` agrees across all three oracles. The
`+q/2` rounding offset combined with the `& ((1<<d)-1)` mask makes the
approximation exact over the whole valid range, despite what the comment
suggests. The comment is conservative, not sloppy.

A clean negative matters. Compress/Decompress is not a silent-
correctness bug hiding in CIRCL, and the only API-surface finding from
this exercise remains F1. Sometimes the methodology tells you things
are fine; write that down too. Most of what a diff-fuzz matrix does, if
it's doing its job, is produce clean negatives.

## Takeaway

Diff-fuzz is the cheap insurance on a crypto migration. Pick the
libraries with the most traffic behind them. Wire them into one
harness. Run until an oracle disagrees or you run out of clock.

The API-surface oracle disagreed once here, at CIRCL's expanded-SK
parser — F1, a compliance gap, not a vulnerability. It did not
disagree anywhere else: roughly 181 million cross-implementation
oracle calls across the five libraries at the public KEM-API surface
(seed-based keygen, parse/marshal public-key, public-from-private,
encap roundtrip, decap, §7.2 validate) — read against the caveat in
*Known blind spots* about what that count does and does not prove —
plus a full-domain sweep of Compress and Decompress, and the 2-way
BoGo matrix at the TLS-handshake surface — all clean. A second filing, G1, came from
applying the same methodology by static reading rather than
byte-level fuzzing — BoringSSL's `mlkem_parse_private_key` against
Go stdlib's explicit `H(ek)` equality check — and was tightened
voluntarily by the maintainer for parity with an earlier ML-DSA
change. Two filings, two outcomes; both from the same posture of
holding independent libraries against the same spec clauses.

Byte-equivalence between two libraries has a well-known blind spot:
both implementations can be wrong in the same way, agree with each
other, and pass. To close that, I reconstructed FIPS 203 Algorithm 18
step 7 — `K̄ := J(z || c)` with SHAKE256 — directly in the test, and
compared each library's implicit-reject decapsulation output against
the external oracle independently. Across ten thousand
random-invalid ciphertexts, both Go stdlib and BoringSSL matched the
oracle bit-for-bit. Property-level assurance that doesn't route
through either library agreeing with the other — the third oracle in
what was otherwise a two-oracle harness.

The honest part is naming what isn't covered. OpenSSH's `libmlkem`
carries the SSH fleet and is still not in this harness. CIRCL is in
the KEM-API diff-fuzz but not in the BoGo 2-way at the handshake
layer — a 3-way TLS matrix adding the cfgo fork is the next step.
libcrux and mlkem-native are both in at the KEM primitive layer, but
Signal's PQXDH handshake (above libcrux) and AWS KMS's RPC (above
mlkem-native) sit a level above the primitive and haven't been
diff-fuzzed at the protocol surface. Each of those is a finite,
scoped unit of work that raises the coverage number.

Filed issues: [cloudflare/circl#597][issue],
[issues.chromium.org/504820808][crbug].

## Reproducing this work

The 5-way diff-fuzz harness — Go-cgo-driven, targeting the public
KEM-API surface of all five libraries — is open source at
**[REPO-URL-DIFF-FUZZ-TBD]** under [LICENSE-TBD]. The repo carries
the cgo shims for all five libraries, the full 5-way harness set,
build scripts that pin each upstream library to the exact SHA tested
here (BoringSSL [SHA-TBD], CIRCL v1.6.3, Go stdlib 1.26,
libcrux-ml-kem [SHA-TBD], mlkem-native v1.1.0 `d2cae2be…`), a
reproducible `make` entry point that clones + builds + runs the
full campaign, and the methodology note from this post in
`docs/`.

The libFuzzer-direct-against-C companion that addresses the
cgo-opaque coverage gap named in *Known blind spots #4* —
SanitizerCoverage-instrumented, symbol-namespaced so all five libs
co-link in one binary — is a separate project at
**[REPO-URL-LIBFUZZER-DIRECT-TBD]**. It is newer than the
Go-cgo harness, exercises the C at the branch level rather than the
API level, and is the right fit if you want coverage-driven
exploration rather than differential oracle agreement. The two
harnesses are complementary; the libFuzzer-direct companion is
also what extended F1's defect class to mlkem-native and libcrux
on the `dkPKE` polynomial-bytes path documented in
*Known blind spots #2*. Its first audit report —
`docs/fuzz-audit-report-mlkem-2026-04-28.md` in that repo — is the
quantitative complement to this post: 77.7 million C-branch-driven
oracle calls across the 3-way slice, zero primary-correctness
divergences, mlkem-native at 89.95% line coverage on its ML-KEM
kernel files. See *Known blind spots #4* for how that closes the
"next arc" loop with concrete numbers.

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
[boring]: https://github.com/cloudflare/boring
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
