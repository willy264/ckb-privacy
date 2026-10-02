# CCC with an optional Incognito mode

`@ccc-incognito/demo` adapts the existing CCC application's shell and controls to demonstrate normal versus stealth receiving in the same interface. It reuses the local `@ckb-ccc/stealth` prototype and runs without a wallet or chain connection. The Incognito toggle changes the receiving identity and send/receive flow; it does not create a separate wallet product.

The UI baseline is upstream CCC `packages/demo` at commit [`3d11c1ed2be6764624ab2b70de2a485eb3a6c93b`](https://github.com/ckb-devrel/ccc/tree/3d11c1ed2be6764624ab2b70de2a485eb3a6c93b), corresponding to `@ckb-ccc/core@1.12.5`. The minimal shell/control adaptation lives in `src/ccc/`; [CCC_UPSTREAM.md](CCC_UPSTREAM.md) records its exact sources, changes and attribution. This is a local UI adaptation, not a published GitHub fork of the complete CCC monorepo or an accepted upstream feature. The experimental package name does not imply an official CCC release.

## Run from the repository root

Use Node.js 24 and PNPM 10.32.1:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm dev` builds the stealth package, then watches its source alongside the Vite application. No RPC credentials, wallet, or private environment variables are needed for this local demonstration.

No new runtime dependencies or chain integration are needed for this UI adaptation. The workspace still consists of the stealth package and this example.

```sh
pnpm typecheck
pnpm build
pnpm test:demo
pnpm test
```

`pnpm build` (also available as `pnpm build:demo`) produces this application's `dist/` directory. `pnpm test:demo` builds the application and checks the browser flows at desktop and mobile widths without replacing the saved evidence. `pnpm test` also checks the workspace structure and stealth package tests.

The browser checks need Chromium, Chrome, or Edge. To install Playwright's Chromium explicitly:

```sh
pnpm --filter @ccc-incognito/demo exec playwright install chromium
```

## Walk through the comparison

1. Open the demo in Normal mode. The public demo account shows a reusable receiving address. Copy it or select **Receive** to see the normal flow. **Disconnect demo** and **Use demo account** change local account state only.
2. Turn on **Incognito mode**. The same account panel now shows a stealth meta-address containing public view/spend keys. Copy this identity; a sender uses it to derive a fresh destination. **What changed?** compares both modes.
3. On **Send**, use the demo recipient and **Derive one-time address**, then **Build transaction preview**. Expand technical details to see the ephemeral public key or unsigned output. **Preview fresh change** optionally derives a separate change destination; no fee or change capacity is invented.
4. Open **Scan & receive** and choose a **Demo viewing profile**. **Scan fixture payments** checks two local records: the matching profile detects one payment, while the unrelated profile detects none. Viewing-key text is readonly and tucked into technical details; there is no private-key entry field.
5. Use **Spend simulation** to see a local ownership check and fresh destination/change addresses. The fixture remains unspent. **Disclosure** explains what an actual transaction would reveal.
6. Switch Incognito off to return to normal receiving. **Reset demo** clears both flows and returns to Normal mode.

**Demo only. Do not enter real private keys or send real assets.** All identities and incoming payment fixtures are public demo values.

## Source map

| Path | Responsibility |
|---|---|
| `src/ccc/` | Pinned CCC shell, controls, local logo and scoped styles adapted for Vite |
| `src/App.tsx` | Simulated account state, shared mode, view selection, comparison, and reset |
| `src/components/ReceivingIdentity.tsx` | Normal/stealth identity display and real clipboard copy |
| `src/components/ModeComparison.tsx` | Normal versus Incognito explanation in the application |
| `src/views/SendView.tsx` | Recipient and amount inputs, one-time derivation, and unsigned output preview |
| `src/views/ReceiveView.tsx` | Normal receiving or fixture-profile scan and local spend preview |
| `src/hooks/useSendDemo.ts` | Send state, validation, draft cancellation, and optional fresh change |
| `src/hooks/useReceiveDemo.ts` | Public fixture profiles, cancellable local scan, and spend-preview state |
| `src/components/` | Shared disclosure, simulated CCC handoff, change status, badges and code text |
| `src/demo/fixtures.ts` | Deliberately public identities and deterministic incoming fixtures |
| `src/demo/transactions.ts` | Ordinary CCC unsigned output construction and preview serialization |
| `src/index.css` | Application appearance and responsive layout |
| `scripts/` | Reproducible browser checks, screenshots, and architecture export |

Reusable behavior comes through the package's public exports. The example does not import package source files directly. Its fixtures explicitly import `createDemoIdentity`, `createFixturePayment`, and `deriveStealthPaymentForTest` from `@ckb-ccc/stealth/testing`. Deterministic keys belong only to this testing boundary; normal one-time derivation uses fresh randomness.

Send and receive operation state remain separate while the same Incognito toggle governs both views. Editing the recipient, amount or mode invalidates the send draft. Changing the fresh-change choice invalidates the output preview while retaining its recipient derivation. The change indicator shows only the current operation's change destination.

Fixture scanning has a 180ms UI transition labelled **Checking fixture payments** before performing local matching. This brief delay does not represent a network request. Profile changes, mode changes, disconnect and reset invalidate pending scan results. Pending address parsing likewise cannot restore an outdated send preview. Spend preparation accepts only the current detected fixture, and reset clears both flows.

## What the demo actually does

Local cryptographic derivation, view-key recognition of supplied fixture records, spend-authority verification, and unsigned CCC output construction run in the browser. Identity copying uses the browser Clipboard API, with a manual-copy message if access is unavailable. All fixture identities are public; never send assets to their addresses.

Live chain scanning, input discovery, fee completion, wallet approval, signing, broadcasting, and settlement remain **SIMULATED**. The illustrated `completeInputs`, `completeFee`, and signer handoff does not invoke those operations. Spend preparation leaves the fixture unspent and does not construct a spendable transaction input. No transaction hash or confirmation is invented.

The account connection is also simulated: selecting a demo account does not connect a wallet extension or request approval. The example instantiates a CCC testnet client for local address handling. It makes no live chain requests; browser verification blocks external requests and checks that none were attempted. State stays in memory and is not persisted to browser storage. Testnet-formatted addresses do not establish compatibility with a deployed lock.

Stealth receiving aims to obscure the link to the recipient's published identity. Amounts and sender inputs are **not hidden**. Ephemeral public keys, timing, and transaction relationships remain public; network and amount correlation remain possible. A fresh change address does not conceal its amount or break those relationships.

## Evidence

Run from the repository root:

```sh
pnpm capture:evidence
```

The Playwright capture script drives actual controls at a 1440px viewport and records seven images under `docs/evidence/`: normal overview, Incognito enabled, receiving identity, comparison, send preview, recognized fixture payment, and disclosure. It records SHA-256 hashes, capture dates, dimensions and source/build fingerprints. Before replacement it preserves the previous catalog, manifest and replaced screenshots in ignored `.local/history/captures/`. Earlier committed versions remain in Git history.

The same script with `--check` verifies browser behavior without replacing evidence, including invalid inputs, clipboard copying, optional change, fixture profiles, stale-scan cancellation, mobile layout, and demo account disconnect/reconnect. The separate `pnpm diagram:export` command regenerates the authored target architecture; that image is not a screenshot or deployment proof.

Screenshots retain the on-screen simulation labels. They demonstrate the interface and local behavior; they are not deployment evidence. See the [evidence catalog](../../docs/evidence/README.md), [integration notes](../../docs/ccc-ui-demo.md), [package API](../../packages/stealth/README.md), and [security and limitations](../../docs/security.md).

## Toward live integration

First validate this receiving UX and the package boundary with CCC maintainers. A separate live testnet implementation would need verified stealth-lock deployment parameters, application-owned CCC client/signer integration, real indexer discovery and live-cell tracking, actual input/fee completion, a compatible stealth witness signer, and a verified receive-to-spend lifecycle. Those operations are intentionally outside this visual demo. Existing unsigned previews and fixtures must not be relabelled as chain evidence.
