---
layout: post
title: Quick Dive into Trail of Bit's Slither
---

## Intro

[Slither][1] is a static analyzer that has been developed by Trail of Bits to help smart contract developers find bugs in their code.
In this post, I'll try to get my hands dirty with Slither so you don't have to.
Moreover, having a background writing static analysis tools myself, I'm 
curious how Slither is architected and I'm excited at the prospect of writing
 detector for it...one day.

This post attempts to understand the work-flow of Slither.
Target audience for this are folks who
  - would like to understand the architecture/work-flow of Slither
  - would like to start to write a detector (like me) but don't know where to
   start

Treat this as a (shoddy) introduction to Slither, that at the
 time of writing addresses only the author's curiosity. haha.

First things first, Slither itself is written in `python3`, yaay!
However, it is targeted at applications (smart contracts) written in the 
Solidity programming language.
One of the first things slither does is to use the solidity compiler (`solc` 
binary) to obtain the AST of the program to be analyzed.
Therefore, before I proceed, let me install the Solidity compiler.
Since most of the test contracts in the slither code base are targeted at 
compiler version 0.4.24, I chose to pick it up from the official GitHub page 
[here][3].
One could also fetch the officially distributed compiler for your Ubuntu 
distribution like so:

```
sudo add-apt-repository ppa:ethereum/ethereum
sudo apt-get update
sudo apt-get install solc
```

## Try Slither Out

After installing the `solc` binary, I set up a python IDE to debug slither.
Essentially, the idea is to use a good debugger (I'm using Jet Brain's PyCharm) to step through slither code and understand the steps involved in analyzing smart contracts.

The invocation that I am using for debugging is the elementary:
```
$ slither <name_of_contract>.sol
```

What this is supposed to do is analyze the source code of the contract and spit out bug reports, like so:
```
INFO:Detectors: Uninitialized state variable in ../solidity/001_name_references.sol, Contract: test, Variable: variable, Used in ['f']
INFO:Detectors: Contract 'test' is not in CapWords
INFO:Detectors: Parameter '' is not in mixedCase, Contract: '', Function: 'test''
```

What you'd notice when you run slither against buggy code are the following things
  - The smart contract to be analyzed needs to be compilable but not 
  necessarily runnable 
  - Bug reports are spit out on `stderr`
  - Each bug report is prefixed with the string `INFO:Detectors:`

But this is too high level, let's step through slither at a more easy pace

### Entry point

The entry point for `slither` is the main function of course.
This function is defined in a python file called `__main__.py` in the slither distribution.
The very first thing this main function does is to fetch all `detectors` and `printers`.
Each `detector` object in slither detects a class of bugs, and each `printer` object logs useful information about the program under analysis e.g., its call graph, what a function is trying to do (so called function summary) etc.

### Detectors

To get a sense of the kind of bugs Slither detects, let's look at the default set of detectors that Slither provides.
Here's an exhaustive list at the time of writing
```
UninitializedStateVarsDetection,
ConstantPragma,
OldSolc,
Reentrancy,
UninitializedStorageVars,
LockedEther,
ArbitrarySend,
Suicidal,
UnusedStateVars,
TxOrigin,
Assembly,
LowLevelCalls,
NamingConvention,
ConstCandidateStateVars,
ExternalFunction
```

That makes it a total of 15 detectors for as many bug classes.
A brief digression: Until we have a formalization of bug classes as in the 
C/C++ space (see the [common weakness enumeration][2] project), I'd expect 
bug classification for Solidity to be largely ad-hoc.

Let's dive deep into an elementary bug class to see how bug detection is 
implemented. 
The `Backdoor` detector (unlisted, but available in source) looks like an 
example detector that makes for a good 
starting example.
Here's the `backdoor.sol` contract that may be found in the slither code base
 that the backdoor detector is meant to detect.
```
pragma solidity 0.4.24;

contract C{

    function i_am_a_backdoor() public{
        selfdestruct(msg.sender);
    }

}
```

Evidently, this contract
  - defines a function that calls the `selfdestruct` method on the msg sender

What's the `selfdestruct` method?
> The only possibility that code is removed from the blockchain is when a contract at that address performs the selfdestruct operation. The remaining Ether stored at that address is sent to a designated target and then the storage and code is removed from the state.

