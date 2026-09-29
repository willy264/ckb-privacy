> Historical snapshot of `docs/integration-guide.md`, superseded by the incognito direction on 2026-09-29. This record describes earlier work, not current deliverables, deployment status, or privacy guarantees. See [current documentation](../../README.md).

# Integrating Obscell Privacy Protocol Into A CCC Application

This guide demonstrates the architectural boundary available today. It does not claim live corrected-V1 settlement.

The integration path is **Application -> Privacy SDK -> Privacy Core / CKB scripts**. Privacy Protocol defines validity rules and Privacy Core implements them; `PrivacyClient` exposes that infrastructure to developers. The SDK's CCC adapter uses a Client owned by the host application and a Signer supplied only to an operation needing approval. CCC handles transaction construction, signing, submission, and chain interaction; it is not an implementation layer beneath Privacy Core. The Obscell reference application is the first controlled SDK consumer, not a separate wallet product. Its one-asset, fixed-denomination privacy pool is the initial validation use case, not the project's architectural boundary. Other applications can consume the SDK directly when its release and deployment gates pass. The existing `mixer-sdk` import remains unchanged for compatibility.

## 1. Keep Existing CCC Ownership

Your application continues to create/select the CCC client and wallet signer. Obscell does not install a connector or switch networks:

```ts
import type { ccc } from "@ckb-ccc/core";
import {
  createPrivacyClient,
  InMemoryPrivacyStateStore,
  type PrivacyDeployment,
  type PrivacyServices,
} from "mixer-sdk";

declare const client: ccc.Client;
declare const signer: ccc.Signer;
declare const deployment: PrivacyDeployment;
declare const services: PrivacyServices; // includes indexer + independent stateVerifier for sync

const privacy = createPrivacyClient({
  client,
  deployment,
  stateStore: new InMemoryPrivacyStateStore(), // development only
  services,
});
```

For a real application, replace the memory store with an authenticated, encrypted-at-rest implementation. Its `commitSync(snapshot, notes, expectedPrevious)` method must atomically compare the stored pool/block/outpoint checkpoint with `expectedPrevious` and commit the snapshot plus all note updates in one storage transaction. This compare-and-swap must work across application instances or processes sharing the database; the SDK's per-client queue does not provide that guarantee. Load `deployment` from a verified versioned manifest, not UI-controlled or untrusted remote JSON.

`CreatePrivacyClientOptions` also accepts an optional `PrivacyProver` as `prover`. Injecting one does not currently make proof generation available through `PrivacyClient`; `localProofGeneration` remains `unavailable` until the corrected-V1 proving workflow is connected and tested.

## 2. Gate UI With Capabilities

```ts
const capabilities = await privacy.getCapabilities();

if (capabilities.shield !== "supported") {
  // Keep live settlement disabled and explain the deployment limitation.
}
```

Current V1 foundation correctly reports settlement unavailable. Do not catch `UNSUPPORTED_OPERATION` and replace it with a local balance or fake transaction status.

## 3. Synchronize Authoritative State

```ts
const snapshot = await privacy.sync({ poolId });
const balance = await privacy.getPrivateBalance({ poolId });
const notes = await privacy.listNotes({ poolId, state: "accepted" });
```

The injected indexer must resolve live PoolState/Vault cells through the supplied client, checkpoint block hashes, and handle rollback. Its output is untrusted until the separate `services.stateVerifier` checks the live cells and block identity through the same injected client; `sync()` is unavailable without both services. The verified result is still committed conditionally, so a concurrent update produces retryable `STALE_STATE` instead of overwriting newer private state. No production indexer, verifier, or encrypted persistent store ships in this foundation. Balance includes only accepted unspent local notes whose recorded proof root remains in the authoritative window; inspect `NoteMetadata.proofStatus === "root-expired"` to schedule path/root refresh without treating the note as spent.

## 4. Supply Signers Per Operation

```ts
await privacy.shield({ poolId, signer });

await privacy.unshield({
  noteId,
  recipient: recipientAddress,
  submission: { kind: "direct", signer },
});
```

The SDK rejects a signer attached to another client instance. A relayed operation instead uses `{ kind: "relayed", maxFee }`; the relayer reconstructs the transaction and may add only untyped fee capacity.

These calls currently fail explicitly because the V1 staging/withdrawal pipelines are not connected. The examples define integration shape, not runnable settlement.

## 5. Keep Wallet/UI Concerns Outside

The application owns JoyID or other connector setup, modals, password prompts, progress UI, notifications, analytics, explorer links, and display formatting. It must never send note secrets, nullifier secrets, plaintext backups, or passwords to services or telemetry. A web host only serves the interface; CKB and the protocol's cryptographic checks enforce accepted transitions. A compromised frontend can still expose secrets or mislead user approval, so interface integrity and local secret handling remain client risks.

## 6. SDK Boundary Fixture

`examples/payment-app` is a minimal applicant-authored package-boundary fixture that imports only the public package entry point and supplies its own CCC-shaped client, transient store, indexer, verifier, and UI. Its deterministic behavior proves package/API separation and zero submission; it is not the Obscell reference application, a separately funded product, third-party adoption, or live-chain evidence. This grant retains it as local package-boundary evidence. A future application integration outside this grant would replace the fixtures with real application-owned adapters and exercise the same public API against a validated deployment. Shared source copied from the reference application would not prove reusability.

## 7. Before Enabling Live Controls

Use isolated testnet controls only after the implementation and testnet preflight in [the deployment guide](deployment.md) pass. Public mainnet controls additionally require:

- Manifest network/address prefix, genesis identity, pool Type-ID, CT script hash, domains, circuit hashes, and cell deps validate for that network.
- Protocol, cryptographic, cross-language, adversarial, state-transition, and SDK integration tests pass.
- The exact Pudge runbook passes, including recipient subsequent spend and service rebuild.
- Independent review is complete, with no unresolved critical or high security findings; residual limitations are documented.
- Release artifacts are reproducible and developer, recovery, and deployment documentation is complete.
- Capability discovery reports the operation as supported from verified adapters, not an environment flag alone.

The five-month / approximately 20-week grant targets this progression from testnet to a validated mainnet-ready release and gated mainnet deployment. Month 5 addresses integration defects, cryptographic findings, testnet issues, independent review, remediation, deployment preparation, and final release evidence. If mainnet gates remain unmet, deliver the validated testnet release and documented remediation state instead; do not label unresolved testnet acceptance as validated. Presently, no corrected-V1 deployment exists and live privacy capabilities remain unavailable.
