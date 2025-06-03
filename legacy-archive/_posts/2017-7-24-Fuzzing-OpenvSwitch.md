---
layout: post
title: Fuzzing Open vSwitch
---

## Intro

This post is about how I fuzzed [Open vSwitch][1], an open-source [multilayer][2] virtual switch written in C, using [afl-fuzz][3]. Open vSwitch (OvS for short) is a popular virtual switch that is typically used in data center environments. At a very high level, it serves as a packet forwarding switch between virtual machines in a data center. It has been ported to multiple virtualization platforms including Xen and VirtualBox, and is integrated into virtual management systems such as OpenStack and oVirt.

## Fuzzing OvS

# Step 1: Obtaining source code and finding fuzzable test cases

I downloaded OvS source code from the [official web page][4]. Specifically, releases `2.3.2`, `2.4.0`, `2.5.0`, and `2.7.0` were downloaded. I followed a few common guidelines to fuzz each of these releases.

#### Find unit tests that accept a file as input

Since OvS is a networking stack, you can expect tests that simulate network input by reading a packet capture (pcap) file. Unsurprisingly, OvS contains at least three such test cases. The source code for these tests is located in the `tests` and `utilities` sub-directories relative to the top-level directory.

`tests/ovstest.c` is the entry point for two test cases, namely, `test-flows` and `test-conntrack` (in OvS >= v 2.5.0).

* `test-flows` tests the flow extraction logic of OvS: the process of abstracting common features of a stream of packets
* `test-conntrack` tests OvS' connection tracking logic that is part of its native firewall feature.

`utilities/ovs-ofctl.c` (in OvS >= v2.4.1) is the entry point for `ofp-parse-pcap` unit test that tests, among other things, OvS' [OpenFlow][5] packet parser.

These unit tests are invoked on the command line like so:
* `$ ovstest test-name test-args` (switching tests)
* `$ ovs-ofctl test-name test-args` (OpenFlow tests)

Long story short, fuzzer-discovered crashes in these test programs are likely security critical since they may be triggered remotely (although OpenFlow restricts the attack model to a controller-switch set up). Next, we will try to quickly understand the unit test interfaces so we can fuzz them.

# Step 2: Test command line

Once we have narrowed down on fuzzable test cases, we need to understand the test interface so that we can fuzz them meaningfully. I will break down the test interface for each of test cases:

* `test-flows` takes two inputs, namely `flows` (binary data file) and a pcap file. `flows` tells the unit test logic the type of packet flows it should expect from the input network stream (parsed from the supplied pcap file). The OvS code base does not contain a reference `flows` file that one can use. However, it may be conveniently generated using the `flowgen.pl` utility found in the `tests` subdir, like so:

```
$ cd tests && ./flowgen.pl 3> flows # FD 3 is flows
```

Once you have generated the `flows` file, you can invoke the `test-flows` unit test like so (@@ is afl-style shorthand for file input):

```
$ tests/ovstest test-flows tests/flows @@
```

* `test-conntrack` takes two inputs, namely the string `pcap` indicating that we want to exercize the conntrack test that parses an input pcap file, and the pcap file itself. This test is straightforward. It invokes OvS APIs parses the input pcap file in order to perform connection tracking (a la iptables). You can invoke the `test-conntrack` unit test like so:

```
$ ovstest test-conntrack pcap @@
```

* `ofp-parse-pcap` takes only one input, namely the pcap capture file to be parsed. This test is also straightforward. It invokes OvS OF APIs to parse a pcap of OpenFlow message.

```
$ ovs-ofctl ofp-parse-pcap @@
```

# Step 3: Seed selection

We will need to bootstrap fuzzing with a handful of meaningful seed files. To keep things simple, I recommend seeding the switching test cases with a small (<1 kB) pcap capture of TCP/IP packets, and the OpenFlow test case with a small pcap capture of a sequence of OpenFlow messages.

# Step 4: Instrument and fuzz

If you have a never used afl-fuzz before, please consult a good tutorial on the topic such as [this one][7]. Here are the relevant command lines for the unit tests that I fuzzed:

