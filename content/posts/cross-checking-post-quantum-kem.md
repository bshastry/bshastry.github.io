---
title: "Cross-checking the post-quantum KEM behind the web — Part 1: the setup and the CIRCL finding"
date: 2026-04-24
excerpt: "Part 1 of 3. One in twelve web connections rides X25519MLKEM768. I wired the five ML-KEM libraries behind it into one diff-fuzz harness — and it caught F1, a FIPS 203 §7.2 modulus-check bypass in CIRCL's expanded-SK parser."
tags: ["post-quantum", "ml-kem", "fips-203", "differential-fuzzing", "cryptography"]
series: "Cross-checking the post-quantum KEM behind the web"
seriesPart: 1
seriesLabel: "Setup & the CIRCL §7.2 finding"
---

> **TL;DR (Part 1 of 3).** Roughly one in twelve human web connections rides
> `X25519MLKEM768`. I wired the five ML-KEM libraries behind it into one
> diff-fuzz harness — ~181M cross-implementation oracle calls. This part covers
> the libraries and the method, then the one defect the harness caught: **F1**, a
> FIPS 203 §7.2 modulus-check bypass in CIRCL's expanded-SK parser. A compliance
> gap, not a vulnerability — and the close explains why it survived the
> ecosystem's test suites.

## Roughly one in twelve

About one in every twelve human web connections right now rides
`X25519MLKEM768`, a hybrid post-quantum key exchange hedging against the
day somebody finishes a cryptographically relevant quantum computer. The
hedge only holds if both halves are correctly implemented and the two
ends of the channel agree on which inputs to accept.

Five libraries sit behind the bulk of that traffic plus the adjacent
secure-messaging and cloud-KMS surface:

  - BoringSSL — Chrome, Android, and Cloudflare's edge. The ~60% figure in
    Cloudflare's [2025 PQ report][pq2025] multiplies out to roughly 8% of
    the global human web ([Radar 2025][radar2025]).
  - Go 1.24+ `crypto/mlkem` — `crypto/tls` enabled `X25519MLKEM768`
    by default, so every default Go HTTPS/gRPC server, the
    Kubernetes v1.33+ control plane, and most Go infrastructure
    picked it up.
  - Cloudflare's CIRCL `kem/mlkem/mlkem768` — cfgo fork, Lux Network's
    warp bridge, a long tail of Go applications.
  - Cryspen's **libcrux-ml-kem** — Signal's [PQXDH][pqxdh] backend,
    roughly 40 million daily users. Rust-native, formally verified
    against a spec model in F*, and shipped to downstream consumers
    (Signal, Microsoft SymCrypt) as auto-generated portable C via the
    Charon/Eurydice/KaRaMeL pipeline.
  - **pq-code-package/mlkem-native** — AWS KMS's ML-KEM, the default in
    libOQS (≥ 0.13.0), and the ML-KEM backing rustls (≥ 0.23.28, via
    AWS-LC's [2026-03-16 import][mlkemnative-awslc-pr] of upstream
    v1.1.0). Pure C, CBMC-verified on the C, HOL-Light + s2n-bignum
    verified on the aarch64/x86_64 asm for functional correctness
    *and* constant-time. Maintained by Hanno Becker (AWS) and Matthias
    Kannwischer (zeroRISC), hosted under the PQCA / Linux Foundation
    consortium.

I run a small scraper over Reddit, Ethereum Magicians, and a few other
feeds to flag security topics trending in web3, and it kept surfacing
post-quantum — [Algorand's Falcon numbers][algofalcon],
[Circle's roadmap][circlepq], [QRL's testnet][qrlzond],
[Google's quantum threat paper][gidney]. Almost all of that is the
signature side (ML-DSA, Falcon), a different library set, but it was
enough of a nudge to go look at the KEM side, where the deployed
traffic is.

So I wired the five libraries into a single diff-fuzz harness: roughly
181 million cross-implementation oracle calls across the
EK/SK/encap/decap surface, plus a full-domain integer sweep over
Compress and Decompress. That 181M is an exec count, not a coverage
claim — see *Known blind spots* in Part 3. Two spec-tightness questions
came out of it, one from byte-level divergence in the harness, one from
static reading against the same spec clauses. Each was filed upstream
and resolved differently.

**F1** — [cloudflare/circl#597][issue] — is a §7.2 modulus-check bypass
in CIRCL's expanded-SK parser, caught by the harness as a byte-level
accept/reject divergence against Go stdlib. Closed wontfix on policy
grounds (use seed-based keygen, not expanded-SK imports).

**G1** — [issues.chromium.org/504820808][crbug] — is a §7.3 H(ek)
hash-check gap in BoringSSL's `mlkem_parse_private_key`, found by
reading the BoringSSL parser against Go stdlib's explicit equality
check at the same layer rather than by byte divergence. The maintainer
called the permissive reading defensible — the function is reachable
only at the BCM boundary, not from the public `mlkem.h` API — then
tightened it anyway in [CL 93247][crbug-cl] for parity with a recent
ML-DSA parser change.

No CVE, no CVSS, no advisory on either. Most of what the harness
produced is what *didn't* diverge; the two filings are what fell out
along the way.

## Disclaimer

I am not a post-quantum cryptographer. I can't evaluate the mathematical
security of Module-LWE, the lattice problem ML-KEM reduces to — that's a
different discipline. What I can do is read a rule in a 100-page spec
carefully, line it up against two implementations, and write a small harness
when they disagree.

The technique generalizes. Diff fuzzing doesn't care whether you can do the
math. It treats two implementations as oracles of each other and leans on the
fact that *they should not disagree*. If they do, somebody is wrong — the
fuzzer doesn't know which one. That's a problem for the spec authors and the
maintainers.

## F1 — the one defect the harness caught

FIPS 203 defines two MUST-level input-validation checks on
decapsulation-key bytes, one in each of two adjacent clauses:

1. **§7.3 item 3 — hash check.** `H(ek_embedded)` inside the
   decapsulation key must equal the cached 32-byte hash stored alongside it.
2. **§7.2 item 2 — modulus check.** Every 12-bit coefficient of
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

Under any reasonable threat model, a missing §7.2 modulus check in
`PrivateKey.Unpack` is not a vulnerability. CIRCL's own keygen emits
canonical keys. Non-canonical SK bytes can only come from:

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
