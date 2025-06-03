---
layout: post
title: Building For OSS-Fuzz
---

## Intro

This post covers some of the challenges in building fuzzer binaries tailored to oss-fuzz.
A lot of times, writing the test harness itself (C/C++ test code) is relatively easy, but getting the project to build for oss-fuzz is time-consuming.
For example, say you want to fuzz `libpng` with oss-fuzz, here's what you need to do:
  - Write the test harness that fuzzes some API(s) in `libpng` with potentially attacker-controlled data
  - Build `libpng` in a docker container supplied by Google with the latest-and-greatest Clang compiler
  - Ensure build process respects compiler flags passed by the Docker container

You need to also make sure that:
  - Fuzzer binary is built statically so that dependencies don't pose a problem for fuzzing
    - It is common practice that the containers in which building and fuzzing take place are different
    - If you install, say libxml-dev, in the build container and dynamically link against it, don't expect it to be there in the container in which fuzzing takes place
  - If you are using Memory Sanitizer (MSan), you'd have to build all dependencies from source lest you encounter false positives (i.e., wrong use-of-uninitialized memory reports)

In spite of these challenges, I like writing oss-fuzz style fuzzers for the following reasons:
  - Fast due to in-process fuzzing
  - Access to all sanitizers at the flip of a switch
  - Once built, the fuzzer can be run on a different machine targeted at the same arch

Perhaps leaning towards oss-fuzz is also a cognitive bias of some sort, cause it's almost always found a bug within minutes.

### Build systems

The first problem one encounters is dealing with non-uniform build systems; let me elaborate.
oss-fuzz supplies custom (bash) environment variables such as `CC`, `CFLAGS`, `CXX` etc.
Here's what they are meant to do:
  - Tell the build system: "Hey build system, use the compiler in the `CC` environment variable I ask you to"
  - "Use the compiler flags in the `CFLAGS` environment variable" etc.

Why use a custom compiler and flags? The simple reason is that "sanitizers" are built-into the Clang/LLVM framework, so it is essential that Clang/Clang++ be used as the compiler.
Why doesn't gcc support "sanitizers"? Well, to my understanding it does, but only "AddressSanitizater" but not MSan and UBSan; I've no clue why this is.
What are ASan, MSan, UBSan?

- ASan: Flag out-of-bounds memory reads/writes, uses of freed memory etc. (For security implications see CWE)
- MSan: Flag use of uninitialized memory (For security implications see CWE)
- UBSan: Flag undefined behavior such as logical shifts that are technically undefined in the C/C++ standard (For security implications see )

So you see, between them, A/M/UBSan flag bugs in multiple security classes, and ideally one'd want to benefit from all three of them, not just one.
This should be good incentive (hopefully) to ensure your code builds against the latest-and-greatest clang compiler.
Although I don't expect a large delta between modern gcc and clang, I have noticed in the past that Clang is more picky.
I've seen builds fail due to the `-Werror` flag that treat any warning as a (fatal) error.


I like writing oss-fuzz style fuzzers for the following reasons:
  - Fast due to in-process fuzzing
  - Access to all sanitizers at the flip of a switch
  - Built fuzzer has to be statically linked which means once built the fuzzer can be run on a different machine targeted at the same arch

Perhaps leaning towards oss-fuzz is also a cognitive bias of some sort, cause it's almost always found a bug within minutes.
Having said that, the build process required to generate a statically linked fuzzer test harness can mean a lot of dirty work.

### Build systems

The first problem one encounters is dealing with non-uniform build systems; let me elaborate.
oss-fuzz supplies custom (bash) environment variables such as `CC`, `CFLAGS`, `CXX` etc.
Here's what they are meant to do:
  - Tell the build system: "Hey build system, use the compiler in the `CC` environment variable I ask you to"
  - "Use the compiler flags in the `CFLAGS` environment variable" etc.

Why use a custom compiler and flags? The simple reason is that "sanitizers" are built-into the Clang/LLVM framework, so it is essential that Clang/Clang++ be used as the compiler.
Why doesn't gcc support "sanitizers"? Well, to my understanding it does, but only "AddressSanitizater" but not MSan and UBSan; I've no clue why this is.
What are ASan, MSan, UBSan?

- ASan: Flag out-of-bounds memory reads/writes, uses of freed memory etc. (For security implications see CWE)
- MSan: Flag use of uninitialized memory (For security implications see CWE)
- UBSan: Flag undefined behavior such as logical shifts that are technically undefined in the C/C++ standard (For security implications see )

So you see, between them, A/M/UBSan flag bugs in multiple security classes, and ideally one'd want to benefit from all three of them, not just one.
