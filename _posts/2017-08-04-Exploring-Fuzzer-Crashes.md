---
layout: post
title: Exploring Fuzzer Crashes
---

[Part 1][1] \| [Part 2][2] \| [Part 3][3]

## Prologue

This post concludes the three part series on compiler assisted vulnerability diagnosis in open-source C/C++ code. "Compiler assisted" means that the presented techniques pivot around a compiler, and "vulnerability diagnosis" refers to the process of finding and fixing vulnerabilities (software weaknesses that can be used to intentionally cause harm). Software weaknesses (bugs) are a superset of vulnerabilities in that not all weaknesses are harmful from a security perspective. The challenging part of diagnosing vulnerabilities in source code is to arrive at the (usually) small subset of vulnerabilities from the (usually) larger set of bugs and non-bugs (that the source analyzer believes to be real bugs aka false positives).

## Intro

Software testing is arguably the most important process in the quality assurance phase of software development. Bugs found during testing achieve an important objective: Helping fix programming errors before a software release. Therefore, bug count is a reasonable metric to assess the effficiency of the software testing process. If technique X helps find more bugs than technique Y, the former is said to be more effective.

This post argues that, for practical reasons, fuzz testing alone may be sub-optimal to maximize bug count, and that static analysis can help find bugs in scenarios where fuzzing is not an option.
Here is a non-exhaustive list of scenarios where fuzzing is not straightforward:
  - Crypto code
  - Stateful application logic in networking stacks
  - No unit test to test feature X
  - No fuzzable unit test to test feature X

Of course, this does not mean fuzzing in these scenarios is impossible.
It just means it is harder (requires manual labor) to fuzz in these scenarios.
So, it does not scale out.

## Static exploration of fuzzer crashes

How can we scale bug discovery beyond fuzz testing?
My proposal is to use static analysis in order to automatically explore the findings of a fuzzer.
By "findings of a fuzzer", I mean fuzzer-discovered program crashes that can be localized (attributed) to a small portion of the program.
By "exploration", I mean spotting recurances of the underlying cause of fuzzer-discovered crashes.
This opens up two problems: How to automatically (1) localize fuzzer crashes? (2) explore them statically?
Considering that static analysis over-approximates, a third problem is to how to handle false positives?
We shall be investigating each problem in the next paragraphs.

#### Fault localization

In this post, we focus on fault localization in an open-source setting, although fault localization has been [shown to be possible in a closed source setting][4].
So, our fault localization tool should accept source code and a fuzzer corpus (set of test inputs) as input, and produce a set of localized code segments that correspond to each unique fuzzer-discovered crash.
[Crash de-duplication tools such as exploitable][5] provide us the set of uniquely crashing program inputs.
So, our problem is reduced to that of obtaining localized code segments for each unique crash in the set of deduplicated crashes.

For memory corruption bugs, memory-tracing tools such as AddressSanitizer and Valgrind can greatly assist fault localization.
These tools track the state of memory use at byte granularity, reporting buffer overflows, use-after-free and other memory related issues that are endemic to C/C++ applications.
AddressSanitizer even has a structured bug diagnostic report that can be leveraged to programmatically narrow down the lines of code that caused the bug.

Let's run through a small example here. The code below contains a synthetic buffer overflow that we can spot with the help of ASan:
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

$ clang -fsanitize=address example.c
$ ./a.out
256
=================================================================
==2290==ERROR: AddressSanitizer: stack-buffer-overflow on address 0x7ffcd43ff9c0 at pc 0x0000004e9be2 bp 0x7ffcd43ff860 sp 0x7ffcd43ff85
8
WRITE of size 1 at 0x7ffcd43ff9c0 thread T0
    #0 0x4e9be1 in vulnerable /home/bhargava/work/github/bshastry.github.io/code/example1.c:4:11
    #1 0x4e9d71 in main /home/bhargava/work/github/bshastry.github.io/code/example1.c:11:4
    #2 0x7f13f2f8682f in __libc_start_main /build/glibc-bfm8X4/glibc-2.23/csu/../csu/libc-start.c:291
    #3 0x418538 in _start (/home/bhargava/work/github/bshastry.github.io/a.out+0x418538)

