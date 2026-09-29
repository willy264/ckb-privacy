# CCC Incognito example

`@ccc-incognito/demo` is the private browser example for the local `@ckb-ccc/stealth` package candidate. It demonstrates an opt-in Incognito mode alongside ordinary CCC sending, with Send, Scan/Receive, fresh-change status, and transaction disclosure views. The package name does not claim an upstream CCC release or endorsement.

## Run from the repository root

Use Node.js 24 and PNPM 10.32.1:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm dev` builds the stealth package, then watches its source alongside the Vite application. No RPC credentials, wallet, or private environment variables are needed for this local demonstration.

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

## Source map

| Path | Responsibility |
|---|---|
| `src/App.tsx` | Application layout, Incognito mode presentation, view selection, and whole-demo reset |
| `src/views/SendView.tsx` | Recipient and amount inputs, one-time derivation, and unsigned output preview |
| `src/views/ReceiveView.tsx` | Fixture scan results and local spend-authority preview |
| `src/hooks/useSendDemo.ts` | Send state, input validation, draft invalidation, and fresh-change preparation |
| `src/hooks/useReceiveDemo.ts` | View-key input, supplied-record detection, and spend-preview state |
| `src/components/` | Shared disclosure, CCC handoff, change-hygiene, badge, and code-value presentation |
| `src/demo/fixtures.ts` | Deliberately public identities and deterministic incoming fixtures |
| `src/demo/transactions.ts` | Ordinary CCC unsigned output construction and preview serialization |
| `src/index.css` | Application appearance and responsive layout |
| `scripts/` | Reproducible browser checks, screenshots, and architecture export |

Reusable behavior comes through the package's public exports. The example does not import package source files directly. Its fixtures explicitly import `createDemoIdentity`, `createFixturePayment`, and `deriveStealthPaymentForTest` from `@ckb-ccc/stealth/testing`. Deterministic keys belong only to this testing boundary; normal one-time derivation uses fresh randomness.

Send and receive state remain separate. Editing the recipient, amount, or mode invalidates the send draft and its change preview. Reset clears both flows. Pending asynchronous address parsing cannot restore a draft after a later edit or reset. The change indicator displays only the current operation's derived change.

## What the demo actually does

Local cryptographic derivation, view-key recognition of supplied fixture records, spend-authority verification, and unsigned CCC output construction run in the browser. All fixture identities are public; never send funds to their addresses or paste real keys into the example.

Live chain scanning, input discovery, fee completion, wallet approval, signing, broadcasting, and settlement remain **SIMULATED**. The illustrated `completeInputs`, `completeFee`, and signer handoff does not invoke those operations. Spend preparation leaves the fixture unspent and does not construct a spendable transaction input. No transaction hash or confirmation is invented.

The example instantiates a CCC testnet client for local address handling. It makes no live chain requests; browser verification blocks external requests and checks that none were attempted. State stays in memory and is not persisted to browser storage.

Stealth receiving aims to obscure the link to the recipient's published identity. Amounts and sender inputs are **not hidden**. Ephemeral public keys, timing, and transaction relationships remain public; network and amount correlation remain possible. A fresh change address does not conceal its amount or break those relationships.

## Evidence

Run from the repository root:

```sh
pnpm diagram:export
pnpm capture:evidence
```

The export script renders the target architecture into `docs/diagrams/`. The capture script drives this application at a 1440px viewport and records the overview, stealth send, detected fixture payment, and disclosure panel under `docs/evidence/`. It records SHA-256 hashes, capture dates, dimensions, and source fingerprints, and preserves previous captures in ignored `.local/history/captures/` before replacement. Earlier committed versions remain in Git history.

Screenshots retain the on-screen simulation labels. They demonstrate the interface and local behavior; they are not deployment evidence. See the [evidence catalog](../../docs/evidence/README.md), [package API](../../packages/stealth/README.md), [architecture](../../docs/architecture.md), and [security and limitations](../../docs/security.md).
