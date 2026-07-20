---
title: "Trust No Single Witness"
date: 2026-07-20
excerpt: "In a system with more than one implementation there is no ground truth available to the test harness — only witnesses that can disagree. That changes how I test Ethereum clients, cryptographic libraries, compilers, and AI-assisted security pipelines."
tags: ["differential-testing", "fuzzing", "ethereum", "cryptography", "verification", "oracle-problem"]
---

**In a system with more than one implementation there is no ground truth — only
witnesses that disagree. So: trust no single witness.**

That is the shortest version of my testing philosophy. It does not mean that a
protocol has no specification or that every answer is subjective. It means a
test harness cannot observe truth directly. Prose can be misread. An executable
specification can contain a bug. A reference implementation can preserve
behavior nobody intended. A test suite can share the system's wrong assumption.
These sources are useful, but they do not become infallible because the test
runner gives one of them a privileged name.

The practical move is to make the witnesses disagree under controlled
conditions. Generate one valid input, give it to implementations that reached
the same contract by different routes, and compare the observable results. When
one breaks from the others, minimize the input until the disagreement is small
enough to understand, reproduce, and report. Differential testing does not tell
you which implementation is right. It gives you a concrete case for
investigation.

## Agreement is evidence, not proof

The corollary is that [a green checkmark is an agreed-upon
guess](/blog/testing-oracles). A passing test says that the system and its oracle
agree. It does not say that either is correct.

Agreement can be correlated. Two clients may interpret the same ambiguous
sentence alike. A compiler and its tests may inherit the same assumption. A
model generating an answer and a model grading it may reproduce the same blind
spot. Adding witnesses helps only when their failure modes are independent. The
engineering work is therefore to construct that independence: different
codebases, languages, teams, derivations, and oracles. A reference
implementation, a property, an executable specification, and a human reviewer
are all imperfect; together they are powerful when their imperfections do not
line up.

## Ethereum: consensus makes disagreement concrete

Ethereum execution clients independently implement the same state-transition
rules and must agree on every block. In my [cross-client case
study](/#case-studies), state tests run across geth, Besu, Nethermind, Erigon,
and revm without appointing one implementation as the unquestionable oracle. A
different BLOCKHASH at genesis, an account touched on a failed transaction, or
an overflow in memory-size computation becomes visible as a split among
witnesses. Executable specifications add another witness near hard forks. The
useful output is the minimized test that explains the split, supports an
upstream fix, and prevents the divergence from returning.

## Post-quantum cryptography: standards need independent readers

ML-KEM and ML-DSA implementations can be individually well tested and still
disagree on an edge case, encoding, or boundary condition. The [ML-KEM
differential-testing series](/blog/cross-checking-post-quantum-kem) co-links
independent libraries and drives them with the same generated inputs.
Functional equivalence is one oracle; constant-time behavior is another. The
result also names the blind spots: which paths the harness reaches, which it
does not, and what a clean run therefore cannot establish.

## Compilers: the program is its own experiment

Compiler correctness rarely has an easy expected output. A semantics-aware
generator can instead produce valid programs and ask independent execution
paths whether transformations preserved behavior. [SolSmith](https://arxiv.org/abs/2607.07217)
used that approach to surface 25 miscompilation bugs in the Solidity compiler,
including bugs that had remained unnoticed for years. The method is the deeper
result: generate valid inputs, compare witnesses at the semantic boundary, then
reduce each divergence until its root cause can be explained.

## AI-assisted security: scale the witnesses, preserve the judgment

AI systems make it cheap to create more hypotheses, harnesses, and attempted
proofs of concept. They do not remove the oracle problem; they make it easier to
manufacture confident agreement.

The [three-witness severity model](/media/Trust_No_Single_Witness.pdf) I use for
AI-era bug-bounty triage separates the reporter's claim, an AI-assisted attempt
to validate it, and the network blast radius. The pipeline keeps auditable logs
and human review at the decision points because speed is not authority. An agent
can gather context, propose a harness, and try to reproduce an impact. A person
still has to decide what the evidence supports.

LLM-as-judge evaluations deserve the same suspicion. Generator and judge may be
different processes while remaining correlated witnesses. A higher score can
mean a better answer, or merely an answer that fits the judge's preferences and
blind spots. Useful evaluation introduces different failure modes deliberately:
executable checks where possible, properties, models from different lineages,
adversarial cases, and human review of disagreements.

## What the method predicts

As systems become harder to specify completely, testing will look less like
consulting one oracle and more like managing a panel of fallible witnesses. The
best harnesses will expose each witness's provenance, record the evidence behind
decisions, and treat unanimity as a reason to ask what the panel shares.

AI can scale that panel, but it cannot turn the panel into ground truth. The job
is to engineer independent ways of being wrong, force them into productive
disagreement, and preserve the path from divergence to reproducible evidence.

Trust no single witness. Make the witnesses disagree, then learn from the shape
of the disagreement.
