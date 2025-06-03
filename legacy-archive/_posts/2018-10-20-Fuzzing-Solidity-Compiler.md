---
layout: post
title: Fuzzing the Solidity Compiler
---

## Intro

This post describes related work in the field of compiler fuzzing, the motivation for fuzzing the Solidity compiler, how to fuzz it, and the kind of bugs it helps find.
In the final section of this post, I briefly discuss what could be done to target more interesting code.

First things first.
Solidity is a high-level programming language for creating smart contracts.
The [solidity compiler][1] is the official compiler for programs (aka smart contracts) written in the Solidity programming language.
In the context of this post, Solidity means the compiler implementation and not the language itself.

Disclaimer: The bugs disclosed in this post have been reported upstream. More importantly, the bugs are benign typing errors that have no security implications to the best of my knowledge.
Therefore, I see no harm in disclosing them.
If this post inspires you to fuzz Solidity and you happen to find a security-critical bug, please consider reporting it to the [Ethereum bounty program][12].

## Related Work

Folks have fuzzed
  - Ethereum VM implementations e.g., [this][4], [that][5]
  - Applications (smart contracts) e.g., [this][6]

The compiler, Solidity, has garnered lesser attention.
Solidity, falls in between applications and EVM.
It compiles applications to EVM byte code that is executed by the underlying EVM implementation.