In this intentionally buggy piece of code:
  - When some other contract calls `C.i_am_a_backdoor()` the piece of code 
  that points to `msg.sender` i.e., the caller of `C.i_am_a_backdoor()` is 
  going to be removed from the blockchain.
  - `C.i_am_a_backdoor()` is a means to hide oneself

So, let's see what happens when Slither analyzes this piece of code:
```
INFO:Detectors: Backdoor function found in C.i_am_a_backdoor
INFO:Detectors: Suicidal function in /home/bhargava/work/github/slither/tests/backdoor.sol Contract: C, Function: i_am_a_backdoor
INFO:Detectors: Function 'i_am_a_backdoor' is not in mixedCase, Contract: 'C' 
INFO:Detectors: Public function in /home/bhargava/work/github/slither/tests/backdoor.sol Contract: C, Function: i_am_a_backdoor should be declared external
INFO:Slither:/home/bhargava/work/github/slither/tests/backdoor.sol analyzed (1 contracts), 4 result(s) found
```

Voila, the backdoor function is flagged and reported to the user (see first 
line of report).
We will ignore the other bugs flagged by other detectors since our purpose is
 to get a general sense of how detection works, not understand the specifics 
 of a particular detector.
So, how does the detection work under the hood?

Well, to begin with, any static analyzer needs to "understand" the code being
 analyzed.
What needs to be understood is essentially: "What is this program trying to 
do? Is there a bug in it?".
These two questions hinge on semantic program analysis which is a complex 
problem.

We can begin to get a semantic understanding of a program by first looking at
 its syntax tree.
 A syntax tree is a tree: A directed acyclic graph that remains acyclic even 
 if directionality is removed.
 The nodes of the tree are syntactic elements of the programming language in 
 which the analyzed program is written.
 Here's a snippet of an actual AST (as a JSON string) of the backdoor program 
 shown above.
 ```json
{
	"attributes" : 
	{
		"absolutePath" : "tests/backdoor.sol",
		"exportedSymbols" : 
		{
			"C" : 
			[
				11
			]
		}
	},
	"children" : 
	[
		{
			"attributes" : 
			{
				"literals" : 
				[
					"solidity",
					"0.4",
					".24"
				]
			},
			"id" : 1,
			"name" : "PragmaDirective",
			"src" : "0:23:0"
		},
		{
			"attributes" : 
			{
				"baseContracts" : 
				[
					null
				],
				"contractDependencies" : 
				[
					null
				],
				"contractKind" : "contract",
				"documentation" : null,
				"fullyImplemented" : true,
				"linearizedBaseContracts" : 
				[
					11
				],
				"name" : "C",
				"scope" : 12
			},
			...
		}
		...
}
```

Hope this gives you a sense of the AST.
The AST is essentially a dictionary object with certain top-level attributes 
and a list of children.
For example, one of the children is the `pragma` directive on line 1 of 
`backdoor.sol`.
This child contains an ID, mapping to the source file, and a list of string 
literals it holds together.
In the following, I briefly describe what happens inside Slither even before 
bug detection is attempted.

### Step 1: Obtain AST

The first thing that slither does is [obtain the AST][4] of the analyzed 
program in the form of a JSON string using the Solidity compiler, `solc`.
`solc` supports this off-the-shelf with such an 
invocation as:
```
$ ./solc tests/backdoor.sol --ast-json --allow-paths .

```

### Step 2: Parse AST into CFG

Once the AST (JSON string) has been obtained, the next thing Slither does is 
to parse it.
Parsing the AST entails [parsing the JSON of the AST][5].
The AST parsing in Slither is quite sophisticated, not something I can 
describe succinctly here.

The main idea behind parsing the AST is to created a (cyclic) directed graph 
that shows control flow in the analyzed smart contract.
This is necessary because the AST itself is not adequate to grasp control-flow.

Control-flow graph is created at the granularity of a function call i.e., 
each function in the analyzed smart contract maps to a corresponding CFG.
You can find the function that does the AST parsing/CFG creation [here][6].
 
### Step 3: Drop to Slithir
 
Once the CFG has been created for all functions in the smart contract under 
analysis, Slither drops the AST/CFG representation of the analyzed smart 
contract into an [SSA-based][7] intermediate representation called Slithir.
By "dropping", I mean conversion from a higher-level program abstraction 
(AST/CFG) to a lower-level program abstraction (Slithir).
But why?

