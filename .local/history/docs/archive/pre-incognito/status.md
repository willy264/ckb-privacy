> Historical snapshot of `docs/status.md`, superseded by the incognito direction on 2026-09-29. This record describes earlier work, not current deliverables, deployment status, or privacy guarantees. See [current documentation](../../README.md).

# Obscell Privacy Protocol: Implementation Status

**Documentation reviewed:** 2026-09-12. Source-level implementation and test evidence remain tied to the dated commands in [the test report](test-report.md).

`Implemented` means code exists and a listed local test has run. It does not mean deployed, audited, or production-ready.

The project develops reusable **CKB Privacy Core and SDK** infrastructure. Privacy Protocol defines validity rules; Privacy Core implements them. Applications consume those capabilities through the Privacy SDK and inject their own CCC Client and operation-scoped Signer through its adapter. The reference application is the first controlled SDK consumer, not a separate wallet product. Its fixed-denomination privacy pool is the initial validation use case, not the project's architectural boundary.

| Requirement | State | Evidence / gate |
|---|---|---|
| Legacy implementation preserved and isolated | Implemented | `legacy-demo/README.md`, `?view=legacy`, and `mixer-sdk/legacy`; the package root is V1-only |
| Protocol/SDK reference application | Implemented simulation | `frontend/src/demo/`; browser verification, no live privacy settlement |
| Applicant-authored SDK package-boundary fixture | Implemented deterministic fixture | `examples/payment-app`; unit/browser checks; no live settlement, separate-product, or third-party-adoption claim |
| Injected CCC Client and operation-scoped Signer | Foundation implemented | `mixer-sdk/src/ccc/`, `createPrivacyClient` tests |
| Strict V1 field/proof encodings | Foundation implemented | SDK canonical encoding tests and verifier parser tests |
| Frozen nine-signal circuit source | Foundation implemented | versioned source under `circuits/`; no new trusted setup claimed |
| Typed relayer intent and protected reconstruction | Foundation implemented, not live-wired | `backend/src/v1/` tests |
| Chain-derived deterministic coordinator plan | Foundation implemented, scanner pending | `backend/src/v1/coordinator.ts` validates full snapshots/staging and caps deterministic batches at 16 |
| Atomic private-state sync commit | Foundation implemented, persistent store pending | Store-level checkpoint compare-and-swap rejects stale commits across clients sharing a store; only a memory implementation ships |
| PoolStateCell | Fail-closed structural foundation, not deployable | Strict codec and transaction-shape tests exist; genesis and state transitions return unsupported until Poseidon/SMT/CT/proof rules are connected |
| VaultCell covenant and CT accounting | Fail-closed structural foundation, not deployable | Paired PoolState/shape checks exist; authoritative acceptance and withdrawal remain blocked on CT conservation and PoolState transitions |
| StagingDepositCell and refund | Structural foundation, not deployed | Covenant validates staging metadata; the tested refund branch is structural only and uses a placeholder asset fixture |
| Nullifier SMT | Codec/design foundation only | Canonical absence/update proof format and cryptographic script transition required |
| Authoritative on-chain Merkle frontier/root history | Structural invariants only | Poseidon empty-root, append, and proof/update logic are intentionally unsupported in the script |
| Deployable corrected V1 proving/verifying key | Not available | One insecure disposable benchmark setup was deleted; reproducible ceremony/build and reviewed artifact hashes remain required |
| Proof-system benchmark on corrected workload | Partial local measurement | Disposable Groth16/snarkjs proof measured; CKB-VM verification and alternative systems remain unmeasured |
| Real corrected-V1 Pudge E2E | Not run | All 20 runbook assertions remain open |
| Recipient subsequent CT spend | Not run | Requires real Pudge recipient output |
| Redis wipe/rebuild and reorg test | Interface only | Non-fixture Pudge state verifier/scanner, checkpoint implementation, and test required |
| Independent security review | Not performed | Planned grant deliverable; local tests are not an audit |
| Validated mainnet-ready release | Grant target, not achieved | Testnet evidence, passing protocol/crypto/adversarial/SDK checks, independent review, reproducible artifacts, and complete documentation required |
| Mainnet deployment | Gated grant target, not performed | No unresolved critical/high security findings; all release gates and a separate mainnet network/manifest preflight must pass |

No transaction hashes, deployments, confirmations, balance values, or security-review results are asserted by this status page.

## Grant Work And Future Scope

The five-month / approximately 20-week plan covers core architecture and vectors in Month 1; protocol/CKB/cryptographic completion and adversarial checks in Month 2; SDK/CCC completion and developer integration in Month 3; reference integration and real Pudge lifecycle evidence in Month 4; and hardening and release in Month 5. The final month addresses integration defects, cryptographic findings, testnet issues, independent review, remediation, deployment preparation, and final release evidence. The [deployment guide](deployment.md) defines the mainnet acceptance gates. If they remain unmet, deliver the validated testnet release and documented remediation state instead; unresolved testnet checks must remain labeled incomplete. This is a gated release plan, not an unconditional launch promise.

Wallet privacy, private payments, private transfers, private DeFi interactions, and broader private application state are possible later adoption directions. They are not current capabilities or additional grant deliverables. The local `examples/payment-app` fixture proves a package boundary only.