Address 0x7ffcd43ff9c0 is located in stack of thread T0 at offset 288 in frame
    #0 0x4e9bff in main /home/bhargava/work/github/bshastry.github.io/code/example1.c:7

This frame has 2 object(s):
    [32, 288) 'buf' <== Memory access at offset 288 overflows this variable
    [352, 360) 'x'
```

Note that the ASan diagnostic report not only shows the program stack trace at the time the buffer overflow occured, but also the program variable that overflowed.
Moreover, the formatting of the report is regular enough for us to automatically parse this information.

What if we are dealing with a bug that is not caused due to memory corruption, say, an assertion failure.
In the synthetic example below (`abort.c`), the program aborts when the parsed input equals the string literal `doom`. More realistically, one would be dealing with an assertion failure due to an unexpected program state. Nonetheless, the example is simple enough to demonstrate how we handle non memory corruption bugs. Lines have been numbered so we can speak about execution traces in terms of a set of line numbers. This will be clear shortly.
```
$ cat <<EOF > abort.c
1. #include <string.h>
2. #include <crypt.h>
3. #include <stdlib.h>
4. #include <unistd.h>
5. #define CUSTOM() abort()
6. void fuzzable(const char *input) {
7.     // Fuzzer finds this bug
8.     if (!strcmp(input, "doom"))
9. 		abort();
10. }
11.
12. // Fuzzer test harness
13. // INPUT: stdin
14. int main() {
15.     char buf[256];
16.     memset(buf, 0, 256);
17.     read(0, buf, 255);
18.     fuzzable(buf);
19.     return 0;
20. }
```

Using a coverage tracer such as [SanitizerCoverage][6], we can obtain the execution trace for this program for a given input.
Let's assume that the fuzzer discovered the program input "doom" that causes the program to abort, immediately after it mutated an input "doo" that it had previously generated.
For the input "doom", we can see that the following lines are in the execution trace 

```
$ clang -fsanitize-coverage=bb -fsanitize=undefined -g abort.c
$ perl -e 'print "doom"' | UBSAN_OPTIONS="coverage=1:coverage_direct=1" ./a.out
Aborted (core dumped)
$ sancov.py rawunpack 2900.sancov.raw
$ sancov.py print a.out.2900.sancov | llvm-symbolizer -obj a.out
/usr/local/bin/pysancov: read 8 64-bit PCs from a.out.3150.sancov
/usr/local/bin/pysancov: 1 file merged; 8 PCs total
fuzzable
/home/bhargava/work/github/bshastry.github.io/code/abort.c:6:0

fuzzable
/home/bhargava/work/github/bshastry.github.io/code/abort.c:8:7

fuzzable
/home/bhargava/work/github/bshastry.github.io/code/abort.c:8:7

fuzzable
/home/bhargava/work/github/bshastry.github.io/code/abort.c:8:7

fuzzable
/home/bhargava/work/github/bshastry.github.io/code/abort.c:8:7

main
/home/bhargava/work/github/bshastry.github.io/code/abort.c:14:0

main
/home/bhargava/work/github/bshastry.github.io/code/abort.c:16:3

