---
layout: post
title: Can Good-Turing Frequency Estimation Tell Us When to Stop Fuzzing?
---

**tl;dr: Depends, but I'm sceptical atm :-)**

In this post, I will try to examine the utility of the [Good-Turing frequency estimation][2] for fuzz testing.
I focus on the following question that is of practical importance for practioners: When to stop fuzz testing?

## Intro

This [paper][1] talks highly of the utility of the Good-Turing frequency estimation for fuzz testing.
It makes some very cool arguments why it makes sense to apply GT to fuzzing, I enjoyed reading it!
Here's the setting examined by that paper.
Fuzz testing involves decision making in the face of uncertainty.
For example, often, practioners would like to know when to stop fuzzing, cos who knows? A new crash may be found if only the fuzzer were left running for an additional hour/day/week etc.

In theoretical terms, what we would like to know at regular fuzzing intervals is the following: What is the probability of finding something new, should fuzzing continue?
Surprisingly, this is exactly what I.J. Good tried to understand (in a different setting of course) in the early 50s.

Of course, your definition of non-trivial probability is likely diffferent from mine.
The idea is to define a parameter, say $$\alpha{}$$, and stop fuzzing when the probability of finding something new is less than the parameter $$\alpha{}$$.
I admit this is a very specific (and likely limited) way to apply the GT estimate to fuzzing, so take the following arguments with spoonfuls of salt.

## Prelims

We need to set up our theoretical model of fuzzing that is suited to the Good-Turing formula.
So, let's begin with the following assumptions:
  - A species is defined as some discretized program behavior
    - We need some way to characterize distinct species
  - A test input can belong to one and only one species
    - Of course, multiple test inputs can belong to the same species, but the other way round is not possible

### Discretizing program behavior

afl-fuzz computes the hash of the coverage bit map to discretize program behavior.
Each byte in the coverage bitmap corresponds to some branch executed in the program.
So it discretizes program behavior like so:

```
// trace_bits is the state of the coverage bitmap
// after an input is executed
exec_cksum = hash32(trace_bits, MAP_SIZE, HASH_CONST);
```

where `hash32` is a 32-bit hash of its input (`trace_bits` of length `MAP_SIZE`; salt is some constant `HASH_CONST`).

First things first.
`exec_cksum` is imprecise: program behavior is more complex than what `exec_cksum` portrays it to be.
For example, two inputs can have the same `exec_cksum` but trigger two different execution paths $$p_{1}$$ and $$p_{2}$$.
But, `exec_cksum` is efficient to compute and takes modest memory.
Therefore, it is an **acceptable** trade-off between precision of program behavior discretization and performance.

A minor digression to understand how libFuzzer discretizes program behavior.

```
// kNumPCs is roughly 2.1 million
uintptr_t __sancov_trace_pc_pcs[fuzzer::TracePC::kNumPCs];
uint8_t __sancov_trace_pc_guard_8bit_counters[fuzzer::TracePC::kNumPCs];
```

There are two arrays
  - An array of program counters (branch call sites) seen during fuzzing
  - An array of counters for these program counters
    - This is used to count how often a branch is hit

In addition, there is something that libFuzzer creates called a feature.
My understanding is that a feature maps to an index of `__sancov_trace_pc_pcs.`
So, each branch in the fuzzed program is a feature.
Sadly, unlike afl-fuzz, libFuzzer does not keep track of a checksum of features for a fuzzed input; something akin to afl-fuzz's `exec_cksum.`
This means that, one would need to add (hashing) code to do this in libFuzzer.

### Lifting Good-Turing for Fuzzing

Suppose we have the set of all possible program behaviors (`exec_cksum`)

$$
P = \{p_{1},p_{2},...,p_{m}\}
$$

where $$p_{k}$$ is a program path.

We also have a sequence E of N ($$N \le{} m$$) program behaviors corresponding to as many independently chosen inputs in the fuzzing corpus.

$$
E = \{e_{1},e_{2},...,e_{n}\}, e_{k} \in{} P
$$

We want to estimate $$\theta{}[j]$$, the probability that a future sample will be $$p_{j}$$.
Now, we define a set of the frequency of program behaviours observed thus far.

$$
F = {f_{1},f_{2},...,f_{n}}
$$

where $$f_{k}$$ is the number of times behavior $$p_{k}$$ has been observed.

The relative frequency estimate for $$p_{j}$$ is $$f_{j}/m$$.
This estimate is inaccurate for small counts.
For example, if $$f_{j}=0$$, our estimate is essentially saying "you can't expect to see what you have not seen" which can be grossly inaccurate.

Before we proceed, we make the following assumption.

$$
f_{j} == f_{k} \implies{} \theta{}[j] == \theta{}[k]
$$

In other words, if two program behaviors appear with the same frequency in our present fuzzing corpus, then the probability of their future occurence is the same.
We can weaken this assumption later, but let's stick to this simple case in this post.

With this assumption, we introduce more notation.
Let $$\theta{}(r)$$ be the probability of a behavior occuring given that it appeared $$r$$ times in $$E$$.

$$
g_{r} = |\{e_{j} : f_{j} = r\}|
$$

$$
G = \{g_{0},g_{1},...,g_{R_{max}}\}
$$

where $$R_{max} = max(F)$$.

In other words, while the set $$F$$ computes the frequency of observed program behaviors, the set $$G$$ computes the frequency of frequencies of observed behaviors.
Moreover, $$R_{max}$$ is the highest frequency of observed program behaviors.
It follows that

