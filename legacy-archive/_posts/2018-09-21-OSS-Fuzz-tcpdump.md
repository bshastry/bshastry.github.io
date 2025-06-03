---
layout: post
title: Deconstructing tcpdump test harness for OSS Fuzz
---

[OSS Fuzz][1] is Google's fuzzing infrastructure that is available for use by popular open-source projects. I had been fuzz testing [tcpdump][2] on local infrastructure for a while, so it made sense to look at this [pull request][3] made by [catenacyber][]. This post is a deconstruction of the PR.

## Intro

The unofficial motto of oss-fuzz is test little but fast. What this means is the scope of each test is somewhat limited, one typically writes a test case encompassing a handful of APIs with the hope that the fuzzer test runs really fast.
Fast can mean from a few thousand to a few hundred thousand executions per second, usually reserved for the latter.
The design philosophy of afl-fuzz, another very popular COTS fuzzer, is slightly different: fuzz what you can robustly.
Fuzz what you can usually means don't write-compile-link a test program yourself, rather use something off-the-shelf.
Say you'd like to fuzz libpng, then find a png utility such as readpng that makes calls to libpng.
Robustly means afl-fuzz makes a design choice to "isolate" the fuzzed program (say readpng) from the fuzzer (afl-fuzz).
This isolation is implemented 

In comparison, afl-fuzz in its COTS usage can typically achieve about a hundred executions per second or so, but I generalize and digress.
Objectively speaking, the speed bump may be attributed to two things: (1) unit-test like test harnesses; (2) in process fuzzing.
In process fuzzing means 
