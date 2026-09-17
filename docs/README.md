# Obscell Privacy Protocol Documentation

**CKB Privacy Core and SDK.** These documents describe one reusable privacy protocol for CKB. Privacy Protocol defines the validity rules, and Privacy Core implements them through cryptography, state handling, and CKB scripts. Applications consume those capabilities through the Privacy SDK and inject their own CCC Client and operation-scoped Signer through its CCC adapter. CKB provides settlement and verification. The reference application is the first controlled SDK consumer, not a separately funded wallet product. Its fixed-denomination privacy pool is the initial validation use case, not the project's architectural boundary.

The public project name is **Obscell Privacy Protocol**. The implementation repository `ckb-privacy-mixer` and package import `mixer-sdk` remain unchanged for compatibility. The five-month / approximately 20-week plan targets a working testnet implementation, validated mainnet-ready release, and mainnet deployment where correctness, security, and deployment gates pass; current implementation and evidence gaps remain explicit.

| Document | Purpose |
|---|---|
| [Status](status.md) | Evidence-based implementation matrix |
| [Architecture](architecture.md) | Application, SDK, Privacy Core / Protocol, CCC integration, and CKB verification boundaries |
| [Proposal diagram assets](diagrams/README.md) | Rendered target diagrams embedded in the Word proposal |
| [Protocol V1](protocol-v1.md) | Consensus statement and state-machine specification |
| [Research](research.md) | Architecture evolution, alternatives, and decisions |
| [Threat model](threat-model.md) | Assets, actors, threats, mitigations, and assumptions |
| [SDK](sdk.md) | Public API and module responsibilities |
| [Integration guide](integration-guide.md) | Add Obscell to an existing CCC application |
| [Pudge runbook](pudge-runbook.md) | Reproducible testnet acceptance procedure |
| [Deployment](deployment.md) | Testnet validation, gated mainnet target, SDK publication, frontend hosting, and manifest rules |
| [Test vectors](test-vectors.md) | Cross-language vector contract |
| [Test report](test-report.md) | Commands and results actually executed |
| [Known limitations](known-limitations.md) | Current blockers and out-of-scope work |
| Grant proposal | Maintained locally; funding details are not tracked in this repository |
| [Implementation report](implementation-report.md) | Before/after account and remaining work |
| [Screenshot evidence](evidence/README.md) | Historical, reference-application, protocol-view, and local-fixture captures with explicit evidence limits |

Normative language (`MUST`, `MUST NOT`, `SHOULD`) is used only in the protocol and deployment specifications. Dated progress reports under `progress/` remain historical records and may describe superseded designs.
