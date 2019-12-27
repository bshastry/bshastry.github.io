---
layout: post
title: Custom Proto Mutation
---

## Intro

This post describes how you can write your own custom protobuf mutators. Protobuf mutators are routines that mutate or change protobuf input. Protobuf input is essentially structured text. It looks like this:

```
message {
	sub_message {
		int_field: 2
		string_field: "hello"
	}
}
```

A custom proto mutation is a routine that, say, mutates the `string_field` of `sub_message` from the string `hello` to the string `world`.

## Motivation

What is the use of a custom proto mutation? The thing is [structured fuzzing][1] is useful to fuzz programs that accept structured input. A popular implementation technique to perform structured fuzzing is via the use of (1) [protocol buffers library][2] to define input structure; and (2) [libprotobuf mutator library][3] to perform random protobuf mutations. Random protobuf mutations may be sufficient already, so at the risk of sounding repetative, what is the use of a custom proto mutation?

Well, think of it like this. Say you are fuzzing a program that you have written. You obviously know more about your program than a random fuzzer would, notwithstanding the power of coverage guidance. So, let's say, you **know** that your program will perform a state transition when an input field described by `sub_message`'s `string_field` is `world` and not `hello`. Now, to trigger this mutation without a custom mutator, you'd typically wait for the random mutator, through a series of mutations, to change `hello` to `world`. Although this is not too far-fetched, it consumes resources i.e., time and computation cycles.

The point is, if you **know** some mutation is important for your program, why would you wait for it to be synthesized randomly? Why not program it as part of the fuzzer itself, right?

## Writing a custom proto mutator

Now, I describe the technical part of writing your own custom proto mutator, using [libpng proto fuzzer][4] as an example. The [libpng\_proto\_fuzzer\_example.cc][5] source file describes how to convert protobuf structure defined in [png\_fuzz\_proto.proto][6] to a PNG file. I'll set ourselves the relatively simple task of writing a mutator that mutates an `OtherChunk` such that `unknown_type` chunks are changed to `known_type` chunks.

### libprotobuf-mutator postprocessor callbacks

Before we code the actual mutation routine, let's take some time to appreciate the callback facility provided by libprotobuf-mutator to enable custom mutations. I believe this callback was first implemented in [this pull request][7]. Essentially, the user of libprotobuf-mutator, can register a postprocessor callback on a protobuf message type. This postprocessor is then invoked after **every** mutation performed by libprotobuf-mutator.

### Callback interface

The callback interface [looks like so](https://github.com/google/libprotobuf-mutator/blob/dd89da92b59b1714bab6e2a135093948a1cf1c6a/src/libfuzzer/libfuzzer_macro.h#L109-L112). Essentially, the interface contains two input parameters:
  - const pointer to message descriptor
  - function that implements the custom mutation routine. This function accepts two inputs:
    - pointer to protobuf message
    - seed (unsigned integer)

I will briefly describe each of them in the following paragraphs.

#### Message

A protobuf message is a unit of input structure. A message may contain fields that may be of a value type (i.e., integer, bool, string etc.) or non-value type e.g., message. In our dummy example, `message` and `sub_message` are protobuf messages that describe something. The reason this is part of the callback interface is that, ultimately, we (custom mutation implementors) would like to mutate this data with custom changes.

#### Message descriptor

A message descriptor describes the nature of a message. The reason this is part of the callback interface is that, internally, libprotobuf-mutator maps a callback (custom mutation routine) against a descriptor. So, for example, if we were to implement a custom mutator for changing the `string_field` in our dummy example, it would have to be registered against the descriptor of the `sub_message` message type's descriptor. To do that, we use protoc (protobuf compiler) generated static function call `sub_message::descriptor()`.

#### Seed

A seed is a pseudo-random number supplied by libprotobuf-mutator to help the mutation writer tune their mutation. The reason this is part of the callback interface is that, often, mutation routine implementors (us) would want their mutation to be applied only every once in a while. To permit this while keeping fuzzing deterministic, a pseudo-randomly (but deterministically) generated seed is supplied for use by the mutation routine implementor.

A simple manner in which `seed` may be used is via the modulo operator, like so

```
/// Apply my mutation roughly once every three LPM mutations
if (seed % 3 == 0)
{
  apply_my_mutation();
}
```


#### Callback function

Now that we understand the structure and reasoning behind LPM's postprocessor interface, we can implement the mutation routine: Change `hello` to `world`

```
protobuf_mutator::libfuzzer::RegisterPostProcessor(
	sub_message::descriptor(),
	[](google::protobuf::Message* message, unsigned int seed)
	{
		sub_message *sub_msg = static_cast<sub_message *>(message);
		if (seed % 2)
		{
			if (sub_msg->string_field() == "hello")
			{
				sub_msg->set_string_field("world");
			}
		}
	}
);
```

Here's what we are doing:
  - Register a custom post processor for the `sub_message` message type
  - statically casting the canonical protobuf message type to `sub_message` message type before further checks
  - applying custom mutation 50% of the time
  - if `string_field` is set to `hello`, then we change it to `world`

### libpng custom mutator

Now, we are ready to apply what we have learnt to the linked libpng-proto fuzzer. Here's [a portion of the pull request](https://github.com/google/oss-fuzz/pull/3168/files#diff-0e216d0c3c3e73c9bdee0a482ac288beR20-R33) in which I implement a simple mutator routine that changes `unknown_type` chunks to a `known_type` chunk:

The really cool part is it is 4 lines of source code to do this :-)

## Conclusion

This post hopefully made it easier for you to understand and write custom proto mutation routines for your fuzzer. Have fun writing them and experimenting a little until you find that elusive bug that randomness could not find ;-)

[1]: https://github.com/google/fuzzing/blob/master/docs/structure-aware-fuzzing.md
[2]: https://github.com/protocolbuffers/protobuf
[3]: https://github.com/google/libprotobuf-mutator
[4]: https://github.com/google/oss-fuzz/tree/master/projects/libpng-proto
[5]: https://github.com/google/oss-fuzz/blob/master/projects/libpng-proto/png_proto_fuzzer_example.cc
[6]: https://github.com/google/oss-fuzz/blob/master/projects/libpng-proto/png_fuzz_proto.proto
[7]: https://github.com/google/libprotobuf-mutator/pull/137
