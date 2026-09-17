# Obscell Privacy SDK

**Status:** Corrected-V1 foundation. Read/sync/note abstractions are implemented and tested; live shield/refund/unshield builders intentionally report `UNSUPPORTED_OPERATION` until authoritative scripts and deployments exist.

## Architecture

The SDK is the developer interface to **Obscell Privacy Protocol — CKB Privacy Core and SDK**:

```text
Application / reference application -> Privacy SDK -> Privacy Core / CKB scripts
                                                 -> application-owned CCC
```

**Privacy Protocol** defines the rules that make a private operation valid. **Privacy Core** implements those rules and the cryptographic machinery required to execute them. It is not a public class named `PrivacyCore` or a synonym for the literal `src/core/` directory. The **Privacy SDK** packages those capabilities into the framework-agnostic `PrivacyClient` and associated modules. **CCC** remains the application's existing CKB client and signing/transaction layer, supplied through an explicit integration boundary: the SDK's CCC adapter uses an injected Client and operation-scoped Signer. **CKB** enforces the scripts and settles accepted transitions.

The reference application is the first controlled SDK consumer, not a separate product funded alongside it or a full commercial wallet. Its one-asset, fixed-denomination privacy pool validates the protocol's commitments, state, proofs, nullifiers, CT conservation, and CKB transitions; the pool is not the project's architectural boundary.

The package import remains `mixer-sdk` and the implementation repository remains `ckb-privacy-mixer` for compatibility. No package rename or new `PrivacyCore` API is implied by the public project name.

See the [SDK integration-boundary diagram](diagrams/sdk-integration.png), labeled **target architecture — not deployment evidence**, for host ownership and dependency injection.

## Public Boundary

```ts
import { createPrivacyClient } from "mixer-sdk";

const privacy = createPrivacyClient({
  client,
  deployment,
  prover,
  stateStore,
  services,
});

await privacy.getCapabilities();
await privacy.sync({ poolId });
await privacy.listNotes({ poolId, state: "accepted" });
await privacy.getPrivateBalance({ poolId });
await privacy.shield({ poolId, signer });
await privacy.refund({ operationId, signer });
await privacy.unshield({
  noteId,
  recipient,
  submission: { kind: "relayed", maxFee },
});
await privacy.getOperation(operationId);
```

`client` is an application-injected `ccc.Client`. `signer` is supplied only to direct operations needing user authority and must be bound to the same client instance. A relayed unshield supplies a fee ceiling, not a relayer private key. The corrected-V1 package root never selects JoyID, renders React, reads hidden testnet endpoints, or accepts a user private-key string.

The snippet illustrates existing API signatures with application-supplied dependencies. The `shield`, `refund`, and `unshield` calls currently reject unavailable operations; they do not constitute a runnable live lifecycle.

## Interface Coverage And Grant Work

| Developer responsibility | Existing interface or module | Remaining grant work |
|---|---|---|
| Initialize/configure protocol access | `createPrivacyClient`, `PrivacyDeployment`, pool configuration and capability validation | Verified deployment manifests and non-fixture adapters |
| Inspect state, roots, notes, and operations | `sync`, `listNotes`, `getPrivateBalance`, `getOperation` | Live chain decoding, independent verification, rollback, and durable encrypted storage |
| Handle notes, commitments, and nullifiers | `OwnedNote`/`NoteMetadata`, `deriveV1Leaf`, `deriveV1NullifierHash`, nullifier interfaces | Connect safe note creation and spent-state updates to the complete operations; implement the on-chain nullifier transition |
| Generate and verify proofs | `PrivacyProver`, frozen statement and canonical proof/public-signal ABI | Reviewed artifacts, corrected verifier, and a tested callable client workflow |
| Construct supported privacy operations | `shield`, `refund`, `unshield`; protocol validation and CCC transaction helpers | Complete staging, acceptance, refund, and withdrawal construction against authoritative scripts |
| Use a wallet and submit transactions | Injected CCC `Client`, operation-scoped `Signer`, direct/relayed submission types | Non-fixture signing/submission integration, confirmation, and adversarial end-to-end checks |

These names match the current exported foundation. Additional convenience API names are not committed here. The five-month plan completes these boundaries, validates them through the reference application on testnet, and prepares a reviewed release with a gated mainnet deployment target. New private-transfer or payment-product functionality is outside this scope.

## Capabilities

Applications must call `getCapabilities()` and handle each feature as `supported` or `unavailable`. Current settlement features are unavailable. Private transfer, arbitrary values, shielded change, multi-output join-split, and advanced stealth are always unavailable in V1.

An injected `PrivacyProver` does not by itself make local proof generation supported. `localProofGeneration` remains `unavailable` until `PrivacyClient` exposes and tests a callable corrected-V1 proof workflow.

An application must not infer capability from method presence. Methods remain present to stabilize the API and return typed `UnsupportedOperationError` until their deployment/test gates pass.

## Modules