I can only hazard the following guesses:
  - Analysis based on an IR removes the dependency on the PL in which a smart
   contract is written. If tomorrow, a new smart contract PL is invented, 
   Slither can still support it by adding a parser/converter to IR.
  - SSA-based IR makes certain kinds of analysis simpler (see section 
  called "Benefits" in the [SSA wiki article][7]) 

### Step 4: Detect Backdoor

Steps 1--3 are performed as the [Slither python object is created][8].
Once the analysis infrastructure is ready (AST,CFG,Slithir), detectors are 
processed sequentially.
Each detector encodes the "business logic" of detection for the bug class 
that it is meant to detect.

So, let's see what's happening in the sample backdoor detector.
```python
class Backdoor(AbstractDetector):
    """
    Detect function named backdoor
    """

    ARGUMENT = 'backdoor'  # slither will launch the detector with slither.py --mydetector
    HELP = 'Function named backdoor (detector example)'
    IMPACT = DetectorClassification.HIGH
    CONFIDENCE = DetectorClassification.HIGH

    def detect(self):
        ret = []

        for contract in self.slither.contracts_derived:
            # Check if a function has 'backdoor' in its name
            for f in contract.functions:
                if 'backdoor' in f.name:
                    # Info to be printed
                    info = 'Backdoor function found in {}.{}'.format(contract.name, f.name)
                    # Print the info
                    self.log(info)
                    # Add the result in ret
                    source = f.source_mapping
                    ret.append({'vuln': 'backdoor', 'contract': contract.name, 'sourceMapping' : source})

        return ret

```

You'd notice that the business logic of bug detection is quite concise.
The detection logic resides in the `detect` method of the `Backdoor` object 
that implements the `AbstractDetector` interface.
To my mind, this is the python equivalent of a [Clang Static Analyzer 
checker][9].

Everything that a detector wants to know about the program is contained in 
the `self.slither` object.
This object contains the following fields:
  - `contracts_derived`: This field holds the
    - `_data`: AST obtained from the Solidity compiler
    - `functions`: CFG of all functions in the contract
    - `slither`: Slithir representation of the contract

The detector uses this information to decide whether to flag a bug or not.
A detector need only use the information that is necessary for the bug 
detection logic.
For example, here's what the backdoor detector is doing
  - Iterate over all functions in the analyzed contract
    - If a function is called "backdoor"
      - Flag a bug saying "backdoor found"
  - return a nicely formatted bug diagnostics object (list of dictionaries, 
  each dictionary being a distinct bug report)

In other words, the `backdoor` detector is only using the `function.name` 
field in the function's CFG to flag a bug. 
Of course, this is cheating cos you can't simply conclude that a function is 
a backdoor if it is called one.
However, the reason I picked up this specific detector is because it is meant
 as an introduction to writing detectors.

In the real-world, you'd do some analysis on the IR (e.g., check if the 
analyzed function makes a call to the `selfdestruct` function) before 
concluding that it is indeed a backdoor.
Perhaps, this entails listing all calls made by a function and checking if 
`selfdestruct` happens to be one of them.

## Outro

So that was a quick dive into Slither.
We laid out the work flow of Slither from (1) taking the AST of a smart 
contract as input, (2) producing its CFG, (3) reducing this to an SSA-based 
IR (4) and finally, detecting bugs based on program information contained in 
the IR.

If there is some specific aspect of Slither you'd want to know more about 
that this post didn't cover, let me know.
When I have the time, I'd be more than happy to write a part 2 of this post.
That's all folks. 

[1]: https://github.com/trailofbits/slither
[2]: https://cwe.mitre.org/
[3]: https://github.com/ethereum/solidity/releases/tag/v0.4.24
[4]: https://github.com/trailofbits/slither/blob/master/slither/slither.py#L30
[5]: https://github.com/trailofbits/slither/blob/master/slither/slither.py#L34
[6]: https://github.com/trailofbits/slither/blob/master/slither/solc_parsing/declarations/function.py#L614
[7]: https://en.wikipedia.org/wiki/Static_single_assignment_form
[8]: https://github.com/trailofbits/slither/blob/master/slither/__main__.py#L34
[9]: https://llvm.org/devmtg/2012-11/Zaks-Rose-Checker24Hours.pdf
