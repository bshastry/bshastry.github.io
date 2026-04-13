---
title: "Rust Arbitrary Trait"
date: 2024-08-09
excerpt: "Understanding and implementing the Arbitrary trait in Rust for property-based testing and fuzzing applications."
tags: ["rust", "testing", "fuzzing", "arbitrary"]
---

## Intro

If you have used `cargo-fuzz` or `libfuzzer-sys` in Rust, you have probably encountered the `Arbitrary` trait from the [arbitrary][1] crate. This post is a quick overview of what it does, why it matters for structure-aware fuzzing, and how to use it effectively.

## The problem with raw bytes

Traditional fuzzers like libFuzzer feed your target a `&[u8]` byte slice. For simple parsers, that works fine. But when you are fuzzing something that expects structured input---say, a transaction object or a configuration struct---you spend most of your fuzzing budget generating byte sequences that fail validation immediately.

This is where `Arbitrary` comes in. It lets you tell the fuzzer how to construct valid instances of your types directly from raw bytes, so every generated input is structurally well-formed.

## Deriving Arbitrary

The simplest way to use it is via derive:

```rust
use arbitrary::Arbitrary;

#[derive(Debug, Arbitrary)]
struct Config {
    timeout_ms: u32,
    retries: u8,
    use_tls: bool,
    mode: Mode,
}

#[derive(Debug, Arbitrary)]
enum Mode {
    Fast,
    Balanced,
    Thorough,
}
```

The derive macro generates an implementation that consumes bytes from an `Unstructured` buffer and constructs each field. Enums pick a variant based on a discriminant byte. The fuzzer still mutates raw bytes under the hood, but your fuzz target receives a valid `Config` every time.

## Writing a fuzz target

With `cargo-fuzz`, the target looks like this:

```rust
#![no_main]
use libfuzzer_sys::fuzz_target;
use arbitrary::Arbitrary;

#[derive(Debug, Arbitrary)]
struct MyInput {
    key: Vec<u8>,
    value: Vec<u8>,
    ttl: u32,
}

fuzz_target!(|input: MyInput| {
    // Every invocation gets a well-formed MyInput.
    // Focus fuzzing energy on logic bugs, not parsing failures.
    let _ = my_crate::store(input.key, input.value, input.ttl);
});
```

No manual deserialization, no early returns on malformed input. The fuzzer explores your actual logic from the first iteration.

## Custom implementations

Sometimes the derive is not enough. For example, you might want to constrain a field to a specific range or ensure two fields are consistent with each other. In that case, implement `Arbitrary` manually:

```rust
use arbitrary::{Arbitrary, Unstructured, Result};

#[derive(Debug)]
struct BoundedPair {
    lo: u32,
    hi: u32, // invariant: hi >= lo
}

impl<'a> Arbitrary<'a> for BoundedPair {
    fn arbitrary(u: &mut Unstructured<'a>) -> Result<Self> {
        let a: u32 = u.arbitrary()?;
        let b: u32 = u.arbitrary()?;
        Ok(BoundedPair {
            lo: a.min(b),
            hi: a.max(b),
        })
    }
}
```

This guarantees the invariant holds for every generated instance. The fuzzer never wastes time on inputs where `hi < lo`.

## Tips

- **Start with derive, customize later.** The derive covers most cases. Only write a manual impl when you need invariants the derive cannot express.
- **Use `arbitrary::Unstructured` in tests too.** You can seed it with a fixed byte slice for reproducible property tests outside the fuzzer.
- **Combine with `#[derive(Debug)]`.** When the fuzzer finds a crash, `Debug` output gives you a readable reproduction case instead of a hex dump.
- **Watch the byte budget.** `Unstructured` has a finite buffer. If your type is large (deeply nested, many `Vec`s), the fuzzer may need a higher `-max_len` to explore it effectively.

## Conclusion

The `Arbitrary` trait bridges the gap between byte-level mutation and structure-aware fuzzing in Rust. By describing how to construct your types from raw bytes, you let the fuzzer skip the parsing gauntlet and go straight to exercising your logic. For most Rust fuzzing projects, it is the single highest-leverage thing you can adopt.

[1]: https://docs.rs/arbitrary/latest/arbitrary/