The directories below are source-level responsibility groups whose corrected-V1 exports are re-exported from `mixer-sdk`; they are not supported package subpaths such as `mixer-sdk/core`. The only package entry points are `mixer-sdk` for corrected V1 and `mixer-sdk/legacy` for preserved historical compatibility.

| Module | Responsibility |
|---|---|
| `core/` | `PrivacyClient`, capabilities, typed errors, operation states |
| `protocol/` | Pool/state schemas, action context, acceptance/withdrawal invariants |
| `crypto/` | Canonical Fr/Fq handling, tags, Poseidon, commitments, script domains |
| `merkle/` | Depth-20 empty roots, paths, frontier/root helpers |
| `nullifier/` | Index-bound nullifier derivation and state-update interfaces |
| `notes/` | Secret-bearing internal model, public metadata, lifecycle, encrypted-envelope abstraction |
| `prover/` | Prover/verifier interface, frozen statement, public/proof ABI |
| `ccc/` | Deployment checks, chain reader, transaction materialization, signer boundary, capacity |
| `services/` | Chain-indexer, coordinator, and relayer interfaces with public data only |
| `validation/` | Pool, asset, recipient, fee, and stale-state checks |

The architectural Privacy Core spans `protocol/`, `crypto/`, `merkle/`, `nullifier/`, `notes/`, `prover/`, and `validation/`. By contrast, the source directory `core/` contains the public client orchestration, capability reporting, typed errors, and operation-state model. Legacy mixer exports remain at the explicit `mixer-sdk/legacy` subpath for repository compatibility; they are not part of the corrected-V1 package root.

The exported CCC transaction materializer is a recipient-bound foundation helper, not a submission authorization boundary. It checks the selected pool, distinct expected PoolState/Vault inputs (each consumed exactly once), derived action hash, and actual recipient CT output. A live adapter must additionally resolve and validate the successor PoolState/Vault, nullifier/proof witness, cell deps, capacities, and every fee input before signing or submission; no such production adapter is included.

## Privacy State

`OwnedNote` contains secrets and must stay inside an encrypted-at-rest `PrivacyStateStore`. `listNotes()` returns `NoteMetadata` without either secret. Every store must implement `commitSync(snapshot, notes, expectedPrevious)` as one atomic compare-and-swap: the snapshot and note changes are committed together only when the stored pool/block/outpoint checkpoint still matches `expectedPrevious`. A stale commit must fail with retryable `STALE_STATE` so the caller can synchronize again from a fresh snapshot. Per-client queueing reduces duplicate work but is not a substitute for this store-level check across multiple `PrivacyClient` instances or processes.

The included in-memory store implements this contract only within one JavaScript instance. It is for tests/development, identifies itself as `memory-only`, and is not a persistence recommendation. No encrypted persistent store ships in this foundation.

Lifecycle:

```text
created -> staging-submitted -> staged -> accepted -> spent
                              -> refunded
any observed state <-> orphaned/reorg recovery where explicitly allowed
```

Private balance counts only locally owned `accepted` notes whose accepted root remains valid in an authoritative synchronized PoolState. `NoteMetadata.proofStatus` distinguishes `ready`, `root-expired`, `state-unavailable`, and `not-applicable`; an expired proof root does not corrupt sync, but the note is excluded from spendable balance until its membership data is refreshed against a retained root. A staged or locally created note is never balance.

## Proof And Encoding

The `PrivacyProver` injection interface identifies the explicit `groth16-bn254` scheme, but it is not yet connected to a public `PrivacyClient` operation. Public signals are frozen and encoded to 288 little-endian bytes. Proof bytes use the documented 256-byte Arkworks-compatible ABI. SDK decoding checks coordinate field ranges; the injected/on-chain verifier remains responsible for infinity, curve, subgroup, and pairing checks.

Field text values use canonical 32-byte big-endian numeric hex. Contract ABI conversion is explicit and little-endian. No malformed input is reduced modulo Fr/Fq.

## Services

Indexer sync receives the injected CCC client and returns an observed PoolState snapshot plus public note updates. The SDK commits that result only after an independently injected `PrivacyStateVerifier` confirms live CKB cells, block identity, decoded state, and note evidence. No production indexer or state-verifier implementation is included. Coordinator receives a staging outpoint/commitment only. Relayer receives a typed protected intent. None of these interfaces includes `secret` or `nullifierSecret`.

`StagingDepositReference` is a service transport type, not a live-cell validator or transaction builder. A future coordinator adapter must derive it from a resolved staging cell and enforce the contract's nonzero canonical commitment and full pool/asset/denomination/refund data before requesting acceptance.

Service responses are observations until canonical chain state confirms them. Operation hashes may only come from CCC/client submission, never deterministic placeholders.

## Errors

Catch `PrivacySdkError` and branch on stable codes:

```text
INVALID_ARGUMENT
INVALID_ENCODING
INVARIANT_VIOLATION
UNSUPPORTED_OPERATION
SIGNER_MISMATCH
STATE_UNAVAILABLE
STALE_STATE
SERVICE_FAILURE
```

Do not expose raw error objects to telemetry if application context could contain private state. User-facing code should map codes to concise recovery actions.