main
/home/bhargava/work/github/bshastry.github.io/code/abort.c:16:3
```

After de-duplicating line numbers, we are left with the following execution trace for the input "doom": (6,8,14,16).
The trace for the input "doo" is: (6,8,10,14,16).
Note that the coverage tracing tool might have false negatives (executed lines that are not registered), but we can live with that.
If we obtain the set difference between the traces for "doo" and "doom", we are left with line number 10.
What this tells us is that the function `fuzzable` does not return when passed input "doom" but returns when the passed input is "doo".
From this, we can deduce that the crashing input caused a crash between lines 8 and 10 i.e., line 9.
In doing so, we have localized the failure (somewhat) to lines 8--10.

What we obtain after fault localization is a set of source code locations (say, a list of file:line tuples) that (most likely) were the root-cause of a program crash.
Our next problem is to find where similar code patterns exist.

#### Static exploration of root-cause of failure

In order to explore code patterns similar to the root-cause of fuzzer-discovered crashes, we take a compiler-based code query approach.
We will be using [clang-query][7], a tool that lets us efficiently query the abstract syntax tree of code bases.
The query syntax of clang-query is a functional language predicated over properties of the program AST.
I will try to break down what this means.
A tool like `grep` is what we seek to emulate: Given a code pattern that is known to be vulnerable, we would like to search for its recurrances.
However, unlike `grep`, we do not match the textual representation of code, rather how it looks like to the compiler.
At the risk of oversimplication, I call it compiler grepping!
If you are wondering what compiler grepping brings to the table that `grep` does not, it lets us match against the structure and semantics of code rather than it's appearance.
This can make a big difference as we shall see.

The next question then is: How can we formulate compiler queries from code segments that we have obtained after fault localization?
To understand this, let's try to understand what code segments look like to the compiler. Here's a snippet of `abort.c`'s AST.
```
$ clang -fsyntax-only -ast-dump abort.c
`-FunctionDecl 0x2c61778 <line:14:1, line:20:1> line:14:5 main 'int ()'
  `-CompoundStmt 0x2c61d48 <col:13, line:20:1>
      |-DeclStmt 0x2c618f8 <line:15:3, col:17>
          | `-VarDecl 0x2c61898 <col:3, col:16> col:8 used buf 'char [256]'
      |-CallExpr 0x2c61a00 <line:16:3, col:24> 'void *'
	  | |-ImplicitCastExpr 0x2c619e8 <col:3> 'void *(*)(void *, int, unsigned long)' <FunctionToPointerDecay>
		  | | `-DeclRefExpr 0x2c61910 <col:3> 'void *(void *, int, unsigned long)' Function 0x2baf100 'memset' 'void *(void *, int, unsigned long)'
```

Here's the break down of the AST snippet:
  - `FunctionDecl` is an AST node that represents the declaration of the `main()` function
  - `CompoundStmt` is an AST node that signals the start of the function's body. Note that this node is a child of `FunctionDecl` implying that the `CompoundStmt` in question is to be found in the function body of `main()`
  - `DeclStmt` is an AST node that represents the declaration of the char buffer whose name is `buf`. The referenced variable `VarDecl` is a child of `DeclStmt` implying that the variable in question binds to the said declarative statement
  - ...
... and so on.

AST features (type of AST node, and its relationship to adjacent AST nodes) can help issue efficient queries for static exploration.
For example, if we want to explore all calls to the function `abort()` we can issue the following clang-query style query:
```
$ clang-query abort.c
clang-query> match declRefExpr(to(
				functionDecl(hasName("abort"))
				))
Match #1:

/home/bhargava/work/github/bshastry.github.io/code/abort.c:9:3: note: "root" binds here
                abort();
                ^~~~~
1 match.
```

This example demonstrates how simple functional queries may be used to explore a code base.
In this work, we focus on directed exploration i.e., we would like to explore the code base with specific issues in mind.
To demonstrate this, consider the following stack trace discovered by fuzzing a modified version of the `abort.c` program that we shall call `abort-mod.c`.
```
$ cat <<EOF > abort-mod.c
1. #include <string.h>
2. #include <crypt.h>
3. #include <stdlib.h>
4. #include <unistd.h>
5. #define CUSTOM() abort()
6. void fuzzable(const char *input) {
7.     // Fuzzer finds this bug
8.     if (!strcmp(input, "doom"))
9. 		abort();
10. }
11. void cov_bottleneck(const char *input) {
12.	char *hash = crypt(input, "salt");
13.	
14.	// Fuzzer is unlikely to find this bug
15.	if (!strcmp(hash, "hash_val"))
16.		CUSTOM(); // grep misses this
17. }
18.
19. // Fuzzer test harness
20. // INPUT: stdin
21. int main() {
23.     char buf[256];
24.     memset(buf, 0, 256);
25.     read(0, buf, 255);
26.     fuzzable(buf);
27.	cov_bottleneck(buf);
28.     return 0;
29. }
EOF
$ clang -g -lcrypt abort-mod.c
$ perl -e 'print "doom"' | gdb -q -ex=r -ex=bt -ex=quit ./a.out
Reading symbols from ./a.out...done.
Starting program: /home/bhargava/work/github/bshastry.github.io/code/a.out

