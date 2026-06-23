---
title: "Cross-checking the post-quantum signature behind the web"
date: 2026-06-23
excerpt: "The KEM keeps a web conversation private; the signature decides whom you're talking to. I differential-fuzzed ML-DSA-65 across CIRCL, BoringSSL, and mldsa-native — and the real lesson wasn't the clean negative. It's that a clean negative is worth exactly as much as the coverage behind it, and my first attempt had a hole big enough to drive 16 million executions through without noticing."
tags:
  ["post-quantum", "ml-dsa", "fips-204", "differential-fuzzing", "fuzzing", "cryptography"]
---

> **TL;DR.** The KEM keeps a web conversation private; the signature
> decides _whom_ you are talking to. I differential-fuzzed **ML-DSA-65**
> (FIPS 204) across the three implementations behind that signing surface —
> Cloudflare CIRCL, Google BoringSSL, and pq-code-package/mldsa-native — and
> found no divergence. The point of this post isn't the clean negative. It's
> that a clean negative is worth exactly as much as the coverage behind it,
> and my first attempt at this had a coverage hole big enough to drive
> 16 million executions through without noticing.

## The other half

A few weeks ago I [wired the five ML-KEM libraries behind `X25519MLKEM768`
into one diff-fuzz harness][kempost]. ML-KEM is the encryption half of the
post-quantum web: it keeps the conversation secret. I noted in passing that
the signature side — ML-DSA, Falcon — was a different library set, and that
I would come back to it.

This is the signature side. ML-DSA (FIPS 204, the standardized form of
Dilithium) is the half that decides _who_ you are talking to: it authenticates
the handshake and signs the certificate chain, and it is what a forging
adversary attacks when they cannot break the KEM. Three implementations carry
the bulk of the deployed and soon-to-be-deployed surface:

- **Google BoringSSL** (`crypto/fipsmodule/mldsa/`) — Google's FIPS-aligned
  ML-DSA, the implementation in Chrome's PQC stack.
- **pq-code-package/mldsa-native** (C90, CBMC-proven) — the upstream AWS-LC
  imports at `crypto/fipsmodule/ml_dsa/`, and what AWS KMS ships in its ML-DSA
  service.
- **Cloudflare CIRCL** (pure Go) — the WebPKI-adjacent Go reference; ML-DSA-65
  with a 1952-byte public key and a 3309-byte signature.

Same shape as the KEM exercise: independent implementations of the same
standard should accept the same inputs and produce the same bytes. Where they
disagree, at least one is wrong.

## The trap in a clean negative

I had already fuzzed these three. An earlier arc used Go's native
`go test -fuzz`, reached across all three libraries through cgo, and logged
about **16 million** cross-implementation executions. It surfaced exactly one
question-shape finding — [`cloudflare/circl#600`][circl600], a state-aliasing
nuance in `(*PrivateKey).Public()` where the returned key shared its `tr` slice
with the private key, since fixed upstream — and clean negatives everywhere
else.

Sixteen million executions, one minor finding, otherwise green. That reads like
assurance. It wasn't, quite.

The problem was structural, and it is the kind of thing that is easy to miss:
**the coverage feedback was Go-only.** Coverage-guided fuzzing works by
instrumenting the target so that an input which exercises a new branch is kept
and mutated further. In that earlier harness the instrumentation lived in the
Go layer. The deep C inside BoringSSL and mldsa-native ran on every iteration —
but the branches _inside_ it never fed back into the mutator. The fuzzer was
optimizing the part it could see: the cgo marshaling boundary. It spent its
16 million executions getting very good at reaching the front door and almost
never walking further in.

A clean negative from a fuzzer that never deeply explored the code under test
is not the same as a clean negative. It is the absence of evidence dressed up
as evidence of absence.

## The rebuild

So I rebuilt the harness libFuzzer-native, with the instrumentation where the
code actually is.

