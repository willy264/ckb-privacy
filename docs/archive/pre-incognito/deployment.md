> Historical snapshot of `docs/deployment.md`, superseded by the incognito direction on 2026-09-29. This record describes earlier work, not current deliverables, deployment status, or privacy guarantees. See [current documentation](../../README.md).

# Obscell Privacy Protocol Deployment Guide

## Current State

There is no corrected-V1 testnet or mainnet deployment. Existing environment variables and deployment scripts refer to legacy prototype contracts. Do not combine them with V1 manifests or describe them as V1. This guide defines future acceptance and release steps; no deployment has been performed by the documentation revision.

## Separate Deployment Responsibilities

| Deliverable | Publication/deployment boundary | Authority |
|---|---|---|
| Privacy Core / Protocol and CKB implementation | Versioned script/code Cells and fresh state on CKB testnet, followed by mainnet only after the gates pass | Protocol cryptography and CKB scripts determine valid transitions; CKB provides settlement |
| Privacy SDK | Open-source source/release and a versioned package for third-party developers | Developer interface to the core; applications inject their own CCC client and operation-scoped signer through the SDK adapter |
| Reference application | Reproducible web build hosted on an appropriate third-party service, such as Vercel | Interface delivery only; no authority over protocol state or transaction validity |

The reference application is not a separate product being funded alongside the SDK. It is the first controlled consumer of the Privacy SDK and provides a practical demonstration of the protocol's capabilities. Its one-asset, fixed-denomination pool is the initial validation use case, not the project's architectural boundary. The existing implementation repository `ckb-privacy-mixer` and SDK import `mixer-sdk` remain compatibility names; the public project is **Obscell Privacy Protocol — CKB Privacy Core and SDK**.

Third-party hosting does not become a consensus or privacy-verification component. Validity must remain enforced by cryptography and CKB scripts. A malicious host or frontend can still serve code that steals note secrets or misleads a user into signing, so client-origin integrity and the app's local secret/signing boundary remain security responsibilities. Hosting uptime or a screenshot is not proof that a privacy transaction is valid or settled.

## Five-Month Release Path

| Period | Engineering outcome |
|---|---|
| Month 1 / weeks 1–4 | Finalize core architecture, state rules, cryptographic interfaces, proof-system decision, and test vectors |
| Month 2 / weeks 5–8 | Complete protocol/CKB implementation and cryptographic state transitions; run adversarial and cross-component checks |
| Month 3 / weeks 9–12 | Complete public SDK, CCC construction/signing/submission boundaries, integration examples, and developer tests/docs |
| Month 4 / weeks 13–16 | Integrate the reference application, deploy the testnet candidate, verify real CKB transactions and the full lifecycle, collect evidence, and fix integration issues |
| Month 5 / weeks 17–20 | Resolve integration defects, cryptographic findings, and testnet issues; complete independent review and remediation, deployment preparation, and final reproducible release evidence; deploy to mainnet only when gates pass |

The fifth month provides the required hardening and release window for issues discovered during real testnet integration, independent review, and deployment preparation. Integration fixes are part of the affected engineering and deployment workstreams, not an idle contingency phase.

Mainnet deployment is a release target subject to successful testnet validation, completion of the defined security review, resolution of critical/high-severity findings, reproducible deployment artifacts, and successful mainnet preflight. If mainnet gates are not satisfied, deliver the validated testnet release and documented remediation state instead. A testnet release may be called validated only after its own acceptance checks pass; otherwise publish the incomplete candidate, unmet checks, and remediation state without a validation claim. The schedule MUST NOT override correctness or security.

## V1 Manifest

A deployment is valid only with a checked-in sanitized manifest containing:

- schema/protocol version and git commit;
- network name and genesis hash;
- PoolState, state lock, Vault lock, staging/refund lock, CT, and verifier code hashes;
- code-cell and Type-ID outpoints, hash types, and dep types;
- pool ID, asset script, denomination, tree depth, root-history policy, and refund policy;
- genesis PoolState/Vault outpoints and exact decoded state;
- proof-system selection, circuit source and applicable proving/verifying artifact SHA-256 hashes (including R1CS/WASM/ZKey/verifying key for the present Groth16 baseline);
- compiler, Rust toolchain, Cargo lock, Node, PNPM, Circom, snarkjs, and CCC versions;
- deployment transaction hashes only after independent chain verification.

Private keys, passwords, API credentials, note secrets, or funded-wallet configuration must never appear in the manifest.

## Testnet Candidate Sequence