Fuzzing compilers is nothing new.
For example, the [CSmith][7] project is geared towards finding bugs in C compilers.
[Kostya Serebryany's][8] talk at llvm-dev meeting describes how to intelligently fuzz compilers using a technique he calls "structure aware fuzzing".
His main observation is that fuzzing compilers with generic mutators (e.g., bit flips, add/remove bytes) is less likely to generate parseable programs.
So his talk is a call for mutators that understand the structure of input accepted by the program e.g., the structure of a C program.
This is an interesting idea for fuzzing solidity as well that I shall briefly discuss in the final section of this post.

## Motivation

Some reasons for fuzzing the Solidity compiler are:
  - Test compiler stability e.g., crash freedom
  - Test compiler correctness e.g., code generation

I will add one more reason that drew me to fuzzing Solidity
  - Test the de-facto Solidity specification

Here, I refer to the following statement sourced from a paper titled "Defining the Ethereum Virtual Machine for Interactive Theorem Provers" by Y. Hirai (**emphasis mine**).

>Although ultimately all Ethereum smart contracts are deployed as EVM bytecode, the bytecode is rarely directly written.
>The most popular programming language Solidity has a rich syntax but **no specification**. **The only definition of Solidity is the Solidity compiler implementation**, which compiles Solidity programs into EVM bytecode.

To me, this implies:
  - Bugs in Solidity may impact correctness of Solidity-written smart contracts
  - Bugs in Solidity may shed light on bugs in Solidity language design

I don't think Solidity is the only language that does not have a specification.
Actually, I'm pretty sure very few programming languages have a formal spec.
So, I'm not sure these reasons are specific to Solidity.
Perhaps, the most important reason to fuzz the Solidity compiler is (quoting Y. Hirai again)

>  A deployed Ethereum smart contract is public under adversarial scrutiny, and the code is not
>  updatable. Most applications (auctions, prediction markets, identity/reputation
>  management etc.) involve smart contracts managing funds or authenticating external
>  entities. In this environment, the code should be trustworthy.

In the worst case, bugs in Solidity could lead to unintended code execution in the context of security-critical applications.
However, the bugs discussed in this post are benign so treat my previous statement as FUD.

## Test harness

Fortunately for me, the test harness that was used for fuzzing is maintained in the source repo.
It is my understanding that Solidity is routinely fuzzed using afl-fuzz.
So, kudos to the Solidity team to have integrated fuzzing in their SDLC.

Here's what the test harness looks like at a high level:
```
int main()
{
    ...
    // data, size are sourced from stdin
    string input(reinterpret_cast<const char*>(data), size);
    testCompiler(input);
}
```

Essentially, it:
  - Takes a binary byte stream from stdin
  - converts this into a string
    - The string is the solidity program that is fed to the compiler
  - compiles the string (solidity program)

`testCompiler` is a utility function that eventually makes a call to the `compileStandard` API exposed by the solidity compiler library called `libsolc`.
The nifty thing about this API interface is that it does I/O via JSON objects.
This means the `compileStandard` API accepts input via a JSON object and spits another JSON object as output.
How is the input string (solidity program) serialized into a JSON object you ask?

Simple, the fuzzed input goes into a field called `sources[""]["content"]`. Here's a sample input accepted by `compileStandard`

{% gist 30193d6a3ae438043821d04ff3f863dd %}

The other fields in this JSON object are targeted at configuring compilation parameters such as optimization level, compiler output formating etc.
The output produced by the API is rather long but very detailed, so let's overlook that for now.

## Fuzzing

The fuzzing itself is quite straightforward. Here's what you do (tested on Ubuntu 18.04):

```
// Fetch dependency
$ sudo apt install libboost-all-dev
// Fetch solidity
$ git clone https://github.com/ethereum/solidity.git
$ cd solidity && mkdir build
// Build, turning off SMT solver support
$ cd build && cmake -DUSE_Z3=OFF -DUSE_CVC4=OFF ..
$ make solfuzzer -j
// Populate afl-in with seeds
$ mkdir afl-in
$ find . -type f -name "*.sol" -exec cp {} -t afl-in \;
// Fuzz
$ afl-fuzz -m none -i afl-in -o afl-out -- solfuzzer
```

This
  - Installs boost libs required to compile solidity (and the fuzzer)
  - Fetches, and compiles the solidity fuzzer
  - Uses solidity contracts present in the source repo as fuzzing seeds
  - Runs afl-fuzz on the fuzzing binary

The fuzzing itself is very slow (under 100 execs/s).
However, it already helped find a couple of type-related bugs one of which was already known and the other was new.

## Results

### Bug 1: Unexpected function type conversion

Here's the [new bug][9] that fuzzing discovered
```
$ ./solc issue_5279.sol 
Internal compiler error during compilation:
/home/bhargava/work/github/solidity/libsolidity/codegen/CompilerUtils.cpp(1020): Throw in function void dev::solidity::CompilerUtils::convertType(const dev::solidity::Type&, const dev::solidity::Type&, bool, bool, bool)
Dynamic exception type: boost::exception_detail::clone_impl<dev::solidity::InternalCompilerError>
std::exception::what: Invalid type conversion requested.
[dev::tag_comment*] = Invalid type conversion requested.
```

tl;dr
  - `solc` is the solidity compiler binary
  - `issue_5279.sol` is the solidity contract (found by fuzzing) that triggers the bug
  - The bug is an assertion failure that states the cause as `Invalid type conversion requested`

Here's the full contract that triggers this bug
```
contract C {
    function h() pure external {
    }
    function f() view external returns (bytes4) {
            function ()  external g = this.h;
            return g.selector;
    }
}
// ----
```

As commented by one of the lead devs of Solidity ([Chris][2]), here's the diff contract that does __not__ trigger the bug
```
contract C {
    function h() pure external {
    }
    function f() view external returns (bytes4) {
            function () pure external g = this.h;
            return g.selector;
    }
}
```

So, what's the invalid type conversion that the bug is talking about?

Some basics before we proceed.

What is a pure function?
> Functions can be declared pure in which case they promise not to read from or modify the state.

What is a view function?
> Functions can be declared view in which case they promise not to modify the state.

What is an external function?
> External functions are part of the contract interface, which means they can be called from other contracts and via transactions. An external function f cannot be called internally (i.e. f() does not work, but this.f() works). External functions are sometimes more efficient when they receive large arrays of data.
Functions can be declared pure in which case they promise not to read from or modify the state.

What is a function selector?
> The first four bytes of the call data for a function call specifies the function to be called. It is the first (left, high-order in big-endian) four bytes of the Keccak (SHA-3) hash of the signature of the function. The signature is defined as the canonical expression of the basic prototype, i.e. the function name with the parenthesised list of parameter types. Parameter types are split by a single comma - no spaces are used.

tl;dr
  - pure means stateless
  - view means (stateful) read-only
  - external means just that
  - a function selector is the first four bytes of the hash of the function's signature
    - imagine taking a SHA-3 hash of a c++ mangled function and using its first four bytes

From these facts, here's my understanding of the bug.
First, note that the difference between buggy and non-buggy contracts is the following line of buggy code

```
function ()  external g = this.h;
```

- `this.h` is an external `pure` (aka stateless) function 
- `g` on the other hand is simply an external function

Evidently, there is (implicit) type conversion happening here.
If one looks into the faulting code, here's what one would find:

```
void CompilerUtils::convertType(
     Type const& _typeOnStack,
     Type const& _targetType,
     bool _cleanupNeeded,
     bool _chopSignBits,
     bool _asPartOfArgumentDecoding)
{
...
   switch(stackType)
   ...
   case default:
   ...
   solAssert(_typeOnStack == _targetType, "Invalid type conversion requested.");
...
}
```

The next thing I did is firing up a gdb instance and debugging.
Here's what I found on line 1020 (the failing assertion)

```
(gdb) p _typeOnStack.richIdentifier()
$1 = "t_function_external_pure()returns()"
(gdb)  p _targetType.richIdentifier()
$2 = "t_function_external_nonpayable()returns()"
```

The buggy contract has led the compiler to make an invalid type conversion.
But I thought solidity is a statically typed language in which such errors are picked up at compile time?
Evidently, there is some dynamic typing going on with implicit function casts which led to this bug.

### Bug 2: Variable declaration type error

This was a [known bug][3] but the fuzzer kinda [rediscovered][10] it in a different context imo.
Here's the buggy solidity contract that triggers a (dynamic) type error.
```
library L{struct Nested{n y;}function(function(Nested)external){}}
```

Here's the error it throws up:
```
Internal compiler error during compilation:
/home/bhargava/work/github/solidity/libsolidity/ast/Types.cpp(2127): Throw in function virtual bool dev::solidity::StructType::canBeUsedExternally(bool) const
Dynamic exception type: boost::exception_detail::clone_impl<dev::solidity::InternalCompilerError>
std::exception::what:
[dev::tag_comment*] =
```

Let's fire up gdb and find out what the failing assertion in `Types.cpp` on line `2127` is all about.

Here's the buggy code in question
{% gist f9d7c7104c79954fc2d38d8c050620b0 %}

```
(gdb) p var->annotation().type.get()
$3 = (std::__shared_ptr<dev::solidity::Type const, (__gnu_cxx::_Lock_policy)2>::element_type *) 0x0
(gdb) bt
#0  dev::solidity::StructType::canBeUsedExternally (this=0x558db174d750, _inLibrary=false) at /home/bhargava/work/github/solidity/libsolidity/ast/Types.cpp:2127
#1  0x0000558db0774719 in dev::solidity::ReferencesResolver::endVisit (this=0x7ffd332ee5f0, _typeName=...) at /home/bhargava/work/github/solidity/libsolidity/analysis/ReferencesResolver.cpp:210
#2  0x0000558db07ca836 in dev::solidity::FunctionTypeName::accept (this=0x558db1746b60, _visitor=...) at /home/bhargava/work/github/solidity/libsolidity/ast/AST_accept.h:339
```

Evidently, as the Solidity contract's AST is being built up, and while a function declaration is being visited and its parameters resolved, the compiler complains that a member of the referenced struct is not typed.

I expected the compiler to throw up an error that the type of member `y` of struct `Nested` is undefined.
Seemingly, this is not happening.
However, if I modify the buggy contract like so:

```
library L{struct Nested{n y;}function(function()external){}}
```

The compiler correctly throws up a warning that the user-defined type `n` is undefined.

```
$ solc mod_contract.sol
Warning: This is a pre-release compiler version, please do not use it in production.
			     ../../bugs/issue_5340_min.sol:1:25: Error: Identifier not found or not unique.
			     library L{struct Nested{n y;}function(function()external){}}
``` 

I have a feeling that there is some lazy type resolution going on that results in a run-time error for what should be a compile-time error.

## Next Steps

It's very cool that the Solidity compiler team is using fuzzing as part of their SDLC to catch bugs like this.
So far, most of the bugs found point to deficiencies in typing rules for Solidity.
Although this is a good first step, it won't find bugs in the more critical compiler back-end component that is responsible for generating EVM code.
A bug in the back-end that generates incorrect EVM code is a lot more interesting from a security perspective.

The main drawback of the current test harness is speed.
This could be addressed by targeted fuzz testing of specific portions of the compiler rather than the entire compiler in one test.
This is akin to fuzzing unit tests.

Finally, Kostya's call for structure-aware fuzzing mutators is something that should go heeded in the Solidity space as well.
There has been some work on this front in the [Solidity community][11].
It'd be cool to use this infra to fuzz Solidity.

In summary
  - fuzz specific security-critical components
  - break fuzz tests down to smaller units
  - use custom fuzz mutators

That's all folks!

[1]: https://github.com/ethereum/solidity
[2]: https://github.com/ethereum/solidity/issues/5279#issuecomment-432673495
[3]: https://github.com/ethereum/solidity/issues/5048
[4]: https://github.com/trailofbits/echidna
[5]: https://github.com/holiman/evmfuzz
[6]: https://dl.acm.org/citation.cfm?id=3238177
[7]: https://embed.cs.utah.edu/csmith/
[8]: https://llvm.org/devmtg/2017-10/slides/Serebryany-Structure-aware%20fuzzing%20for%20Clang%20and%20LLVM%20with%20libprotobuf-mutator.pdf
[9]: https://github.com/ethereum/solidity/issues/5279
[10]: https://github.com/ethereum/solidity/issues/5340
[11]: https://github.com/ethereum/solidity/issues/1172
[12]: https://bounty.ethereum.org/