BoringSSL and mldsa-native are compiled from pinned sources and linked
statically into the fuzzer binary under SanitizerCoverage, ASan, and UBSan. Now
the combined _edge coverage inside the C_ drives mutation: an input that reaches
a new branch in `sign.c` or `mldsa.cc.inc` is the input that gets kept and bred.
CIRCL — Go, and so impossible to link into a C binary — participates two ways:
a companion Go-native target driving the same packed-binary input schema, and a
replay tool that takes the C-side corpus and runs every input through all three
libraries in lockstep, flagging any accept/reject, public-key-byte, or
crash-state disagreement.

Six harnesses cover the ML-DSA-65 surface: keygen, verify, public-key parsing,
context-string-boundary handling, signature malleability, and signing itself.

## Evidence that it worked

The difference is visible in the coverage, which is the whole point — coverage
is the receipt that says the clean negative was earned. The signing core,
`mldsa-native/src/sign.c`, went from **39% to 69%** region coverage once C edges
drove the mutation instead of the cgo boundary. Aggregate region coverage across
the ML-DSA code under test rose from 59% to **77.5%**.

The residual gap is accounted for, not mysterious. Every unexecuted function in
`sign.c` sits in a path I deliberately left out of scope for this round — the
HashML-DSA pre-hash entry points and the ExternalMu variants. Within the scoped
sign-internal surface, coverage is saturating: the keypair, signature, and
verify internals, the domain-separation prefix construction, and the
constant-time comparison are all hit. That is the state you want before you
trust a negative — not "the fuzzer ran a long time," but "the fuzzer
demonstrably reached the code, and here is exactly where it didn't and why."

## The one thing worth staring at

The most interesting input the harness exercised did not diverge — and that is
precisely why it is worth describing.

FIPS 204 §5.4 prepends a domain-separation prefix to the message before signing:
a byte selecting pure-vs-pre-hash mode, the context-string length, and the
context string itself. BoringSSL and mldsa-native assemble that prefix through
completely different ABIs. BoringSSL takes four separate arguments —
`(prefix_ptr, prefix_len, ctx_ptr, ctx_len)` — and absorbs them into SHAKE in
sequence. mldsa-native takes a single pre-concatenated buffer that the caller
has already laid out as `0x00 ‖ ctx_len ‖ ctx`. Two different shapes of API,
one with the framing split across arguments and one with it pre-packed, both
feeding the same hash.

Fed a context string of non-trivial length, both produce **byte-identical**
SHAKE absorb sequences and byte-identical signatures. That is a place where a
careless implementation _could_ easily diverge — an off-by-one in the length
byte, a missing separator, a different absorb order — and the fact that two
independently written libraries agree to the byte is a small, concrete piece of
the assurance you actually came for.

## On publishing a clean negative

I did not find a genuine vulnerability in ML-DSA this round. The one prior
finding (`circl#600`) was minor and is already fixed; everything else is a clean
negative.

I think that is worth writing down anyway, for two reasons. The first is the
methodology lesson, which generalizes well past post-quantum crypto: **a
differential fuzzer that instruments only the glue between implementations will
report a confident clean negative while testing almost none of the code you
care about.** If you are cross-checking C libraries through a higher-level
language, check where your coverage feedback actually lives before you trust the
result.

The second is that for code this important — the signature scheme that will
authenticate a large fraction of the web once the migration completes — a
rigorous, coverage-backed "these implementations agree" is a result, not a
non-result. The published record of post-quantum implementation security should
not be only the bugs.

The deferred surface is where the next round goes: ExternalMu, the HashML-DSA
pre-hash variants, hedged (randomized) signing with a cross-verify oracle
instead of byte-equality, and the ML-DSA-44/-87 parameter sets. If something is
hiding in ML-DSA, that is the likeliest place left for it. For now, the center
holds.

[kempost]: /blog/cross-checking-post-quantum-kem
[circl600]: https://github.com/cloudflare/circl/issues/600
[fips204]: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.204.pdf
