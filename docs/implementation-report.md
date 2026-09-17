# Obscell Privacy Protocol: Implementation Report

**Implementation baseline:** 2026-09-04 source-level foundation, with dated follow-up results in [the test report](test-report.md). **Documentation revision:** 2026-09-12. This is not a Pudge or mainnet completion report.

**Obscell Privacy Protocol — CKB Privacy Core and SDK** is one reusable infrastructure project. Privacy Protocol defines validity rules and Privacy Core implements them through cryptography, state handling, and CKB scripts. Applications consume those capabilities through the developer SDK, whose adapter receives the host's CCC Client and operation-scoped Signer. CKB provides settlement and verification. The reference application is the first controlled SDK consumer, not a separately funded wallet product. Its one-asset, fixed-denomination pool is the initial validation use case, not the architectural boundary. Privacy Core is an architectural layer, not a separate package or public class.

## 1. What Existed Before

The repository contained legacy mixer, CT, Circom/Groth16, encrypted-note, CCC, coordinator, relayer, frontend, deployment, and ckb-testtool work. It also contained an honest CCC-oriented interactive simulation and dated audit/research reports.

## 2. What Changed

- Added an explicit `legacy-demo` boundary without deleting original code.
- Reframed the README around one layered privacy-infrastructure project and evidence-based status.
- Added corrected-V1 SDK/protocol/circuit, fail-closed CKB covenant, and service foundations with explicit unsupported-live behavior.
- Added typed service validation for chain state, protected fields, fee isolation, deterministic acceptance, and operation lifecycle.
- Added architecture, protocol, research, security, proposal, deployment, Pudge, vector, evidence, and test documentation.
- Revised current documentation around the reusable core/SDK, a five-month implementation and validation plan, and a mainnet target gated by correctness, security review, and deployment readiness. This planning revision does not complete missing protocol transitions.

## 3. What Was Preserved

The legacy UI/route, generated proving artifacts, contract crates, explicit `mixer-sdk/legacy` package subpath, coordinator/relayer, deployment scripts, encrypted note UX, and progress history remain available. Some legacy source was hardened, but the historical generated proving artifacts were not regenerated or relabeled as corrected V1. The package root exports only corrected-V1 APIs.

## 4. Protocol And Privacy Core Changes

The target Privacy Core / Protocol moves authority from coordinator/registry records to singleton PoolState and Vault transitions, with user-owned staging deposits, fixed identity/value, sequence, root history, nullifier state, CT accounting, recipient binding, replay/stale protection, and proof validity enforced atomically. This infrastructure spans the versioned circuit, CKB scripts, and protocol/crypto/Merkle/nullifier/note/prover modules. Strict versioned Rust codecs, partial cross-language decoding/validation, and structural PoolState, Vault, and Staging covenants now exist. Pool genesis, acceptance, and withdrawal deliberately return unsupported after structural validation until their cryptographic and CT rules are connected; they are not deployable protocol implementations.

## 5. Circuit Changes

A versioned source freezes nine public signals, local secrets/path witnesses, fixed-denomination equality, pool/asset-bound leaf, position-bound nullifier, recipient/action auth tag, and pool/level-separated Merkle nodes. Legacy generated proving artifacts remain unchanged; no V1 setup/deployment is claimed.

## 6. CT Changes

The conservation model and required tests are specified. CT issuance/transfer/range-proof/witness/RNG remediation is not yet implemented, so V1 Vault deployment remains blocked.

## 7. SDK Architecture

The public `PrivacyClient` exposes the Privacy Core through separated protocol, crypto, Merkle, note, prover, services, validation, and CCC modules. It receives an application-injected CCC Client and operation-scoped Signer; it does not replace CCC. Deployment validation binds network identity through genesis hash and chain checks. Sync requires both an indexer and an independent state verifier, then conditionally commits the verified snapshot and note updates through the store's atomic checkpoint compare-and-swap. The included memory store provides only process-local development behavior; a production encrypted persistent store is not included. Unavailable settlement operations fail explicitly rather than fabricating results.

## 8. CCC Integration

The boundary uses installed CCC-native client/signer/transaction types. Wallet connector and JoyID concerns stay in the application. Network/deployment checks and transaction/capacity/signer responsibilities are isolated for testability.

## 9. Coordinator Changes

An isolated V1 interface reads complete PoolState/Vault snapshots and staging records from a chain reader, validates canonical encodings, accounting, current-root ordering, CT script identity, refund covenant fields, and pool/asset/denomination agreement, orders outpoints deterministically, caps a batch at 16, and passes it to an acceptance planner. A non-fixture, Pudge-capable scanner/reorg implementation remains open.

## 10. Relayer Changes

