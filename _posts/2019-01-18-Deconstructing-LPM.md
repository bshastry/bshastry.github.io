---
layout : post
title: Deconstructing LibProtobuf/Mutator Fuzzing
---

### Intro

[LibProtobufMutator][4] (LPM) is a library that helps fuzz structured input from a [LibProtobuf][5] (LP) specification.
Among other things, LPM can [assist coverage-guided fuzzing][1].
This post explores the nitty-gritties of writing an LP-based fuzzer using [KCC's example][2].

### What we need

To write an LP-based fuzzer, what you will need are:
  - An LP specification: This is a descriptive file with a `.proto` extension
  - LP compiler: This compiles the LP spec. into code (C++ bindings) that can be called from the test harness
  - LP-to-native-format-converter: Since fuzzing happens on the LP abstraction, we need a LP formatted input to native format converter if we are to fuzz the native format.
  - Fuzzer test harness: This is a C/C++ test harness that invokes some program API that consumes (parses) native-formatted input
Most importantly, what we don't need is the LP fuzzer itself: code that mutates the LP formatted input. The fuzzer module is called LibProtobufMutator or LPM, which is an external dependency.

This seems complicated at first; it definitely is for someone, like me, who has never written an LP-based fuzzer before.
I will try to make it simpler.
I think the big idea behind this was that it is harder to ask developers to write custom fuzz mutators than it is to ask them to write a format specification and test harness.
I've never written a custom fuzz mutator before, so I'm not in a position to present my experience.
That aside, the hope with this project is that this setup (LP-based fuzzing) catches bugs faster and more methodically.
Methodically because you are fuzzing the specification and not mutating an opaque sequence of bytes.
Faster, hopefully because fuzzing only what needs to be fuzzed with only those mutations that make sense arrives at bugs faster than fuzzing everything somehow.
 
### LP specification

Here's a simple LPM spec taken from [here][2].

{% gist 7c78e89af167700387a2ac93798a1c29 %}

Here's a break-down of the most important fields:

- `syntax = proto2;`: There are two versions of the protocol buffers language, namely `proto2` and `proto3`. This specification is written using `proto2`.
- `message`: `message`, although not explicitly defined iiuc, seems to be the smallest unit of a message description. It is a named field. For example `message IHDR {` defines a message format called `IHDR`
- field rule, type, name, number: A `field` is a portion of a message.
  - field rule: specifies if the field under consideration is required, optional, or repeated. They mean just that.
  - field type: specifies the data type of the field e.g., number (`uint32`), string etc. 
  - field name: name of the field
  - field number: unique identifier for said field. It is a good practice to start numbering from `1` since smaller integers require lesser storage.

A much needed digression to understand a real-world data format, the PNG image format. The structure of the simplest PNG image is as follows:

```
--------
PNG sig
--------
IHDR
--------
IDAT(s)
--------
IEND
--------
```

Barring `IDAT`, all chunnks are singular i.e., must appear only once in a valid PNG file.

#### PNG signature

The PNG signature is a specific sequence of bytes that signal the beginning of a PNG file. It looks like so (in C/C++ code)
```
const unsigned char header[] = {0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a};
```

#### IHDR

IHDR stores image meta-data such as its width, height etc. Unlike the signature, IHDR contains variable fields. This makes it a good candidate for a protocol buffers message

From the [original PNG specification][6]

```
The IHDR chunk must appear FIRST. It contains:
   Width:              4 bytes
   Height:             4 bytes
   Bit depth:          1 byte
   Color type:         1 byte
   Compression method: 1 byte
   Filter method:      1 byte
   Interlace method:   1 byte
```

Let's look at the corresponding protobuf description:

```
message IHDR {
  required uint32 width = 1;  // maps to width
  required uint32 height = 2; // maps to height
  required uint32 other1 = 3; // maps to bitdepth-colortype-compmethod-filtmethod
  required uint32 other2 = 4;  // Only 1 byte used. (maps to interlacemethod)
}
```

As we can see, the protobuf description is "serialized" into fields of type `uint32` (4-byte sequences).
If you were to closely match the original IHDR spec, the proto-spec would look as follows (note the break-down of fields such as `bit_depth`, `color_type` etc.

```
message IHDR {
  required uint32 width = 1;
  required uint32 height = 2;
  enum bit_depth {
    1 = 1;
    2 = 2;
    4 = 3;
    8 = 4;
    16 = 5;
    255 = 6; // BYTE_MAX
  };
  enum color_type {
    0 = 1;
    2 = 2;
    3 = 3;
    4 = 4;
    6 = 5;
    255 = 6; // BYTE_MAX
  };
...
```

Although the `BYTE_MAX` option is not part of the specification, I have intentionally added it so that we make the mutator explore specific corner cases. This is hacky, I admit. Who is to say whether or not `200` is a better corner-case than `255`?

#### IDAT

The IDAT chunk contains compressed image data. This means (in LP terms) it's spec looks like so

```
message IDAT {
  required bytes data = 1;
}
```

It's an opaque byte stream, the mutator is free to synthesize whatever byte-sequence it wants to fuzz an IDAT chunk.

#### IEND

Here's how the PNG spec defines IEND

> The IEND chunk must appear LAST. It marks the end of the PNG datastream. The chunk's data field is empty.

Essentially, it is a placeholder with no data that signifies the end of a PNG image.

### The LP compiler

The LP compiler is called `protoc.` `protoc` compiles a Protobuf spec. (`.proto` file) into language bindings.
At the moment, the following language bindings are supported by the compiler: C++, Java, and Python.
In [these notes][7], it appears that support for more languges is an ongoing effort.
Invoking the compiler is quite simple, as you can see [here][2], all you need to do is

```
rm -rf genfiles && mkdir genfiles && LPM/external.protobuf/bin/protoc png_fuzz_proto.proto --cpp_out=genfiles
```

This is
  - Creating a fresh `genfiles` directory where C/C++ bindings will be stored
  - Invoking the `protoc` compiler that is available from the LPM repo against the PNG LP description we spoke about in the previous section of this blog
  - Explicitly asking the compiler to generate C++ bindings

Essentially, what this step does is to create a set of C++ header/source files that may be included/linked against by the fuzzer test harness.
The generated header/C++ files offer a simple API to access the underlying raw data behind LPM fields.

### LP to native format converter

Why do we need a converter in the first place?
Here's the thing: The LPM generates LPM formatted input that, for PNG, looks like this

```
# xxd C/002d3dd31b1bc41601c0e5d652b97f6599b23ba6
00000000: 6968 6472 207b 0a20 2077 6964 7468 3a20  ihdr {.  width: 
00000010: 300a 2020 6865 6967 6874 3a20 300a 2020  0.  height: 0.  
00000020: 6274 3a20 4244 5f4f 4e45 0a20 2063 743a  bt: BD_ONE.  ct:
00000030: 2043 545f 5448 5245 450a 2020 636d 3a20   CT_THREE.  cm: 
00000040: 434d 5f4d 4158 0a20 2066 6d3a 2046 4d5f  CM_MAX.  fm: FM_
00000050: 4d41 580a 2020 693a 2049 5f4d 4158 0a7d  MAX.  i: I_MAX.}
00000060: 0a
```

What we actually need when we are debugging is a valid PNG file, that looks like this

```
# xxd a.png
00000000: 8950 4e47 0d0a 1a0a 0000 000d 4948 4452  .PNG........IHDR
00000010: 0000 0000 0000 0000 0103 ffff ff01 fbc8  ................
00000020: 4300 0000 0049 454e 44ae 4260 82         C....IEND.B`.
```

As you can see, the LPM generated file holds a bunch of `key:value` pairs in serialized form. These need to be parsed so that we construct a serialized form of `values` in PNG format. Precisely this is the job of the converter.

In code terms, the converter is an integral part of the test harness itself (see next section).
The fuzzer harness, among other things, is accepting an LPM formatted input, converting it to a valid PNG byte stream and feeding it to the fuzzer entry-point API.

### Fuzzer test harness

Here's a gist of the test harness (written by KCC; I'm embedding it via a gist because I've not yet found a nifty way to directly embed GH files in GH pages) for us to break down

{% gist 79fb0771418c1929b6c0d6b22bf3550a %}

Let's look at the includes first:
  - some standard stuff happening with `<string>` etc.
  - `zlib.h` is needed because (quoting the original spec.)

> At present, only compression method 0 (deflate/inflate compression with a sliding window of at most 32768 bytes) is defined. All standard PNG images must be compressed with this scheme.
> Deflate-compressed datastreams within PNG are stored in the "zlib" format

  - `#include "libprotobuf-mutator/src/libfuzzer/libfuzzer_macro.h"`: This defines the `DEFINE_PROTO_FUZZER` that seems to be overridden (?) in the test harness. TBH, I dunno what's happening here.
  - `#include "png_fuzz_proto.pb.h"`: This is the `protoc` generated C++ binding header file for our LP spec.

Past the header inclusions, you see several utility functions
  - `WriteInt` writes an integer in big-endian (network byte order) format [as required by the PNG spec][8]
  - `WriteByte` simply writes a byte
  - `compress` performs zlib compression of chunk data. This is required for IDAT chunks especially
  - `WriteChunk` writes a specified PNG chunk 
  - `ProtoToPng` is where a proto is converted to a `std::string` that contains the fuzzed PNG's raw data (see previous section). This is where the LPM to native format conversion (see previous section) is happening.
  - `FuzzPNG` is the real test harness: This function feeds fuzzed raw PNG data to the underlying PNG API

The `FuzzPNG` function is defined in the PNG source repo, which is why it needs to be linked against it like so

```
$CXX $CXXFLAGS -c -DLLVMFuzzerTestOneInput=FuzzPNG libpng/contrib/oss-fuzz/libpng_read_fuzzer.cc -I libpng
$CXX $CXXFLAGS png_proto_fuzzer_example.cc libpng_read_fuzzer.o genfiles/png_fuzz_proto.pb.cc \
  -I genfiles -I.  -I libprotobuf-mutator/  -I LPM/external.protobuf/include \
  -lz \
  LPM/src/libfuzzer/libprotobuf-mutator-libfuzzer.a \
  LPM/src/libprotobuf-mutator.a \
  LPM/external.protobuf/lib/libprotobuf.a \
  libpng/.libs/libpng16.a \
  $LIB_FUZZING_ENGINE \
  -o $OUT/png_proto_fuzzer_example
```

Were you to write the FuzzPNG function yourself, it would probably [look like this][9]. Looks like standard stuff if you were to read [Chapter 13 of the PNG book][8].

### Conclusion

In this post, we explored
  - what LibprotobufferMutator is and how one can write an LP spec
  - How LP spec can help us write more targeted fuzzers
  - How the whole LP/LPM/libFuzzer setup is wired together

In an upcoming post, I plan to compare vanilla (non specification) fuzzer and an LP-based fuzzer  with the hope that such a comparison sheds light on the actual benefits of LP-based fuzzing. That's all folks!

[1]: https://chromium.googlesource.com/chromium/src/testing/libfuzzer/+/HEAD/libprotobuf-mutator.md#Write-a-grammar_based-fuzzer-with-libprotobuf_mutator
[2]: https://github.com/google/oss-fuzz/pull/2048
[3]: https://github.com/google/oss-fuzz/commit/a9099bd6afc89c387ae2c02362210be2078138db 
[4]: https://github.com/google/libprotobuf-mutator
[5]: https://github.com/protocolbuffers/protobuf
[6]: http://www.libpng.org/pub/png/spec/1.2/PNG-Contents.html
[7]: https://developers.google.com/protocol-buffers/docs/reference/other
[8]: http://www.libpng.org/pub/png/book/chapter13.html
[9]: https://chromium.googlesource.com/chromium/src/+/master/testing/libfuzzer/fuzzers/libpng_read_fuzzer.cc
