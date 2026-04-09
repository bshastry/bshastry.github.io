---
title: "Using Taint Analysis To Write Fuzzer Test Harness"
date: 2018-08-17
excerpt: "Leveraging taint analysis techniques to create more effective fuzzer test harnesses and improve vulnerability discovery."
tags: ["taint-analysis", "fuzzing", "test-harness", "security"]
---

## Intro

While I was trying to integrate new projects into oss-fuzz, it occured to me that essentially what I was doing is taint analysis: analyzing the processing of potentially attacker-controlled data so that I could "fuzz" APIs where such processing happened.
Now, algorithms cannot deterministically conclude what is a source/sink of attacker-controlled data because ultimately that is a question of human intent.
The best we can do is to whitelist sources/sinks and automate the process of determining where a flow exists between a (whitelisted) source and a (whitelisted) sink.
Examples of sources include input processing libc functions such as `scanf`,`fscanf`, `fread`, `socket` etc.
Examples of sinks include memory management libc functions such as `malloc`, `memcpy`, `strcpy` etc.
The idea being: should there be a flow from (an `int` sourced via) `scanf` to `malloc`, an attacker **may** trigger a memory corruption vulnerability.
Here's a stupid example.

```
#include <stdio.h>

int main() {
  int size;
  void *buf;
  scanf("%d\n", &size);
  buf = malloc(size);
  free(buf);
  return 0;
}
```

Let's break down what's happening in the example:
- `scanf` is used to obtain user input (an integer) from the terminal
- `malloc` is used to allocate a buffer whose size is user provided

So, what's the bug?
- Statically speaking, if we fix `scanf` as a source of taint and `malloc` as a sink, then we have identified a flow
- These sorts of flows are exactly what the clang static analyzer is equipped to flag. So,
```
$ clang --analyze -Xanalyzer -analyzer-checker -Xanalyzer alpha.security.taint.TaintPropagation taint_example.c
taint_example.c:7:9: warning: Untrusted data is used to specify the buffer size (CERT/STR31-C. Guarantee that storage for strings has
      sufficient space for character data and the null terminator)
        buf = malloc(size);
	      ^~~~~~~~~~~~
1 warning generated.
```
- Dynamically speaking, where's the bug? How can we trigger it?
