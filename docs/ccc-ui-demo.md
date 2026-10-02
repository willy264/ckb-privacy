# CCC Incognito UI integration

This proof of concept adds an optional Incognito receiving flow to a local adaptation of the existing CCC application. Users can switch between a reusable CKB receiving address and a stealth identity, preview a one-time destination, and recognize a supplied fixture payment without connecting a wallet or submitting a transaction.

## What is adapted from CCC

The baseline is [`ckb-devrel/ccc`, commit `3d11c1ed2be6764624ab2b70de2a485eb3a6c93b`](https://github.com/ckb-devrel/ccc/tree/3d11c1ed2be6764624ab2b70de2a485eb3a6c93b), the source corresponding to `@ckb-ccc/core@1.12.5`. Its application lives in `packages/demo`. The local implementation carries over a small shell/control layer into Vite, including the header/main/footer structure, CCC branding, button/input conventions and ecosystem links. It does not claim to reproduce the latest upstream application.

[Source provenance](../examples/incognito/CCC_UPSTREAM.md) maps each adapted file to its upstream source and records attribution and licensing facts. The local files are under [examples/incognito/src/ccc](../examples/incognito/src/ccc). The account panel, Incognito toggle, comparison and fixture flows are prototype additions.

This is a local UI adaptation, not a published GitHub fork of the complete CCC monorepo. `@ckb-ccc/stealth` remains a private experimental package, with no claim of upstream acceptance, official package status or production readiness. The existing two-package workspace and runtime dependencies are retained.

## Experience to review

| State | What the user sees | What changes |
|---|---|---|
| Normal | Public demo account, reusable receiving address, Send and Receive | Ordinary address-based output preview |
| Incognito enabled | The same account panel with a public stealth meta-address | Recipient identity becomes the source of fresh one-time destinations |
| Send preview | Recipient identity, locally derived destination, optional fresh change | Ephemeral key and unsigned output are available in technical details |
| Scan & receive | Public fixture profile, local checking state, matching or empty results | Viewing information recognizes a supplied output without a chain scan |
| Spend preview | Ownership check, recipient destination and fresh change | No input is consumed; the fixture remains unspent |
| What changed? | Side-by-side Normal and Incognito explanation | Makes receiving identity, destination and remaining disclosure comparable |

Copying the receiving identity uses the actual browser clipboard. The normal identity is a testnet-formatted CKB address; the stealth identity contains public view/spend keys. Neither contains a private key. Technical details display the deliberately public fixture viewing key as readonly text. Users choose a matching or unrelated profile instead of entering private viewing information.

The demo account starts selected. **Disconnect demo** and **Use demo account** exercise local account state, without wallet connections. The Incognito toggle is unavailable when no demo account is selected. Switching mode clears stale send and receive results; reset returns to Normal mode.

## Real computations and simulated activity

| Real local behavior | Simulated or unavailable behavior |
|---|---|
| Meta-address encoding and validation | Wallet connection and account discovery |
| Fresh ECDH one-time destination derivation | Live balances, indexing and chain scans |
| View-key matching over supplied fixtures | Transaction input discovery and fee completion |
| Ownership check and one-time spend-key derivation | Lock-specific witness signing and wallet approval |
| Optional fresh-change destination derivation | Broadcast, settlement and confirmations |
| CCC unsigned output construction | An actual receive-to-spend testnet lifecycle |

The fixture scan waits 180ms so the interface can show **Checking fixture payments**, then performs real local matching. This is a UI transition, not simulated network latency presented as real. Cancellation prevents results from reappearing after a profile change, mode change, reset, disconnect or component unmount. Send address parsing has equivalent stale-result protection.

The package and fixture boundaries are preserved: reusable operations come from `@ckb-ccc/stealth`; deterministic identities and fixture construction come from `@ckb-ccc/stealth/testing`. No new cryptography, contracts or chain services are introduced. Fixtures contain no invented live outpoints or transaction identifiers. The live broadcast entry point continues to fail closed.

**Demo only. Do not enter real private keys or send real assets.** Public fixture keys are unsuitable for assets. A testnet address prefix describes address encoding, not a verified deployment. No fake transaction hash, explorer transaction link or confirmation is shown.

Stealth receiving reduces direct linkage to a reusable recipient identity. Amounts, sender inputs, outputs and ephemeral public keys remain visible. Fresh change does not conceal value or break transaction-graph relationships; timing, network and amount correlation remain possible. This is not a fully private transaction system.

## Run and inspect

From the repository root, with Node.js 24 and PNPM 10.32.1:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

No wallet, RPC credentials or private configuration is required. Open the local URL printed by Vite and compare both modes. The [example README](../examples/incognito/README.md) gives the complete walkthrough and source map.

Available verification commands:

```sh
pnpm typecheck
pnpm test
pnpm capture:evidence
```

The browser checks use Playwright Chromium, Chrome or Edge. Install Chromium if needed with `pnpm --filter @ccc-incognito/demo exec playwright install chromium`. `pnpm test:demo` checks the built interface without replacing saved evidence. The checks exercise actual controls, test clipboard copying with browser permissions, block external/write requests, and reject any attempted chain/service request.

## Screenshots and provenance

The capture script produces seven desktop screenshots at a 1440px viewport, plus checks the same interface at 390px. Full-page screenshot heights vary.

| File under `docs/evidence/` | State |
|---|---|
| `incognito-overview.png` | Normal CCC account, receiving address and send |
| `incognito-enabled.png` | Incognito enabled in the same application |
| `incognito-identity.png` | Stealth receiving identity and fixture profile before scanning |
| `incognito-comparison.png` | Normal versus Incognito comparison |
| `incognito-send.png` | One-time destination, unsigned output and fresh-change preview |
| `incognito-receive.png` | Recognized fixture payment with spend-preview action |
| `incognito-disclosure.png` | Privacy limits and simulated-operation disclosure |

The [evidence catalog](evidence/README.md) and [capture manifest](evidence/incognito-manifest.json) record hashes, capture dates, viewport, source/build fingerprints and browser versions. The [capture script](../examples/incognito/scripts/capture-incognito-evidence.mjs) drives the real UI; it does not inject payment results, replace DOM content or edit screenshot pixels. Prior captures and catalogs are copied to ignored `.local/history/captures/` before replacement, and committed versions remain in Git history.

These artifacts demonstrate interface behavior and local calculations. They are not deployment or live testnet evidence.

## Next integration boundary

Use this prototype to review the optional receiving experience and API boundary with CCC maintainers before attempting live behavior. A separate testnet adapter would then need verified stealth-lock parameters, an application-owned CCC client and operation-scoped compatible signer, real indexer discovery with live-cell tracking, actual input and fee completion, and lock-specific witness signing. A recorded end-to-end testnet send/recognize/spend flow would establish chain evidence separately from these UI captures.

Confidential amounts, new contracts, mainnet deployment and a full wallet replacement are outside this demonstration.
