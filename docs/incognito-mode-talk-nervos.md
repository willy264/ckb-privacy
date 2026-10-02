# Introducing Incognito Mode for CCC: Stealth Addresses for CKB Applications

Hello everyone,

I’ve been working on **Incognito Mode for CCC**, an opt-in stealth-address capability for applications built with [CKBers’ Codebase](https://github.com/ckb-devrel/ccc).

The idea is simple: a recipient shares a reusable receiving identity, while each payment goes to a fresh one-time address. An application could offer this through an Incognito mode toggle and keep its familiar CCC transaction and wallet flow.

The intended home is a scoped package within CCC, with the working name **`@ckb-ccc/stealth`**. A local package prototype and browser demo are available now. Live testnet integration and upstream review are the next steps; the package is not yet an official CCC release.

The privacy boundary is central to the design: **stealth addresses reduce direct links to a recipient’s reusable identity. Amounts and sender inputs remain public.**

## Project Links

- [Try the browser demo — chain-dependent steps are simulated](https://ckb-privacy.vercel.app/)
- [Repository and getting started](https://github.com/willy264/ckb-privacy)
- [Package API and implementation](https://github.com/willy264/ckb-privacy/tree/main/packages/stealth)
- [Architecture and maintainer review guide](https://github.com/willy264/ckb-privacy/blob/main/docs/review-guide.md)
- [Demo screenshots and evidence catalog](https://github.com/willy264/ckb-privacy/blob/main/docs/evidence/README.md)

The repository is now named `ckb-privacy`. Its active workspace focuses on the stealth package and its reference application.

## The Problem: A Reusable Address Becomes a Public History

Receiving payments through one public address makes that address easy to share. It also gives observers a straightforward way to group the payments made to it.

For someone publishing a donation address or receiving payments from different people, that can expose more transaction history than they intended to share. Generating a separate address for every payment helps, but an application still needs a way to derive those addresses, recognize incoming payments, and authorize spending.

Stealth addresses approach this with two parts: a public **meta-address** that the recipient can share, and a fresh destination derived by each sender. The meta-address contains public viewing and spending keys. Private keys stay with the recipient.

This removes the need to place the same receiving identity directly into every payment output. Other transaction information can still reveal relationships, so the benefit needs to be explained carefully.

## Why Build This Through CCC?

CCC already gives CKB applications tools for wallet connection, transaction construction, signing, and chain access. It also has scoped packages for capabilities such as Spore, UDT, and DID integration. A focused stealth-address package would follow that approach, allowing applications to add the capability through a familiar development interface. [CCC’s codebase](https://github.com/ckb-devrel/ccc) is the upstream target.

The existing Obscell work provides the foundation for reuse. Credit belongs to the original Obscell authors, including Rea-Don-Lycn, Quake’s [contract work](https://github.com/quake/obscell) and [Rust wallet](https://github.com/quake/obscell-wallet), and tianlitao’s [browser wallet](https://github.com/tianlitao/obscell-web). Those projects provide important references for the stealth scheme and its implementations.

My focus is making that receiving capability reusable within CCC. The integration targets the existing Obscell stealth lock on CKB testnet, with deployment compatibility still to be independently verified for this package. No new on-chain protocol is part of this work.

![Target architecture showing a CCC application using an optional stealth package alongside CCC client, transaction, and signer capabilities](https://raw.githubusercontent.com/willy264/ckb-privacy/97a451bcc139b1a7151f08a4a3b588ab1775a4df/docs/diagrams/ccc-incognito-architecture.png)

*Target architecture, not deployment evidence. The package’s intended place inside CCC remains subject to maintainer review.*

## How the Flow Works

The complete integration is being developed around four steps.

### 1. Send to a One-Time Address

The sender enters the recipient’s stealth meta-address. A fresh ephemeral key is used with ECDH to derive a one-time destination. The associated ephemeral public key lets the recipient recognize the payment later.

The application builds an output to that destination through CCC. In the live integration, CCC would then complete the inputs and fee before wallet approval and submission. The current demo constructs the unsigned output and labels the remaining handoff **SIMULATED**.

### 2. Recognize Incoming Payments

The recipient uses a private view key, together with their spend public key, to check candidate outputs. A matching output can be recognized without exposing the spending secret.

Today, the prototype demonstrates this against supplied local records. Discovering those records through CCC’s client and indexer, checking their chain status, and keeping scan results current are still integration work.

### 3. Spend Through the Correct Lock

Recognizing a payment and authorizing a spend are separate operations. Spending requires the appropriate private keys and a signature that satisfies the stealth lock.

The local implementation checks ownership and derives one-time spending material. A lock-specific CCC signer is still needed to complete the live flow; an ordinary signer cannot simply be assumed compatible with the stealth lock’s witness rules.

### 4. Keep Change Fresh

When a transaction produces change, an optional helper derives a fresh destination for it. This reduces reuse of the sender’s published address.

That destination must survive input and fee completion in the final transaction. Fresh change improves address hygiene, but its amount and relationship to the other outputs remain visible.

## What Works Today

The current prototype includes:

- Stealth meta-address encoding and validation.
- Fresh one-time-address derivation.
- View-key recognition of matching local records.
- Ownership checks and one-time spend-key derivation.
- Fresh-change preparation and unsigned CCC transaction outputs.
- A browser demo with an Incognito toggle, Send and Scan/Receive views, a change indicator, and a disclosure panel.

The package has tests using an independently generated cryptographic vector, alongside checks for malformed inputs, incorrect ownership keys, capacity handling, fresh addresses, and public API boundaries. Browser checks exercise the demonstration at desktop and mobile widths. The [validation record](https://github.com/willy264/ckb-privacy/blob/main/docs/validation.md) explains what those checks establish.

![Local incognito demo showing a one-time recipient address, ephemeral public key, unsigned transaction preview, and simulated CCC handoff](https://raw.githubusercontent.com/willy264/ckb-privacy/97a451bcc139b1a7151f08a4a3b588ab1775a4df/docs/evidence/incognito-send.png)

*Screenshot of the local prototype. Address calculations and unsigned output construction are real; chain scanning, completion, signing, and settlement are simulated. This is interface evidence, not a confirmed testnet transaction.*

## What “Incognito” Does and Does Not Mean

The goal is to make a payment harder to associate directly with the recipient’s published identity. The transaction itself remains observable.

Amounts, sender inputs, output cells, ephemeral public keys, and transaction timing remain public. Network observations and amount or transaction-graph analysis can still reveal relationships. Sharing a view key can also reveal payments that key recognizes.

The current scope covers stealth-address integration and optional fresh change. Confidential amounts, additional privacy protocols, and mainnet readiness are outside this work.

The demo uses deliberately public test keys. **Do not send assets to its addresses or enter real private keys into it.** A complete live send → scan → spend lifecycle has not yet been demonstrated by this CCC integration.

## Try the Demo

Open the [hosted browser demo](https://ckb-privacy.vercel.app/). Chain-dependent steps are labelled **SIMULATED**; this demo does not submit or settle transactions.

Start with Incognito mode off, then turn it on and build a transaction preview using the supplied recipient. Compare the one-time address and fresh-change destination. Next, open Scan/Receive, click **Scan fixture payments**, and use **Spend simulation** to inspect the local spend preview for the matching payment.

The disclosure panel stays visible so that each step can be understood alongside its privacy limits. No wallet connection or real funds are needed for this demonstration.

To run it locally, follow the [repository's setup instructions](https://github.com/willy264/ckb-privacy#run-and-verify).

## What Comes Next

I'm now working to verify the deployed lock and its signing requirements, connect live discovery through CCC, and complete a real testnet send → scan → spend flow. This will produce reproducible commands, actual transaction hashes, and explorer links that others can independently verify.

I also want to work through the package boundary with CCC maintainers and the Obscell authors before taking the implementation upstream. The goal is a focused contribution with tests and documentation that fits CCC’s conventions. Its final API and acceptance will depend on that review.

## Feedback From the Community

I’m Williams Oluwagbemi Akinwamide, [willy264 on GitHub](https://github.com/willy264). My earlier CKB privacy work led me to this narrower integration: making one-time receiving addresses practical for applications already using CCC.

I’d especially appreciate feedback from CKB application developers and the Obscell and CCC communities on:

- Where stealth receiving would be useful in an existing application.
- How the view-key and spending interfaces should fit CCC.
- Which scanning and lock-compatibility cases need particular attention.
- Whether the Incognito toggle and disclosure make the privacy boundary understandable.

Thanks for reading. I look forward to discussing the design and working through the integration in the open.