1. Build all binaries and circuit artifacts from a clean checkout with pinned tools.
2. Run cross-language, contract, cryptographic-verification, state-transition, SDK, service, frontend, and adversarial tests. Successful corrected-V1 transitions must be covered; passing only fail-closed structural tests is insufficient.
3. Compare release hashes with a second clean build.
4. Deploy code cells with a dedicated testnet deployment signer.
5. Create fresh V1 Type-IDs and zero-state PoolState/Vault; never reuse legacy state.
6. Decode every created cell and verify code/type/lock/data/capacity against the candidate manifest.
7. Run the Pudge acceptance procedure before marking the manifest validated.
8. Publish only sanitized config and explorer links.

Testnet deployment is an isolated validation stage. Mainnet/public asset controls MUST remain unavailable until the release gates below pass. A testnet manifest cannot become a mainnet manifest by changing its network label.

## Mainnet Acceptance Gates

Every gate MUST be supported by reproducible results for the release candidate:

1. **Protocol correctness:** positive and negative tests pass for initialization, staging, acceptance, refund, withdrawal, commitment/root/nullifier updates, CT conservation, recipient binding, replay, and stale state.
2. **Cryptographic verification:** cross-language vectors, canonical encodings, proof parsing, circuit relations, CT verification, and on-chain verifier tests pass; the selected scheme and artifact/setup provenance are documented.
3. **Adversarial and integration tests:** mutation, fee isolation, competing service workers, uncertain submission, reorganization recovery, state-store atomicity, and client secret-handling checks pass across scripts, SDK, and services.
4. **Real CKB testnet evidence:** all [Pudge runbook](pudge-runbook.md) assertions pass with verified public transaction/cell data, including an independently controlled recipient's subsequent CT spend and a clean service-state rebuild. Hashes or interface screenshots alone are insufficient.
5. **SDK consumption:** the reference application uses the published candidate SDK API and application-owned CCC client/signer to exercise the supported lifecycle. Non-fixture adapters, actual signing/submission, and confirmation handling are verified.
6. **Independent review:** the circuit, CKB scripts, CT integration, and security-sensitive SDK boundary receive an independent review. There are no unresolved critical or high security findings; other findings and residual privacy limitations are disclosed with dispositions.
7. **Reproducible artifacts:** binaries, proof artifacts, package/reference builds, vectors, and sanitized manifests match pinned source and tool versions and a second clean build.
8. **Complete documentation:** protocol, SDK, deployment, test, recovery, operations, and known-limitations documents agree with the release and link actual evidence.
9. **Mainnet-specific preflight:** independently verify network/genesis identity, code and dependency hashes, supported CT identity, capacity/fee requirements, deployment authority, fresh Type-IDs, pool identity, and zero-state initialization. No legacy or testnet state is imported.

Once the gates pass, deploy with isolated deployment authority, decode and verify each actual code/state Cell, publish the sanitized mainnet manifest and independently verified transaction links, and run the release's bounded post-deployment checks before enabling mainnet controls. A mainnet deployment claim requires those real records. If independent review or any other mainnet prerequisite is unavailable by Month 5, deliver the validated testnet release and documented remediation state instead, with any incomplete testnet checks explicitly identified. Do not call that delivery a successful mainnet launch.

## SDK And Reference-Application Release

Publish versioned source, API documentation, tests/vectors, and reproducible SDK artifacts from the accepted release commit. The repository/package is open-source infrastructure; no token, subscription, new protocol fee, or reference-app revenue assumption is introduced. Normal CKB transaction fees and Cell capacity requirements still apply to protocol use.

Host only the reference interface on the selected web platform. Public configuration identifies the exact network and validated manifest; no build or hosting configuration may contain private keys, note secrets, plaintext backups, or privileged issuance/deployment authority. Capability checks and UI labels must distinguish simulation, testnet, and mainnet based on verified integration/deployment status. Hosting a new interface does not satisfy the protocol's release gates.

## Environment Policy

The application supplies its CCC client. V1 network/deployment settings come from an explicit manifest object, not hidden SDK environment reads. User signers are operation-scoped. Coordinator has no owner, relayer, or user private key. Relayer holds only a limited hot key for untyped CKB fees. Issuance/deployment authority is offline or isolated and never participates in normal deposits.

## Rollback

V1 scripts are immutable. Replacing a flawed version requires a new version/identity; protocol state is not silently reinterpreted. Recovery documentation must identify the old version's actual remaining exit paths. The staging refund applies only to unaccepted deposits, and no general emergency-recovery mechanism is specified for accepted notes. A new deployment cannot import old roots/nullifiers unless a separately reviewed migration protocol explicitly proves equivalence; no such V1 migration exists.
