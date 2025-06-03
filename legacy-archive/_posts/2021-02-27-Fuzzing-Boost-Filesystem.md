---
layout : post
title: Writing a Fuzz Unit Test for a Boost Filesystem API
---

### Intro

This post summarizes one fuzz unit test for the boost filesystem and a bug it found.
Feel free to explore the rather vast landscape of boost filesystem APIs in order to write more unit tests.
Help make Boost more robust.

### Fuzz unit test

The following unit test

```
#include <boost/filesystem.hpp>
#include <string>

using namespace std;
using namespace boost::filesystem;

extern "C" int LLVMFuzzerTestOneInput(const uint8_t* data, size_t size)
{
        string pathString(reinterpret_cast<const char*>(data), size);
        path p(pathString);
        p.remove_filename();
        return 0;
}
```

when compiled and run like so (tested on Linux bash console)

```
echo -e "                                          
#include <boost/filesystem.hpp>
#include <string>

using namespace std;
using namespace boost::filesystem;

extern \"C\" int LLVMFuzzerTestOneInput(const uint8_t* data, size_t size)
{
        string pathString(reinterpret_cast<const char*>(data), size);
        path p(pathString);
        p.remove_filename();
        return 0;
}
" | clang++ -x c++ - -fsanitize=fuzzer -o fuzz_bfs -lboost_filesystem && time ./fuzz_bfs
```

prints the following output on the console (Linux, x86, clang v10, boost v1.71)

```
INFO: Seed: 3723374228
INFO: Loaded 1 modules   (321 inline 8-bit counters): 321 [0x4f5150, 0x4f5291), 
INFO: Loaded 1 PC tables (321 PCs): 321 [0x4c8f98,0x4ca3a8), 
INFO: -max_len is not provided; libFuzzer will not generate inputs larger than 4096 bytes
INFO: A corpus is not provided, starting from an empty corpus
#2	INITED cov: 4 ft: 5 corp: 1/1b exec/s: 0 rss: 24Mb
terminate called after throwing an instance of 'std::out_of_range'
  what():  basic_string::erase: __pos (which is 18446744073709551615) > this->size() (which is 5)
==702779== ERROR: libFuzzer: deadly signal
    #0 0x4b00f0 in __sanitizer_print_stack_trace (/home/bhargava/fuzz_bfs+0x4b00f0)
    #1 0x45c3f8 in fuzzer::PrintStackTrace() (/home/bhargava/fuzz_bfs+0x45c3f8)
    #2 0x441543 in fuzzer::Fuzzer::CrashCallback() (/home/bhargava/fuzz_bfs+0x441543)
    #3 0x7f45aa9513bf  (/lib/x86_64-linux-gnu/libpthread.so.0+0x153bf)
    #4 0x7f45aa76218a in __libc_signal_restore_set /build/glibc-ZN95T4/glibc-2.31/signal/../sysdeps/unix/sysv/linux/internal-signals.h:86:3
    #5 0x7f45aa76218a in raise /build/glibc-ZN95T4/glibc-2.31/signal/../sysdeps/unix/sysv/linux/raise.c:48:3
    #6 0x7f45aa741858 in abort /build/glibc-ZN95T4/glibc-2.31/stdlib/abort.c:79:7
    #7 0x7f45aab6a950  (/usr/lib/x86_64-linux-gnu/libstdc++.so.6+0x9e950)
    #8 0x7f45aab7647b  (/usr/lib/x86_64-linux-gnu/libstdc++.so.6+0xaa47b)
    #9 0x7f45aab764e6 in std::terminate() (/usr/lib/x86_64-linux-gnu/libstdc++.so.6+0xaa4e6)
    #10 0x7f45aab76798 in __cxa_throw (/usr/lib/x86_64-linux-gnu/libstdc++.so.6+0xaa798)
    #11 0x7f45aab6d3ea  (/usr/lib/x86_64-linux-gnu/libstdc++.so.6+0xa13ea)
    #12 0x7f45aaac0a22 in boost::filesystem::path::remove_filename() (/usr/lib/x86_64-linux-gnu/libboost_filesystem.so.1.71.0+0x12a22)
    #13 0x4b26a7 in LLVMFuzzerTestOneInput (/home/bhargava/fuzz_bfs+0x4b26a7)
    #14 0x442c01 in fuzzer::Fuzzer::ExecuteCallback(unsigned char const*, unsigned long) (/home/bhargava/fuzz_bfs+0x442c01)
    #15 0x442345 in fuzzer::Fuzzer::RunOne(unsigned char const*, unsigned long, bool, fuzzer::InputInfo*, bool*) (/home/bhargava/fuzz_bfs+0x442345)
    #16 0x4445e7 in fuzzer::Fuzzer::MutateAndTestOne() (/home/bhargava/fuzz_bfs+0x4445e7)
    #17 0x4452e5 in fuzzer::Fuzzer::Loop(std::__Fuzzer::vector<fuzzer::SizedFile, fuzzer::fuzzer_allocator<fuzzer::SizedFile> >&) (/home/bhargava/fuzz_bfs+0x4452e5)
    #18 0x433c9e in fuzzer::FuzzerDriver(int*, char***, int (*)(unsigned char const*, unsigned long)) (/home/bhargava/fuzz_bfs+0x433c9e)
    #19 0x45cae2 in main (/home/bhargava/fuzz_bfs+0x45cae2)
    #20 0x7f45aa7430b2 in __libc_start_main /build/glibc-ZN95T4/glibc-2.31/csu/../csu/libc-start.c:308:16
    #21 0x408a3d in _start (/home/bhargava/fuzz_bfs+0x408a3d)

NOTE: libFuzzer has rudimentary signal handlers.
      Combine libFuzzer with AddressSanitizer or similar for better crash reports.
SUMMARY: libFuzzer: deadly signal
MS: 4 ChangeBit-InsertRepeatedBytes-ShuffleBytes-EraseBytes-; base unit: adc83b19e793491b1c6ea0fd8b46cd9f32e592fc
0x2f,0x2f,0x2f,0x2f,0x2f,
/////
artifact_prefix='./'; Test unit written to ./crash-ece6d237a9393e5c002c541f9d4c92136941d956
Base64: Ly8vLy8=

real    0m1.610s
user    0m1.524s
sys     0m0.008s
```

This bug was [reported][1] upstream and promptly [fixed][2] (thank you boost devs!).


The crash may be interpreted as follows:

- If you feed an input "/////" to the boost filesystem path object and attempt to remove filename, it throws an exception
- The exception if of type [std::out_of_range][3]

Quoting

> (std::out\_of\_range) reports errors that are consequence of attempt to access elements out of defined range.

> It may be thrown by the member functions of std::bitset and std::basic\_string, by std::stoi and std::stod families of functions, and by the bounds-checked member access functions (e.g. std::vector::at and std::map::at).

Typically, malformed inputs like these should not throw low-level exceptions such as this one which is why it is a bug.

### Conclusion

It is rather easy to get started with fuzzing boost filesystem APIs.
The test in this blog post hardly spans three lines of code (excluding boilerplate), so you get the idea.
Hope this post inspires you to explore other nooks and corners of boost filesystem API, and perhaps even fuzz them.
The hope is that this will make the boost C++ libraries that several of us---especially in the open-source world---rely on, safer.
Stay healthy!

[1]: https://github.com/boostorg/filesystem/issues/176
[2]: https://github.com/boostorg/filesystem/commit/cc57d28995c4a61e19d718040f9bc616b111a552
[3]: https://en.cppreference.com/w/cpp/error/out_of_range
