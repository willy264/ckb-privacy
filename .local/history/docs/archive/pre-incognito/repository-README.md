> Historical snapshot of `README.md`, superseded by the incognito direction on 2026-09-29. This record describes earlier work, not current deliverables, deployment status, or privacy guarantees. See [current documentation](../../README.md).

# Obscell Privacy Protocol

**CKB Privacy Core and SDK**

Obscell Privacy Protocol is experimental, reusable privacy infrastructure for CKB. The project develops a Privacy Core, exposes it through a developer SDK, and validates it through a reference application:

```text
CKB application / reference application
    -> Privacy SDK -> Privacy Core / Protocol -> CKB scripts and Cells
                  -> application-owned CCC -> CKB transactions and signing
```

The **Privacy Protocol** defines valid private operations; the **Privacy Core** implements those rules through commitments, notes, Merkle and nullifier state, proof verification, and CKB state transitions. The **Privacy SDK** packages those capabilities for application developers. The application retains its **CCC** client and wallet and supplies a signer only to the operation needing approval, through the SDK's explicit CCC adapter boundary. **CKB** verifies script rules and settles accepted transactions.

The reference application is not a separate product being funded alongside the SDK. It is the first controlled consumer of the Privacy SDK and provides a practical demonstration of the protocol's capabilities. The one-asset, fixed-denomination privacy pool is the first controlled validation use case, not the project's architectural boundary or a separate product.

This is willy264's implementation direction, evolved from the earlier reference prototype and informed by existing Obscell research credited in [the research record](research.md). The implementation repository remains `ckb-privacy-mixer`, and the SDK import remains `mixer-sdk` for compatibility. These historical technical names do not define the public project's scope.

## Current Status

This repository contains one privacy-infrastructure project whose historical, foundational, and reference artifacts are at different maturity levels:

| Layer or artifact | State | What it proves |
|---|---|---|
| `legacy-demo` | Historical prototype, preserved | Prior browser proving, encrypted-note recovery, CT experiments, coordinator/relayer mechanics, and CKB transaction construction; it is not corrected-V1 authority |
| Privacy Core / Protocol | Fail-closed foundation under implementation | Versioned protocol statement, circuit and state rules, strict encodings, structural CKB covenants, and chain-authoritative service interfaces |
| Privacy SDK and CCC boundary | Foundation under implementation | Public SDK modules accept application-owned CCC and fail explicitly where live privacy operations are unavailable |
| V1 reference privacy pool | Initial controlled use case, not yet deployed | When complete, it will validate the fixed-denomination protocol and SDK through the required Pudge lifecycle |
| Reference application | Interactive simulation | Protocol and SDK integration; current privacy actions are simulated |
| Payment example | Deterministic local SDK fixture | Package separation and injected client/state interfaces only; it is neither a second product nor live settlement evidence |
| Pudge end-to-end V1 | Not yet demonstrated | No corrected-V1 deployment, recipient CT spend, or Redis rebuild evidence is claimed |
| Independent security review | Not yet performed | Tests in this repository are not an audit |
| Mainnet release and deployment | Gated grant target | Requires verified testnet lifecycle, correctness/security acceptance, reviewed reproducible artifacts, and network-specific deployment checks |

The legacy/prototype flow is not protocol authority for corrected V1. In particular, coordinator or Redis state must not be treated as an authoritative Merkle root, nullifier set, or vault balance.

See [implementation status](status.md), [known limitations](known-limitations.md), and the [legacy boundary](../../../legacy-demo/README.md) before evaluating claims.

## Five-Month Delivery Plan

The grant plan spans five months / approximately 20 weeks: core architecture and vectors; protocol and CKB implementation; SDK and CCC integration; reference-application integration with real testnet validation; then hardening and release. Month 5 addresses integration defects, cryptographic findings, testnet issues, independent review, remediation, deployment preparation, and final release evidence.

Mainnet deployment is a release target subject to successful testnet validation, completion of the defined security review, resolution of critical/high-severity findings, reproducible deployment artifacts, and successful mainnet preflight. If mainnet gates remain unmet, deliver the validated testnet release and documented remediation state instead; unresolved testnet acceptance must be reported as incomplete. No corrected-V1 testnet or mainnet deployment has occurred. The complete gates and separate protocol, package, and frontend deployment responsibilities are in [the deployment guide](deployment.md).

## Repository Map

- `contracts/`: legacy CKB scripts plus the on-chain part of the corrected-V1 Privacy Protocol/Core foundation.
- `circuits/`: preserved legacy circuit/artifacts and the proof-system part of the corrected-V1 Privacy Core foundation.
- `mixer-sdk/`: reusable Privacy SDK, protocol/cryptographic modules, and CCC adapter; legacy mixer exports are isolated at `mixer-sdk/legacy`.
- `backend/`: legacy coordinator/relayer plus isolated chain-authoritative V1 interfaces.
- `frontend/`: protocol/SDK reference application; privacy actions remain visibly simulated.
- `examples/payment-app/`: local public-SDK boundary fixture using deterministic adapters; it is not a second product or live integration.
- `tests/`: CKB contract tests.
- `docs/`: architecture, protocol, SDK, security, test, deployment, and grant evidence.
- [`progress/`](../../../progress/README.md): dated research and implementation history. These files are evidence of evolution, not current protocol claims or independently re-verified deployment evidence.

## Local Verification

Prerequisites are Node.js, PNPM, Rust/Cargo, and a Chromium-compatible browser for the demo test.

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm test:contracts
pnpm --filter obscell-payment-example test:browser
pnpm --filter frontend test:demo
```

Individual checks and environment requirements are recorded in [the test report](test-report.md). Contract builds use the pinned toolchain in `rust-toolchain.toml`.

Regenerate the explicitly simulated screenshot evidence and its hashes with:

```bash
pnpm --filter frontend capture:evidence
pnpm --filter obscell-payment-example capture:evidence
```

The capture provenance and limits of each real screenshot are documented in [the evidence catalog](../../evidence/pre-incognito-catalog.md). Interface screenshots do not establish testnet or mainnet settlement.

## Run The Reference Application

```bash
pnpm dev
```

The default page is the Obscell Privacy Protocol reference application. It demonstrates the supported lifecycle and the SDK's intended place in a CKB application. Current privacy operations are deterministic local simulations and make no privacy transaction submission. The historical pool prototype is available at `?view=legacy` and is labeled accordingly.

## Documentation

- [Architecture](architecture.md)
- [Protocol V1 specification](protocol-v1.md)
- [Research and design record](research.md)
- [Threat model](threat-model.md)
- [SDK guide](sdk.md)
- [CCC integration guide](integration-guide.md)
- [Pudge runbook](pudge-runbook.md)
- [Deployment guide](deployment.md)
- [Test vectors](test-vectors.md)
- [Implementation report](implementation-report.md)

Grant proposal and funding materials are maintained locally and are intentionally not tracked in this repository.

Obscell is testnet-first research software. Do not use it to protect assets of value.