* `test-flows`
```
$ afl-fuzz -i tcp_ip_seeds -o afl-out-flows -- tests/ovstest test-flows tests/flows @@
```

* `test-conntrack`
```
$ afl-fuzz -i tcp_ip_seeds -o afl-out-conntrack -- tests/ovstest test-conntrack pcap @@
```

* `ofp-parse-pcap`
```
$ afl-fuzz -i open_flow_seeds -o afl-out-of -- utilities/ovs-ofctl ofp-parse-pcap @@
```

# Results

In total, afl-fuzz discovered eight vulnerabilities (six CVEs because 1 patch clubbed three bugs) across multiple versions of OvS that were responsibly disclosed and promptly fixed by the OvS development/security team. The following vulnerabilities have been fixed:

- [CVE-2016-2074][8]: Stack buffer overflow that permits remote code execution
  - Reported: 25 Feb 2016
  - Acknowledged and patch review requested: 27 Feb 2016
  - Public advisory: 28 Mar 2016

- [CVE-2017-9214][12]: Assertion failure (due to heap buffer overflow) in OpenFlow message parser that permits remote DoS
  - Reported: 19 May 2017
  - Acknowledged and patched: 20 May 2017
  - CVE assigned: 23 May 2017

- [CVE-2016-10377][13]: Heap buffer overread in OvS flow tracking that can lead to ACL bypass
  - Reported: 20 June 2016
  - Acknowledged: 21 June 2016
  - Fixed: 22 June 2016
  - CVE assigned: 29 May 2017

- [CVE-2017-9263][14]: Program abort while parsing malformed OpenFlow message that permits remote DoS
  - Reported: 24 May 2017
  - Acknowledged and patched: 26 May 2017
  - CVE assigned: 29 May 2017

- [CVE-2017-9264][15]: Heap buffer overread in OvS firewall implementation
  - Reported: 20 Feb 2017
  - Acknowledged: 20 Feb 2017
  - Fixed: 3 Mar 2017
  - CVE assigned: 29 May 2017

- [CVE-2017-9265][16]: Heap buffer overread in OpenFlow message parser
  - Reported: 22 May 2017
  - Acknowledged and patched: 26 May 2017
  - CVE assigned: 29 May 2017
 
The most critical of these is [CVE-2016-2074][8], the subject of [one of our papers][9]. The rest find a mention in [another paper][10] on what to do when you cannot advance test coverage using fuzzing alone and/or are left with no fuzzable test cases, and how this led to another potential [bug][11].

# Summary

Network parsers demand proactive testing since they are especially vulnerable to remote attacks. It is possible, perhaps likely, that other software switch implementations contain similar flaws.
Happy fuzzing!

[1]: http://www.openvswitch.org/
[2]: https://en.wikipedia.org/wiki/Multilayer_switch
[3]: http://lcamtuf.coredump.cx/afl/
[4]: http://www.openvswitch.org/
[5]: https://dl.acm.org/citation.cfm?id=1355734.1355746
[6]: https://www.usenix.org/system/files/conference/nsdi15/nsdi15-paper-pfaff.pdf
[7]: https://foxglovesecurity.com/2016/03/15/fuzzing-workflows-a-fuzz-job-from-start-to-finish/
[8]: https://mail.openvswitch.org/pipermail/ovs-announce/2016-March/000082.html
[9]: https://arxiv.org/abs/1610.08717
[10]: https://arxiv.org/abs/1706.00206
[11]: https://mail.openvswitch.org/pipermail/ovs-dev/2017-May/332712.html
[12]: https://nvd.nist.gov/vuln/detail/CVE-2017-9214
[13]: https://nvd.nist.gov/vuln/detail/CVE-2016-10377
[14]: https://nvd.nist.gov/vuln/detail/CVE-2017-9263
[15]: https://nvd.nist.gov/vuln/detail/CVE-2017-9264
[16]: https://nvd.nist.gov/vuln/detail/CVE-2017-9265
