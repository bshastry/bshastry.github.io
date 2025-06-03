---
layout: post
title: libfuzzer vs. afl-fuzz
---

libfuzzer and afl-fuzz are two very popular production-grade off-the-shelf fuzzers.
In this post, I compare them on parameters chosen arbitrarily that hopefully are meaningful to the intended audience of this post: security researchers and test engineers.

## Intro

I shall compare libfuzzer and afl-fuzz on two parameters: test harness and speed.
Test harness means the test program (written in C/C++) that is compiled-linked to a test binary that is used for fuzzing.
Speed means how many executions per second the fuzzer is able to do, higher speeds usually find the same bugs but faster.

The unofficial motto of oss-fuzz is test little but fast. What this means is the scope of each test harness is somewhat limited, one typically writes a test case encompassing a handful of APIs with the hope that the fuzzing is really fast.
Fast can mean from a few thousand to a few hundred thousand executions per second, usually reserved for the latter.
The unofficial motto of afl-fuzz, another very popular COTS fuzzer, is slightly different: fuzz what you can robustly.
Fuzz what you can usually means "don't bother writing a test harness, find one."
Robust means "don't let the fuzzed program bring down the fuzzer" OR isolate the fuzzed entity from the fuzzer.

## Test harness

Let's compare test harnesses for libfuzzer and afl-fuzz by using libpng as an example.

### libfuzzer

Here's test harness for libpng in its entirety taken from oss-fuzz (Tip: You can skip the 125 lines of code that follows)

{% gist 7666502bc1fc0513d45f64f6fa3ffc83 %}

A few meta things:
  - If you want to fuzz libpng for fun or to simply try your hand at fuzzing, you probably don't want to write the test harness shown above
  - OTOH if you **have** written C code for libpng before, you may want to stress test portions of libpng you are interested in.

Let's assume you are in the latter category of people (a minority, I know).
More realistically, let's assume you are going to get paid to do this, so let's see what is happening in this test harness under-the-hood.

First, the entry point for your test program is the `LLVMFuzzerTestOneInput(const uint8_t *data, size_t size)` API.
```
extern "C" int LLVMFuzzerTestOneInput(const uint8_t* data, size_t size) {
```

This API takes a constant byte stream and the length of this byte stream as input.
The byte stream is const because it sorta mimics user input, which you are expected to read-only.
One of the perks of fuzzer test writing is that you don't have to worry about data mutation yourself: libFuzzer feeds you "smartly" mutated input; all you need to do is process it.
So, let's get to the processing part.

The test harness begins with an if clause that is presumably doing some input sanitization.
```
  if (size < kPngHeaderSize) {
      return 0;
  }
```
The idea here is, you want to bail out from the TH as soon as possible if the input does not make sense.
In this instance, the test writer took the call that byte stream whose lengths are under some constant `kPngHeaderSize` is of little value, so they bailed out.
This makes sense, since you don't want to be spending precious processor cycles when the input does not even make sense.
Titbit, you always bail out with a `return 0` even in error-handling code since other return codes are reserved by libFuzzer for other libFuzzer related error scenarios.

The TH goes on to invoke a png API called `png_sig_cmp` after doing some data initialization.
```
  std::vector<unsigned char> v(data, data + size);
  if (png_sig_cmp(v.data(), 0, kPngHeaderSize)) {
      // not a PNG.
      return 0;
  }
```
Presumably the test writer decided to copy over the contents of the byte stream (using a std::vector data type) before doing checks on the data: I may be right because `png_sig_cmp` expects a non-const data stream as the first argument.
Anyway, as before, the TH bails out if the signature of the fuzzed data does not match the given number of bytes of PNG signature: why continue processing a PNG if it is not a valid PNG, right?
This pattern of bailing out recurs later in the TH: while initializing the PNG structure for reading a PNG file, initializing png_info structure etc.

The interesting part of the TH starts on line 97

```
  PngObjectHandler png_handler;
  png_handler.png_ptr = nullptr;
  png_handler.row_ptr = nullptr;
  png_handler.info_ptr = nullptr;
  png_handler.end_info_ptr = nullptr;

  png_handler.png_ptr = png_create_read_struct
  (PNG_LIBPNG_VER_STRING, nullptr, nullptr, nullptr);
  if (!png_handler.png_ptr) {
     return 0;
  }

  png_handler.info_ptr = png_create_info_struct(png_handler.png_ptr);
  if (!png_handler.info_ptr) {
     PNG_CLEANUP
     return 0;
  }
```

Essentially, the TH initializes a handful of png specific data structures before processing the fuzzed data.
The TH also makes use of png setter functions to set transforms that are typically used by browsers.
A much needed digression is in order here: What are transformations?

Before we answer that question, let's understand the format of PNG images a little bit.
Quoting [libpng.org][], "The fundamental building block of PNG images is the chunk."
A chunk is supposed to look like so:

```
--------
length
--------
type
--------
data
--------
CRC
--------
```

A PNG image is composed of different kinds of chunks. For example, the structure of the simplest PNG (going by libpng.org) is:

```
--------
PNG sig
--------
IHDR
--------
IDAT
--------
IEND
--------
```

where IHDR, IDAT, and IEND are three different kinds of chunks: IHDR contains image meta-data e.g., height, width, pixel depth, compression and filtering methods, so on and so forth; IDAT contains the actual pixel data, the bytes that characterize the image as such; IEND is used to signal the last chunk of all in an image.

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
