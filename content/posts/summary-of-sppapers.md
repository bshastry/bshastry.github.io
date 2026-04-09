---
title: "Summary Of SPPapers"
date: 2018-10-28
excerpt: "Summary and analysis of significant security and privacy papers, highlighting key research developments in the field."
tags: ["research", "security", "privacy", "papers", "analysis"]
---

I skim papers submitted to the Top-4 security conferences, NDSS, IEEE SP, USENIX Security, and ACM CCS from time to time.
Now that the last of the top-4 is over, it is a good time to take stock of the papers published at these venues.
Hopefully, this post gives you a general understanding of the state of academic security and privacy research.

Usual caveats: Paper selection is ad-hoc based purely on what drew my attention. Having said that, I tried to not overly focus on my specific interests; in fact, I was probably more biased to research areas other than my own given that in the last few years I took a more narrow view of published papers (cos of PhD).

In what follows, you'll find a summary of the papers along with some research that I carried out where I felt the paper did not provide as much detail as I would have liked.
The headings paraphrase the content of the paper and don't necessarily reflect the actual title; I've copy-pasted the title under each heading, linking it to the paper's web page.

### Card skimming detection

[_Fear the Reaper: Characterization and Fast Detection of Card Skimmers_][1]

This paper studies the kinds of debit/credit card skimmers installed in ATMs, gas stations (petrol bunks as we call them in India..haha), retail outlets (e.g., shopping mall point-of-sale machine) etc.
This paper serves the public interest, and I like it.
It challenges the following pieces of conventional advice given to protect themselves from card fraud:
  - Advice: Try to pull the card reader out: if there's a skimmer it comes off
    - Reality: Obviously, people doing fraud have thought this through so they use a plaster/adhesive to hold the skimmer in tact when pressure is applied **not legit advice**
  - Advice: Look for signs of a skimmer
    - Reality: Huh, what exactly do you mean? No one knows what skimmers look like. In fact, skimmers actually camaflouge themselves well, so it takes expert eyes to spot them. Moreover, not all skimmers are external facing (more on this later) **not legit advice**
  - Advice: Use a smartphone app [like this][2] to locate skimmers with Bluetooth radios
    - Reality: Only about 7% of skimmers have Bluetooth radios built-in but it seems to flag this subset correctly esp. at gas stations **semi-legit advice**
  - Advice: Use an EMV (Chip) card
    - Reality: Enter _Shimmer_ (quoting from [this source][3]) **not legit advice**
> A paper-thin, card-size shim containing an embedded microchip and flash storage is inserted into the “dip and wait” card slot of an ATM or gas pump payment terminal that's indoors or outdoors. There it resides unseen to intercept data off your credit or debit card’s EMV chip for fraudsters. The intercepted data is used to create a magnetic stripe version of the card that can be used in payment terminals that haven't been updated with EMV chip technology.

  - Advice: Use cash
    - Reality: lulz, enough said

This paper specifically focuses on skimmers, devices that read card data encoded into the magnetic strip of legacy debit/credit cards.
I look forward to reading a shimmer follow-up some day.

#### Characterizing Skimmers

The authors characterize skimmers using the following features:
  - installed location: internal vs. external vs. wiretap
  - terminal type: ATM, gas pump, point of sale machine
  - terminal location: Bank, gas station, hotel, restaurant, retail

Sadly, their data set contains information on unique skimming devices, not their frequency.
Moreover, this data is for the city of New York only.
For these reasons, it's hard to understand which feature vector is more popular than others or to generalize these findings to other cities; perhaps another paper can do that.

Having said that, the authors find that the most diversity in skimming devices is found in ATMs located in/around Bank premises (12 different devices), followed by retail (9), gas stations (6), restaurants (5), and hotels (3).
The devices themselves are quite nifty; I direct the interested reader to look at the photos of actual skimmers that are included in the paper.
Apart from the skimmer itself,


#### Skimming Attack

#### Skimming counter-measure

### Asm2vec

_Boosting Static Representation Robustness for Binary Clone Search against Code Obfuscation and Compiler Optimization_

### Attack Directories, Not Caches

_Side Channel Attacks in a Non-Inclusive World_

### Blind Certificate Authorities

### Breaking LTE on Layer Two

### Dangerous Skills

_Understanding and Mitigating Security Risks of Voice-Controlled Third-Party Functions on Virtual Personal Assistant Systems_

### Data Recovery on Encrypted Databases with k-Nearest Neighbor Query Leakage

### Differentially Private Model Publishing for Deep Learning

### Hard Drive of Hearing

_Disks that Eavesdrop with a Synthesized Microphone_

### TBD 

[1]: https://www.usenix.org/conference/usenixsecurity18/presentation/scaife
[2]: https://play.google.com/store/apps/details?id=skimmerscammer.skimmerscammer
