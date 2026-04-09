---
title: "Fuzzing mruby"
date: 2018-12-05
excerpt: "Techniques and experiences fuzzing mruby, the lightweight Ruby implementation, including harness development."
tags: ["fuzzing", "mruby", "ruby", "language-implementation"]
---

[mruby][1] is the ruby compiler-interpreter for use in embedded applications.
Fuzzing mruby has financial incentives: [Shopify][2] runs a bounty program on hackerone whose bounty scope includes memory corruption vulnerabilities in the mruby compiler.

Since this program is over 2 years old, many people have already taken a stab at fuzzing mruby resulting in most low-hanging vulns being already flagged.
Admittedly, I did not find anything interesting after running the fuzzer on mruby overnight.
Nonetheless, I report my setup for you to try out.

### Step 1: Fetch source

Do this
```
$ git clone https://github.com/mruby/mruby
```

### Step 2: Write 

### Step 2: Compile

- mruby uses a make wrapper called minirake
- minirake respects custom compiler flags set via standard env variables such as CC, CXX etc.

Do this
```

```

### Step 3: Seed

### Step 4: Fuzz

### Results

### Future work