An isolated V1 relayer accepts the same strict wire intent emitted by the SDK, resolves state through injected interfaces, orchestrates an injected planner that derives protected fields and reconstructs a candidate, caps fees, rejects typed fee inputs or recipient mutation, requires an independent inspector, and records `queued`, `validated`, `submitted`, `committed`. It requires the injected submitter to return a locally derived canonical transaction hash, which the relayer persists before broadcast rather than trusting an RPC response; it retains the operational nullifier lock when an RPC timeout or mismatched response leaves submission outcome uncertain. No non-fixture chain reader, inspector, builder, hasher, submitter, or reconciliation worker is included, and it is not wired to the legacy endpoint.

## 11. Frontend And Demo

The current reference application is framed around protocol operations, private-state inspection, operation status, and the SDK integration boundary. Its supported V1 lifecycle remains a deterministic simulation until live protocol integration is implemented and validated. Simulation labels remain mandatory. The historical route is retained as previous implementation context. The `examples/payment-app` workspace is only a local SDK boundary fixture: it consumes the public `mixer-sdk` entry point and injects its own CCC-shaped client, state store, indexer, and verifier fixtures without reusing `DemoPrivacyClient`. It has been retained as useful package-consumption evidence; it supplies no private payment feature or live settlement evidence.

## 12. Research Documentation

`docs/research.md` records the original design, audit findings, corrected design, proof alternatives, CCC boundary, rejected options, limitations, and future work without rewriting history.

## 13. Architecture Diagrams

`docs/architecture.md` uses Application -> Privacy SDK -> Privacy Core / CKB scripts as the primary relationship, with application-owned CCC capabilities injected through the SDK adapter for transaction/signing integration. The [SDK integration diagram](diagrams/sdk-integration.png) makes ownership explicit; it does not depict a Core -> CCC implementation stack. The deposit, withdrawal, state, and trust-boundary diagrams explain the bounded reference lifecycle. The Word proposal embeds the system overview and SDK boundary in full color and retains the other diagrams as supporting assets. All are labeled as target architecture, not deployment evidence. Off-chain services and interface hosting have no protocol or consensus authority.

## 14. Screenshots

Real captures and their provenance are cataloged under `docs/evidence/`, with previous-interface, current-reference, and local SDK-fixture evidence labeled separately. Capture manifests record source/worktree details; local screenshots are not clean-release attestations or proof of settlement. Corrected-V1 Pudge and mainnet transaction evidence is still missing and cannot be replaced by interface screenshots.

## 15. Tests

The dated rerun results are in `docs/test-report.md`. V1 tests cover the nine-signal circuit relation, canonical proof parsing, strict SDK encodings and state rules, shared relayer wire data, backend chain/refund checks, deterministic batches, lifecycle/fee isolation, and structural covenant failures/refund. They do not establish deployable PoolState transitions or CT security.

## 16. Pudge Evidence

None for corrected V1. `docs/pudge-runbook.md` defines the required evidence and explicitly rejects hash-only completion.

## 17. Security Review Status

No independent review has occurred. Threat/trust/attack-surface/assumption/invariant documents prepare the review boundary; they are not an audit report.

## 18. Known Limitations

See `docs/known-limitations.md`. The principal blockers are completing authoritative CKB transition logic, CT remediation, nullifier SMT, V1 proof artifacts/verifier, non-fixture state verification/scanning, and real Pudge execution.

## 19. Remaining Work

The five-month / approximately 20-week grant plan is:

| Period | Remaining engineering work |
|---|---|
| Month 1 / weeks 1–4 | Finalize Privacy Core architecture, state/cryptographic boundaries, proof-system selection, and cross-component vectors |
| Month 2 / weeks 5–8 | Complete and adversarially test CKB transitions, CT/proof verification, commitments, roots, and nullifier handling |
| Month 3 / weeks 9–12 | Complete SDK operations, CCC signing/submission boundaries, non-fixture integration, tests, and developer examples |
| Month 4 / weeks 13–16 | Connect the reference application, deploy a testnet candidate, verify the full Pudge lifecycle/recipient spend, capture reproducible evidence, and fix integration issues |
| Month 5 / weeks 17–20 | Resolve integration defects, cryptographic findings, and testnet issues; complete independent review, remediation, deployment preparation, and final release evidence; deploy to mainnet only where gates pass |

Mainnet remains a target, not an achieved or guaranteed launch. It requires passing protocol, cryptographic, adversarial, state-transition, SDK, and real testnet checks; independent review with no unresolved critical or high findings; reproducible release artifacts; complete documentation; and a successful mainnet preflight. If mainnet gates remain unmet, deliver the validated testnet release and documented remediation state instead; any unresolved testnet acceptance remains incomplete. [The deployment guide](deployment.md) defines the precise sequence. Private transfers, additional assets/values, and separate payment or wallet products remain future work.

## 20. Reproduction

Local commands and results are in `docs/test-report.md`. Grant proposal sources, generated funding documents, and their packaging tool are maintained locally and intentionally excluded from Git. Exact deployment/E2E commands cannot be honest until the missing scripts and manifest exist; that gap is explicit in the runbook.
