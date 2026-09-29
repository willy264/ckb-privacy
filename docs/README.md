# CCC Incognito Mode Documentation

The current project is one opt-in CCC package, working name `@ckb-ccc/stealth`, for stealth send, scan, and spend plus fresh-change handling. It targets a contribution to CCC, reusing the Obscell stealth lock rather than creating new on-chain machinery.

The runnable interface is **SIMULATED**. Local address derivation and CCC draft construction are implementation evidence; fixture detection, transaction completion, signing, and settlement must not be presented as real chain activity. Amounts and sender inputs are **not hidden**.

| Document | Purpose |
|---|---|
| [Status](status.md) | Implemented local behavior and unfinished live integration |
| [Architecture](architecture.md) | App, optional CCC package, existing CCC capabilities, reused lock |
| [Package guide](sdk.md) | Package boundary and local API |
| [Integration guide](integration-guide.md) | Send, scan, spend, and application-owned approval |
| [Research](research.md) | Reuse decisions, attribution, and compatibility questions |
| [Threat model](threat-model.md) | Receiver privacy, keys, transaction graph, and interface risks |
| [Security assumptions](security/security-assumptions.md) | Preconditions and limits |
| [Trust model](security/trust-model.md) | Chain, application, signer, and scanner roles |
| [Security invariants](security/protocol-invariants.md) | Rules to preserve through integration |
| [Attack surface](security/attack-surface.md) | Input, scanning, signing, and delivery boundaries |
| [Test report](test-report.md) | Current checks and their evidence limits |
| [Test vectors](test-vectors.md) | Codec, derivation, recognition, and mutation coverage |
| [Deployment](deployment.md) | Local hosting, testnet acceptance, and upstream path |
| [Testnet runbook](pudge-runbook.md) | Future real send → scan → spend verification |
| [Known limitations](known-limitations.md) | Explicit implementation and privacy gaps |
| [Implementation report](implementation-report.md) | How the repository changed direction |
| [Evidence catalog](evidence/README.md) | Real captures, simulation labels, dates, and hashes |
| [Architecture assets](diagrams/README.md) | Target diagrams and reproducible sources |
| [Historical documentation](archive/pre-incognito/README.md) | Superseded research, specifications, and dated results |

The old [versioned specification](protocol-v1.md) remains a historical pointer. Dated `progress/` files and archived evidence are preserved as history. Their terminology, results, milestones, and deployments are not current claims. Funding materials are intentionally excluded from tracked public documentation.
