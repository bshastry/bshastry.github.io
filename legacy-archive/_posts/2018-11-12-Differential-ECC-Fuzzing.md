

# Introduction to Differential ECC Fuzzing

This post serves as an introduction to differential ECC fuzzing.
Let's break down what that means:

- ECC: Elliptic Curve Cryptography
- Differential: Two different ECC implementations of the same curve should give the same result

The fuzzer test harness is going to be doing `abort((ecc1_p(i) == ecc2_p(i)))`, where `ecc1_p(i)` is some operation `p` as computed by ECC implementation `ecc1` for input `i`, and `ecc2_p(i)` is its counterpart for an alternate ECC implementation `ecc2.`
The big picture is as follows: Suppose you have two implementations of integer addition, both should output an identical sum when supplied two integers, say, (2,1).
These integers are obtained from the fuzzer and hence seemingly random.

The hope, therefore, is that the fuzzer synthesizes an integer pair (for this example) that shows that two implementations of addition diverge for some input pair, which they should not.
At the time, we go to the implementors and say, "hey! looks like you do different things for the same input. One of you should be wrong."
If you are lucky, fuzzing may expose a bug in the specification e.g., the spec defines add two numbers but does not define the range of these numbers.
So, one implementation may use `int` as the data type of inputs, while the other may use `unsigned int.`
Hope you got the idea :)

## ECC Primer

ECC operations are different than simple arithmetic.