$$
N = \sum_{r} rg_{r}
$$

where N (as we had denoted for the set E) is the total number of observed program behaviors.
N, as it turns out, is also the amount of fuzz i.e., total number of test inputs generated by fuzzing thus far.

Against this backdrop, we introduce the Good-Turing estimate $$\hat{\theta{}}(r)$$ for $$\theta{}(r)$$.

$$
\hat{\theta{}}(r) = (1/N)*(r+1)*(g_{r+1}/g_{r})
$$

This estimate tells us, for instance, that the probability of observing as yet unseen behaviors in the future ($$g_{0}$$) is:

$$
\hat{\theta{}}(0) = (1/N)*(g_{1}/g_{0})
$$

That is to say, this probability is greater than $$(1/N)$$ for positive $$g_{1}$$ when $$g_{1} \gt{} g_{0}$$.
When N=1 (after one program behavior has been observed), this probability is $$(1/(M-1)$$ which can be grossly inaccurate.
But the hope is, as N grows, this estimate converges on more realistic actual probability.

## Applying Good-Turing Estimate to Fuzzing

One way in which the Good-Turing estimate is useful is in deciding when to stop fuzz testing.
We stop fuzzing when $$\hat{\theta{}}(0)$$ is lower than some pre-defined threshold $$\alpha{}$$.
Even before I go ahead and implement this estimate inside, say afl-fuzz, I see three potential problems:
  - Q1: What is a good value of $$\alpha{}$$?
    - It is likely different for different targets
  - Q2: How to deal with noise in $$\hat{\theta{}}(0)$$?
    - Note that $$g_{1}$$ may fluctuate to varying extents which in turn influences the value of $$\hat{\theta{}}(0)$$
    - For example, at some point $$t=t_{k}$$ the estimate may go below $$\alpha{}$$ only to increase in value thereafter
  - Q3: How to compute $$g_{0}$$?
    - $$g_{0}$$ depends on $$M$$, the total number of feasible program behaviors that we can only estimate
    - If a 32-bit `exec_cksum` is used to discretize program behavior (as in afl-fuzz), $$M \approx{} 4.3 billion$$

At least, I am sceptical that the Good-Turing estimate can be mechanically relied upon to stop fuzzing.
A lot depends on the answers to the three questions above, and likely more.
Take the issue of computing $$g_{0}$$ for instance.
If a program contains even 32 branches, it can have at least 4.3 billion paths.
Therefore, `exec_cksum`ing falls short of correctly identifying program paths.

Even if we were to assume that `exec_cksum` is a fair performace-accuracy trade-off, $$M$$ is going to dominate the computation of $$\hat{\theta{}}(0)$$.
My intuition is that $$g_{0}$$ (the number of unobserved program paths: $$=M - k$$ where $$k$$ is the total number of paths discovered thus far) is always going to be very close to $$M$$.
In my experience, the total paths found by afl-fuzz is of the order of a few thousand for real-world targets and $$M$$ is at least 4.3 billion.
Therefore, we can approximate the estimate to be like so

$$
\hat{\theta{}}(0) = (1/N)*(g_{1}/M) = g_{1}/(N*M)
$$

Since $$N$$ is the amount of fuzz (how many inputs have been generated by fuzzing), it increases monotonically.
Thus, the denominator of the above equation is always increasing.
$$g_{1}$$ (number of program behaviors observed exactly once thus far) is likely going to go down as we continue fuzzing.
This is going to give us insanely low probabilities to begin with.
Say we start computing the estimate at some point $$t1$$ until when 2000 singleton (seen exactly once) behaviors have been observed and 10000 inputs generated by the fuzzer. We have:

$$
\hat{\theta{}_{t1}}(0) = 2000/(4300000000*10000) = 4.65e-11
$$

And let's say, at a subsequent time instance $$t2$$, we have 1000 singletons and 20000 inputs generated:

$$
\hat{\theta{}_{t2}}(0) = 1000/(4300000000*20000) = 1.16e-11
$$

Although these probabilities are relatively very different (e.g., it is four times less likely to find something new at $$t2$$ than at $$t1$$), they are very small to be practically useful. 
At least, these are my first impressions about the utility of GT estimate for one aspect of fuzzing.
Hit me up on Twitter ([@ibags][3]) if you think my argument is flawed or I'm talking BS; I'm curious to hear from other security practioners what they think.

Anyway, that's all for now folks.
I'll post a follow-up when I have some empirical evidence from real-world targets.
Watch this space!

## Updates

2018-12-10
----------

Another way to think of the extremely low estimates for discovering new paths is to say

$$
N_{z} = 1/\hat{\theta{}}(0)
$$

where $$N_{z}$$ is the expected number of additional fuzz required to uncover a new path.

So, what a $$\hat{\theta{}}(0) = 1.16e-11$$ is saying is that you need to run the fuzzer for an additional $$N_{z} \approx{} 86.2 billion$$ executions until you find a new path.
Assuming an average execution speed of $$1000$$, this translates to keep the fuzzer running for close to 3 years!
This is grossly inaccurate and of little practical utility.
Evidently, we need estimates that are tailored for exponential spaces, which I feel Good-Turing is not.

[1]: https://arxiv.org/pdf/1807.10255.pdf
[2]: https://en.wikipedia.org/wiki/Good–Turing_frequency_estimation
[3]: https://www.twitter.com/ibags