Program received signal SIGABRT, Aborted.
0x00007ffff780a428 in raise () from /lib/x86_64-linux-gnu/libc.so.6
#0  0x00007ffff780a428 in raise () from /lib/x86_64-linux-gnu/libc.so.6
#1  0x00007ffff780c02a in abort () from /lib/x86_64-linux-gnu/libc.so.6
#2  0x000000000040073a in fuzzable (input=0x7fffffffd850 "doom") at abort-mod.c:9
#3  0x0000000000400814 in main () at abort-mod.c:25
```

Essentially, as expected the input `doom` triggers a program abort. Things like this are relatively easy to find using a fuzzer.
Also note that there is a similar "vulnerability" hiding under crypto code.
Essentially, the fuzzer would need to generate a hash collision to get past the branch leading to this vuln, which is very unlikely.
Also note that the call to the `abort()` function is lexically different: It is called `CUSTOM()` and not `abort()`.
This is intentional to show that lexical or even textual matching tools such as `grep` will not be able to match it for the query `abort`.
Now, I will demonstrate how we deal with code scenarios like those in the example.

First, we localize the defect using the stack trace.
If you filter out function calls not in source code (not systems/library code) and pick the first such stack frame, we are left with the call to `abort()` in the `fuzzable()` function.
So let's list all calls to `abort()` in the entire code base.
```
$ cat <<EOF > abort_query.txt
match declRefExpr(to(functionDecl(hasName("abort"))))
EOF
$ clang-query -f=abort_query.txt abort-mod.c
Match #1:

/home/bhargava/work/github/bshastry.github.io/code/abort-mod.c:9:3: note: "root" binds here
                abort();
		^~~~~

Match #2:

/home/bhargava/work/github/bshastry.github.io/code/abort-mod.c:16:3: note: "root" binds here
CUSTOM(); // grep misses this
^~~~~~~~

/home/bhargava/work/github/bshastry.github.io/code/abort-mod.c:5:18: note: expanded from macro

'CUSTOM'
#define CUSTOM() abort ()
                 ^~~~~
2 matches.
```

As shown, fuzzer-directed queries can help spot issues that might have been missed by fuzzing alone. This is where directed compiler-based queries help. Being static they can explore the entire code base without being hampered by dynamic bottlenecks such as cryptographic code or more simply code that doesn't get exercised by existing unit tests.

#### Dealing with false positives

This sounds too good to be true. It is. Static analysis over-approximates that leads to false positives, and eventually manual time spent in report validation.
For example, in the synthetic example above, calls to `abort()` is too broad a query to find real issues. There are likely calls to `abort()` in dead code and/or not relevant.
In general, the more precise we are able to model fuzzer crashes from the post-failure diagnostics (stack trace, core dump etc.), the better static matches we get.
For the time being, we have a simple but effective way to facilitate manual review.

#### Ranking matches 
First, we measure the test coverage reached by fuzzing.
We do this by using a program coverage tracer tool such as Gcov, and SanitizerCoverage.
Second, for each match returned by the static analyzer, we check if it comprises code that is already covered or not.
Matches in unfuzzed code is prioritized for review.

## Results

This research was evaluated on Open vSwitch codebase. It led to the discovery of several corner cases that OvS developers appreciated.
Prominently, we showed that our method could spot a security issue that was a regression that appeared in one release and also catch a real issue similar to a fuzzer discovered vuln elsewhere in the same codebase.
The analysis undertaken is fast and thus doable on a regular basis e.g., CI.
I think the approach taken in this work holds promise for catching other classes of recurring vulns in large codebases.

[Part 1][1] \| [Part 2][2] \| [Part 3][3]

[1]: {{ site.baseurl }}{% post_url 2017-08-02-Diagnosing-Distributed-Vulnerabilities %}
[2]: {{ site.baseurl }}{% post_url 2017-08-03-Inferring-Program-Input-Format %}
[3]: {{ site.baseurl }}{% post_url 2017-08-04-Exploring-Fuzzer-Crashes %}
[4]: https://dl.acm.org/citation.cfm?id=2519842
[5]: https://github.com/jfoote/exploitable
[6]: http://releases.llvm.org/3.8.1/tools/docs/SanitizerCoverage.html
[7]: https://clang.llvm.org/docs/LibASTMatchers.html
