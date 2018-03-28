---
layout: post
title: Diagnosing Distributed Vulnerabilities
---

[Part 1][1] \| [Part 2][2] \| [Part 3][3]

## Prologue

This post is the first of the three part series on compiler assisted vulnerability diagnosis in open-source C/C++ code. "Compiler assisted" means that the presented techniques pivot around a compiler, and "vulnerability diagnosis" refers to the process of finding and fixing vulnerabilities (software weaknesses that can be used to intentionally cause harm). Software weaknesses (bugs) are a superset of vulnerabilities in that not all weaknesses are harmful from a security perspective. The challenging part of diagnosing vulnerabilities in source code is to arrive at the (usually) small subset of vulnerabilities from the (usually) larger set of bugs and non-bugs (that the source analyzer believes to be real bugs aka false positives).

## Intro

Today's compilers are pretty good at spotting localized bugs, vulnerabilities even. Localized bugs are those bugs that manifest in a single function or a source file. These bugs are usually easy to spot in source code. For example, in the code snippet below, indexing a finite-size array with a potentially attacker-controlled index is dangerous. We can catch vulnerabilities like this by invoking the Clang static analyzer in a non-default setting as shown. All's well because the analyzer can spot the vulnerability in its analysis context (within the source file).

```
$ cat <<EOF > example.c
#include <stdio.h>

void vulnerable(int y, char *buf) {
   buf[y] = 0;
}

int main(int argc, char *argv[]) {
   char buf[256];
   size_t x = 0;
   scanf("%lu", &x);
   vulnerable(x, buf);
   return 0;
}
EOF

$ clang --analyze -Xanalyzer -analyzer-checker=alpha.security.taint,alpha.security.ArrayBoundV2 example.c
example.c:4:11: warning: Out of bound memory access (index is tainted)
   buf[y] = 0;
      ~~~~~~^~~~~
      1 warning generated.
```

This checks out with [AddressSanitizer][7]. You can DIY like so:
```
$ clang -fsanitize=address example.c
$ ./a.out
255
$ ./a.out
256
=================================================================
==22685==ERROR: AddressSanitizer: stack-buffer-overflow on address 0x7ffc2ae9bc60 at pc 0x0000004e9be2 bp 0x7ffc2ae9bb00 sp 0x7ffc2ae9ba
f8
WRITE of size 1 at 0x7ffc2ae9bc60 thread T0
    #0 0x4e9be1 in vulnerable (/home/bhargava/work/github/bshastry.github.io/a.out+0x4e9be1)
...
```

In short, static analysis has diagnosed a vulnerability that may only have been caught during QA.

## Problem: Statically diganosing distributed vulnerabilities

Now what if we split the example snippet into two source files, like so
```
$ cat <<EOF > subroutine.c
void vulnerable(int y, char *buf) {
   buf[y] = 0;
}
EOF
$ cat <<EOF > example-mod.c
#include <stdio.h>

extern void vulnerable(int i, char *buf);

int main(int argc, char *argv[]) {
    char buf[256];
    size_t x = 0;
    scanf("%lu", &x);
    vulnerable(x, buf);
    return 0;
}
EOF

$ clang --analyze -Xanalyzer -analyzer-checker=alpha.security.taint,alpha.security.ArrayBoundV2 example-mod.c
$ clang --analyze -Xanalyzer -analyzer-checker=alpha.security.taint,alpha.security.ArrayBoundV2 subroutine.c
$ 
```

The modified snippet is more modular, hiding away the implementation of the `vulnerable` function from the user (`main`). The problem with encapsulation is that it makes life difficult for the source analyzer: In this particular instance, Clang cannot spot the potential buffer overflow because the pre-requisites for the overflow are not satisfied by analyzing `subroutine.c` by itself, or `example-mod.c` by itself. Note that `clang --analyze` returned no hits in either case. This is particularly problematic for C++ code, where, object encapsulation is the norm i.e., the implementation of C++ objects (and their associated methods) is hidden by design. Therefore, vulnerabilities in object-oriented code are hard to spot with state-of-the-art analysis. Nonetheless, the vulnerability may still be caught during QA using ASan + fuzzer:
```
$ clang -fsanitize=address example-mod.c subroutine.c
$ ./a.out
256
=================================================================
==22769==ERROR: AddressSanitizer: stack-buffer-overflow on address 0x7ffd57d7aa00 at pc 0x0000004e9e32 bp 0x7ffd57d7a8a0 sp 0x7ffd57d7a8
98
WRITE of size 1 at 0x7ffd57d7aa00 thread T0
    #0 0x4e9e31 in vulnerable (/home/bhargava/work/github/bshastry.github.io/a.out+0x4e9e31)
...
```

One approach to help the analyzer spot such distributed vulnerabilites earlier than QA is to introduce state in the analyzer such that inter-source-file analysis becomes possible. This is essentially what I am going to describe next.

