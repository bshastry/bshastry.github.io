---
layout: post
title: Structure aware mruby fuzzer
---

## Intro

[Structure aware fuzzing][1] is a fuzzing technique in which you make the fuzzer aware of the structure of input.
This post describes the application of this technique to the mruby interpreter.

## What is mruby?

[mruby][2] is a lightweight ruby interpreter that is designed to be embeddable.
This means, you can use mruby to write a [20 line "C" program that executes ruby code][3].
Cool, eh? Let's fuzz it with arbitrary ruby code then.

## Why fuzz mruby?

There is some [evidence][8] that companies use mruby to execute potentially attacker-controlled ruby programs in security sensitive environments.

## Structure of a ruby program

Without awareness of the ruby programming language, the fuzzer is likely to synthesize junk.
I mean, today's fuzzers are smart but they are not smart enough to synthesize ruby programs from thin air.
That's the realm of machine learning, isn't it?
Lol.

### Function

Let's prod the fuzzer along a little bit.
Let's start by defining a very simple input template.
Our input template defines a function foo and invokes it thereafter.
```
def foo()
end
foo
```

Simple, isn't it?
What does the protobuf specification for such a function look like
```
message Function {
}
```
`Function`, for the moment, is just a stub object, that we can "visit" (in the [visitor pattern sense][4]) like so

```
void protoConverter::visit(Function const& x)
{
	m_output << "def foo()\nvar_0 = 1\n";
	m_output << "end\n";
	m_output << "foo\n";
}
```

Simple as it is, foo doesn't do anything.
To do something, we need a notion of statements.

### Statements

So let's add a notion of statements.

```
message Const {
    oneof const_oneof {
        uint32 int_lit = 1;
        bool bool_val = 2;
    }
}

message Rvalue {
  oneof rvalue_oneof {
    Const cons = 1;
  }
}

message AssignmentStatement {
  required Rvalue rvalue = 2;
}

message Statement {
  oneof stmt_oneof {
    AssignmentStatement assignment = 1;
  }
}

message StatementSeq {
  repeated Statement statements = 1;
}

message Function {
  required StatementSeq statements = 1;
}
```

This specification tells the fuzzer the following
  - A function consists of a sequence of statements
  - A statement sequence consists of at least zero statements
  - A statement can be an assignment statement
  - An assignment statement consists of a value on the right hand side
    - The value can be a constant
    - A constant is either an unsigned integer or a boolean literal

Here's the corresponding visitor.

```
void protoConverter::visit(AssignmentStatement const& x)
{
	m_output << "var_" << m_numLiveVars << " = ";
	visit(x.rvalue());
	m_output << "\n";
}

void protoConverter::visit(Statement const& x)
{
	switch (x.stmt_oneof_case()) {
		case Statement::kAssignment:
			visit(x.assignment());
			break;
		case Statement::STMT_ONEOF_NOT_SET:
			break;
	}
	m_output << "\n";
}

void protoConverter::visit(Function const& x)
{
	m_output << "def foo()\nvar_0 = 1\n";
	visit(x.statements());
	m_output << "end\n";
	m_output << "foo\n";
}
```

Let's see what this generates
```
def foo()
var_0 = 1337
var_1 = false
end
foo
```

It's definitely more lively than the foo we started out with, but it's still sorta meh.

### More statements

We can essentially translate ruby programming language rules into a somewhat equivalent protobuf specification.
And trust me, there is a lot more to be done.
We can add the notion of strings, hash values, and operations on top of them to begin with.
We can teach the fuzzer what it means to call the `Time()` builtin object.

```
Time.at(628232400) #=> 1989-11-28 00:00:00 -0500
```

I have made a humble beginning [here][5].
  - [Ruby proto spec][6]
  - [Ruby proto spec to ruby program converter class][7]

Contributions welcome. Some specific directions for future work
  - Add more ruby operations
  - Avoid generating DoSsy ruby programs like print `"1337"*10000000`

Help find deep bugs in the mruby interpreter.

[1]: https://github.com/google/fuzzer-test-suite/blob/master/tutorial/structure-aware-fuzzing.md
[2]: https://en.wikipedia.org/wiki/Mruby
[3]: http://mruby.org/docs/articles/executing-ruby-code-with-mruby.html
[4]: https://en.wikipedia.org/wiki/Visitor_pattern
[5]: https://github.com/mruby/mruby/tree/master/oss-fuzz
[6]: https://github.com/mruby/mruby/blob/master/oss-fuzz/ruby.proto 
[7]: https://github.com/mruby/mruby/blob/master/oss-fuzz/proto_to_ruby.cpp
[8]: https://hackerone.com/shopify-scripts
