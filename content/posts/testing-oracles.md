---
title: "A Green Checkmark Is an Agreed-Upon Guess"
date: 2026-06-16
excerpt: "We obsess over test inputs and coverage and almost never examine the oracle — the thing that decides an answer was correct. A passing test isn't proof of correctness; it's a statement that the system and its oracle agree. Here's why that distinction is suddenly everyone's problem, especially in how we evaluate AI."
tags: ["testing", "oracle-problem", "differential-testing", "llm-as-judge", "verification"]
---

Every test you have ever written asks a question and then checks the answer
against something. We spend most of our attention on the question — the input,
the edge case, the clever payload — and almost none on the *something*. That
something has a name in the testing literature: the **oracle**. It's whatever
tells you the observed behavior was correct.

The uncomfortable truth is that the oracle is usually the weakest part of the
whole arrangement. We obsess over coverage and inputs while quietly trusting a
mechanism for deciding "right" that we never examine. A passing test isn't proof
of correctness. It's a statement that the system under test and the oracle
agree. A green checkmark is an agreed-upon guess.

I spend my days finding consensus bugs across independent implementations of the
same protocol, where this problem is impossible to look away from. But it isn't
an Ethereum problem, or even a blockchain problem. It's the shape of all
verification, and it's quietly becoming the central problem in how we evaluate
AI. So it's worth pulling apart in the open.

## Where oracles come from

Strip away the tooling and there are only a few places an oracle can come from,
and each one is fallible in its own way.

**Hardcoded expectations.** You write `assertEqual(result, 42)`. The oracle is
*you*, frozen at the moment you wrote the test. It's only as correct as your
understanding was that afternoon, and it silently rots as the spec changes
underneath it. This is most tests ever written, and it scales terribly: you can
only assert answers you already know.

**A reference implementation.** Run the same input through a second system and
compare — differential testing. This is enormously powerful because it generates
its own oracle: you don't need to know the right answer, only that two things
disagree. But it has a precise blind spot. It can only catch bugs the two
implementations *don't share*. A mistake they both make is, to this oracle,
indistinguishable from correctness.

**A property.** Instead of checking the exact answer, check an invariant that
must hold: reversing a list twice returns the original; decoding what you encoded
round-trips; output is always sorted. Property-based testing — and its
metamorphic cousin, which checks relations between related runs — lives here.
Properties are wonderful because they catch answers you couldn't have
predicted — but you have to *know the property*, and the bugs that hurt most are
the ones hiding in a property nobody thought to state.

**A human.** Code review, manual QA, judgment. Flexible, context-aware, and the
most expensive and least reproducible oracle of all. Humans are also confidently
wrong in correlated ways — which becomes important in a moment.

Notice that no entry on this list is *ground truth*. There is no oracle that
simply knows. Even an executable specification — the closest thing to authority
most systems have — is itself just code somebody wrote, partial and fallible. A
privileged witness, not a god. Every oracle is one more fallible thing in the
room.

## The bug nobody disagrees about

Here is the failure mode no amount of test coverage touches.

If your system under test and your oracle share the same wrong assumption, your
tests pass and the bug ships. The defect isn't in the gap between them; it's in
the agreement. A differential test where both implementations misread the same
ambiguous sentence in the spec will be green forever. A property suite that
encodes the same misunderstanding you built the system on will confirm your
mistake with great enthusiasm.

This is why "all tests pass" and "the system is correct" are different statements
that we constantly conflate. Tests verify the absence of *disagreement*. The most
dangerous bug is the one nobody disagrees about — and your green checkmark is, by
construction, blind to exactly that class.

## Why this is suddenly everyone's problem

For decades the oracle problem was a niche concern for people who test compilers,
numerical libraries, and protocol implementations — domains where the right
answer is genuinely hard to know in advance. Most engineers could get by
pretending their hardcoded asserts were truth.

Then we started evaluating AI systems, and the oracle problem walked out of the
niche and into the center of the field.

How do you test a model whose entire job is to produce open-ended outputs with no
single correct answer? Increasingly, the answer is *LLM-as-a-judge*: you use one
model to grade another. Pause on what that is in the vocabulary above. It's an
oracle made of the same material as the system under test — often trained on
overlapping data, frequently heir to the same blind spots, prone to the same
confident errors. The judge and the defendant went to the same school.

That's not automatically disqualifying; a fallible oracle still catches plenty.
But it means the failure mode from the last section is the *default* case, not the
exception. A judge model and a generator model will tend to be wrong about the
same things, for the same reasons, at the same time. Their agreement carries far
less information than it appears to. The green checkmark looks identical whether
the answer is right or whether both models are confidently, correlatedly wrong.

We are building enormous evaluation pipelines on top of oracles whose blind spots
are *correlated with* the system they're judging. That's the oracle problem in its
purest and most expensive form, and a surprising number of teams are running
straight into it while still treating the score as truth.

## What you actually do about it

You don't solve the oracle problem. There is no final oracle waiting to be
discovered. What you do is stop pretending you have one and start engineering
around the fact that you don't.

**Triangulate fallible witnesses instead of trusting one.** Don't ask "is this
correct?" Ask "do my independent oracles disagree?" Stack several — a reference
implementation, a property suite, a human spot-check — and treat any disagreement
as a lead. Each one is wrong sometimes; what matters is that they're wrong
*differently*.

**Engineer the independence, because it's the whole game.** Two oracles that
share a blind spot are barely better than one. The value lives entirely in their
being wrong about different things, so spend your effort there: derive one oracle
from prose and another from code; have one team write the spec and another the
tests; pick a judge model from a different lineage than the system it grades.
Correlated witnesses just agree more confidently — which is worse than useless,
because it feels like signal.

**Keep a human as the tiebreaker — not because humans are right, but because
they're differently wrong.** When automated oracles split, you don't need an
authority who knows the answer. You need a judge with a different failure mode who
can decide which disagreement to chase. Automation can scale the witnesses without
limit; it can't be the one who breaks the tie, because a tiebreaker that shares
the witnesses' blind spots breaks nothing.

**Treat a clean run as a map of what you can't see.** "All green" is not
"correct." It's "none of my current oracles object" — which is genuinely useful,
but only if you can name what those oracles are structurally blind to. The most
valuable artifact your test suite produces isn't the passing run. It's an honest
inventory of the bugs it could never catch.

## The point

The instinct to chase a green checkmark is the instinct to find a single source
of truth and trust it. In any system worth testing, that source doesn't exist.
The executable spec is a privileged witness, not an oracle. The reference
implementation shares your blind spots. The AI judge went to the same school as
the defendant. The human is confidently wrong in ways you can't predict.

So you stop looking for the witness you can trust, and you get good at
triangulating the ones you can't. The goal was never to make the checkmark green.
It's to know exactly what your green checkmark is blind to — and to build,
deliberately, the second witness that can see it.
