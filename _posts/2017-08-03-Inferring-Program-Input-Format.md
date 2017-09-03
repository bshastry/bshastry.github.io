---
layout: post
title: Inferring Program Input Format
---

[Part 1][1] \| [Part 2][2] \| [Part 3][3]

## Prologue

This post is the second of the three part series on compiler assisted vulnerability diagnosis in open-source C/C++ code. "Compiler assisted" means that the presented techniques pivot around a compiler, and "vulnerability diagnosis" refers to the process of finding and fixing vulnerabilities (software weaknesses that can be used to intentionally cause harm). Software weaknesses (bugs) are a superset of vulnerabilities in that not all weaknesses are harmful from a security perspective. The challenging part of diagnosing vulnerabilities in source code is to arrive at the (usually) small subset of vulnerabilities from the (usually) larger set of bugs and non-bugs (that the source analyzer believes to be real bugs aka false positives).

## Intro

Coverage guided fuzzers such as afl-fuzz are clever enough to generate inputs that exercise new program paths. However, there are instances where additional help is valuable. By valuable, I mean one of two things: (1) Reduces time to vulnerability exposure; and/or (2) Increases number of uncovered vulns.
This post investigates one way in which additional support may be provided to the fuzzer.

## Inferring Input Format From Source Code

I will be using a [libFuzzer][4] test harness to demonstrate the central idea behind this post.
Consider the following code example.

```
$ cat <<EOF > libfuzzer-example.c
bool FuzzMe(const uint8_t *Data, size_t Size) {
    return Size >=3 &&
	    Data[0] == 'F' &&
	    Data[1] == 'U' &&
	    Data[2] == 'Z' &&
	    Data[3] == 'Z';
}

int LLVMFuzzerTestOneInput(const uint8_t *Data, size_t Size) {
    FuzzMe(Data, Size);
    return 0;
}
EOF
```

All this test harness is doing is fuzzing a buggy function called `FuzzMe()` that contains an out-of-bounds read (`Size == 3 && input == "FUZ"`).
Let's time libFuzzer on this test case on an empty corpus.

```
$ clang++ -g -fsanitize=address -fsanitize-coverage=trace-pc-guard ~/FTS/tutorial/fuzz_me.cc libFuzzer.a
$ time ./a.out
...
  Stack after return:      f5
  Stack use after scope:   f8
  Global redzone:          f9
  Global init order:       f6
  Poisoned by user:        f7
  Container overflow:      fc
  Array cookie:            ac
  Intra object redzone:    bb
  ASan internal:           fe
  Left alloca redzone:     ca
  Right alloca redzone:    cb
==15307==ABORTING
MS: 1 EraseBytes-; base unit: 6cdcffd840bb810dcdd4778c1a5caaa6cd012f0c
0x46,0x55,0x5a,
FUZ
artifact_prefix='./'; Test unit written to ./crash-0eb8e4ed029b774d80f2b66408203801cb982a60
Base64: RlVa

real    0m0.844s
user    0m0.440s
sys     0m0.180s
```

So, roughly after 0.8s, libFuzzer was able to find the input ("FUZ") that triggered the singly byte out-of-bounds read.
That's really fast.
However, it could be made faster if we can gain some insight on the program input format.
Let's run a simple clang front-end tool to extract constant strings used in comparison statements even before we start to fuzz.
Remember, we are doing a static pass over the source code here.