## Solution: Making inter-source analysis stateful

The solution designed by me in the Melange project ([paper][4], [code][5]) is to "introduce state" by performing analysis in two stages:
 - Stage 1: Accepts source file as input, producing potential bugs, and violated security invariant as output
 - Stage 2: Accepts list of potential bugs and invariants, and whole program as inputs, producing (in)validated bug reports as output

The main insight behind this proposal is that, the analyzer trades precision during source-level (single source file) analysis for flagging distributed vulnerabilities. In other words, suspicious program data and control flow may be flagged during source-level analysis that may be later (in)validated. Later validation relies on information gathered during the previous stage---a description of where a potential bug was found, what invariant it violated---and the linked (whole) program. Let's see how this works out for the modified example.

#### Stage 1: Flag potential bugs during source-level analysis

First, we flag the potentially dangerous array indexing in the function called `vulnerable()` located in `vulnerable.c`. The security invariant that is potentially violated is that a function argument (that may be attacker controlled) is used without any sanitization (such as bounds checks) in the context of the function.

The bug report in this case will contain the following information:
  - line:column numbers for the suspicious indexing
  - function name where this occurs
  - array index `y` passed as a function argument is unsanitized in the scope of `vulnerable()`

Here's what this looks like (for actual invocation details, refer to the demo box [here][6]) from the command line:
```
$ melange --stage1 *.c
---- Potential bug -----
File: vulnerable.c
on: vulnerable()
Line: 2
Column: 8
Description: Array index derived from unsanitized function argument. May lead to a buffer overflow.
------------------------
```

#### Stage 2: Validate potential bugs during whole-program analysis

Next, we take a second look at the list of potential bugs flagged during source-level analysis in order to see if they can pose a real danger. In order to do so, we analyze the linked program to examine if bugs reported in Stage 1 actually pose a danger.

While analyzing the modified example, callsites of the function `vulnerable()` are inspected to see if they pose a danger. In this case, the analyzer notices that the call to `vulnerable()` contains an unsanitized user-controlled value, and thus flags the potential bug for later consideration.

Here's what it looks like on the command line:
```
$ melange --stage2 potential_bug.data a.out
---- Bug report ----
File: example-mod.c
Function: main()
Line: 9
Column: 5
Description: The called function `vulnerable()` contains a potential buffer overflow vulnerability. Sanitizing its function argument `x` may fix this problem. The vulnerable call sequence is:
main() -> vulnerable()
--------------------
```

Here's how staged analysis can help eliminate (local) false positives. Consider the following modification to `example-mod.c`. Let's call it `example-mod-fix.c` since it fixes the underlying vulnerability by sanitizing user input.
```
$ cat <<EOF > example-mod-fix.c
#include <stdio.h>

extern void vulnerable(int i, char *buf);

int main(int argc, char *argv[]) {
    char buf[256];
    size_t x = 0;
    scanf("%lu", &x);
    if (x > 255) {
        return -1;
    }
    vulnerable(x, buf);
    return 0;
}
EOF

$ melange --stage2 potential_bug.data a.out
---- False positive ----
File: vulnerable.c
Function: vulnerable()
Line: 2
Column: 8
Description: Potential buffer overflow reported in `vulnerable.c` is likely a false positive, since its argument `x` is sanitized at all call sites that follow:
main() -> vulnerable()
```

## Results

I have had modest success with the proposed approach. The proposal definitely provides more context for identifying vulnerabilities in source code. Specifically, enlisting LLVM passes to tell me more about a local bug has helped navigate code and identify false positives early. Moreover, the prototype scales up nicely to large codebases such as Chromium, and Firefox. For example, I could perform end-to-end analysis of these and MySQL codebases in under 48h (roughly 100 Euros renting a 32 vCPU EC2 instance). Having said that, the [vulnerabilities identified by the present incarnation of the tool][8] are limited to known issues in the evaluated projects. A more extensive evaluation of the tool across a larger number of open-source projects will help understand its utility towards early vulnerability diagnosis.

[Part 1][1] \| [Part 2][2] \| [Part 3][3]

[1]: {{ site.baseurl }}{% post_url 2017-08-02-Diagnosing-Distributed-Vulnerabilities %}
[2]: {{ site.baseurl }}{% post_url 2017-08-03-Inferring-Program-Input-Format %}
[3]: {{ site.baseurl }}{% post_url 2017-08-04-Exploring-Fuzzer-Crashes %}
[4]: https://link.springer.com/chapter/10.1007/978-3-319-40667-1_5
[5]: https://www.github.com/bshastry/melange-checkers
[6]: https://github.com/bshastry/vagrant-pallang
[7]: https://clang.llvm.org/docs/AddressSanitizer.html
[8]: https://link.springer.com/chapter/10.1007/978-3-319-40667-1_5#Tab1