```
$ cat <<EOF > clang-charlitmatcher.c
#include "clang/AST/ASTConsumer.h"
#include "clang/AST/RecursiveASTVisitor.h"
#include "clang/Frontend/CompilerInstance.h"
#include "clang/Frontend/FrontendAction.h"
#include "clang/Tooling/Tooling.h"
#include "clang/ASTMatchers/ASTMatchers.h"
#include "clang/ASTMatchers/ASTMatchFinder.h"
// Declares clang::SyntaxOnlyAction.
#include "clang/Frontend/FrontendActions.h"
#include "clang/Tooling/CommonOptionsParser.h"
// Declares llvm::cl::extrahelp.
#include "llvm/Support/CommandLine.h"
#include "llvm/Support/Regex.h"
using namespace clang::tooling;
using namespace llvm;
using namespace clang;
using namespace clang::ast_matchers;
// Apply a custom category to all command-line options so that they are the
// only ones displayed.
static cl::OptionCategory MyToolCategory("clang-sdict options");
// CommonOptionsParser declares HelpMessage with a description of the common
// command-line options related to the compilation database and input files.
// It's nice to have this help message in all tools.
static cl::extrahelp CommonHelp(CommonOptionsParser::HelpMessage);
// A help message for this specific tool can be added afterwards.
static cl::extrahelp MoreHelp("\nTakes a compilation database and spits out CString Literals in source files\n");
// character literal in binary op matcher
StatementMatcher CharLitMatcher = characterLiteral(hasParent(binaryOperator())).bind("charlit");

class MatchPrinter : public MatchFinder::MatchCallback {
public :

    void printToken(StringRef token) {
      size_t tokenlen = token.size();
      if ((tokenlen == 0) || (tokenlen > 128))
        return;
      llvm::outs() << "\"" + token + "\"" << "\n";
    }

    void prettyPrintIntString(std::string inString) {

      if (inString.empty())
        return;

      size_t inStrLen = inString.size();
      if (inStrLen % 2) {
        inString.insert(0, "0");
        inStrLen++;
      }

      for (size_t i = 0; i < (2 * inStrLen); i+=4)
        inString.insert(i, "\\x");

      printToken(inString);
    }

    void formatCharLiteral(const CharacterLiteral *CL) {
      unsigned value = CL->getValue();
      std::string valString = llvm::APInt(8, value).toString(16, false);
      prettyPrintIntString(valString);
    }

    virtual void run(const MatchFinder::MatchResult &Result) {
      if (const clang::CharacterLiteral *CL = Result.Nodes.getNodeAs<clang::CharacterLiteral>("charlit"))
        formatCharLiteral(CL);
    }
};

int main(int argc, const char **argv) {
  CommonOptionsParser OptionsParser(argc, argv, MyToolCategory);
  ClangTool Tool(OptionsParser.getCompilations(),
  OptionsParser.getSourcePathList());
  MatchPrinter Printer;
  MatchFinder Finder;
  Finder.addMatcher(CharLitMatcher, &Printer);
  return Tool.run(newFrontendActionFactory(&Finder).get());
}
EOF
```

Long story short, clang front end tool does the following:
  - Makes a pass over source code AST
  - Looks for character literals that are children of binary operators
  - Prints these character literals

Note that all of this is done in under 100 lines of code including boilerplate code.
Now, let's run this against our libfuzzer code example.

```
$ clang-clmatcher libfuzzer-example.c > dict
$ cat dict
"\x46"
"\x55"
"\x5A"
"\x5A"																																																																																																																																																																																																																						     }
```

Essentially, this gave us 'F', 'U', 'Z', 'Z' (after deduplication: 'F', 'U', and 'Z'). Let's put this in an afl-style dictionary and reinvoke libfuzzer with this dictionary.
The idea is to compare the times libfuzzer takes with and without the dictionary. As we have already noted, it takes about 0.8s to spot the buffer over-read without a dictionary.

```
$ time ./a.out -dict=dict
...
MS: 3 ChangeByte-ShuffleBytes-EraseBytes-; base unit: d211f6eb0b35f1d135f354587b1a0851779fcc28
0x46,0x55,0x5a,
FUZ
artifact_prefix='./'; Test unit written to ./crash-0eb8e4ed029b774d80f2b66408203801cb982a60
Base64: RlVa

real    0m0.129s
user    0m0.012s
sys     0m0.024s
```

Naturally, it's a lot faster because we already know some things about the input format.

## Results

Of course, this works better for applications that parse highly structured inputs such as file format and network parsers.
Can it find crypto bugs faster? No, because knowledge of input format is irrelavant for bugs not in the parsing code path.
However, for parsers, this approach has worked out quite well.
You can read the [full paper][5] (to be published in Springer proceedings of RAID'17) and form your own opinion.


[Part 1][1] \| [Part 2][2] \| [Part 3][3]

[1]: {{ site.baseurl }}{% post_url 2017-08-02-Diagnosing-Distributed-Vulnerabilities %}
[2]: {{ site.baseurl }}{% post_url 2017-08-03-Inferring-Program-Input-Format %}
[3]: {{ site.baseurl }}{% post_url 2017-08-04-Exploring-Fuzzer-Crashes %}
[4]: https://llvm.org/docs/LibFuzzer.html
[5]: http://users.sec.t-labs.tu-berlin.de/~bshastry/raid17.pdf
