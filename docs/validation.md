# Validation

This record covers the private package candidate and simulated example. Tests validate local behavior; no live testnet lifecycle, audit, upstream acceptance, or hosted CI result is claimed.

## Reproduce

Use Node.js 24 and PNPM 10.32.1 from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm --filter @ccc-incognito/demo exec playwright install chromium
pnpm typecheck
pnpm test
```

`pnpm test:stealth` runs package tests. `pnpm test:demo` builds the example and runs browser checks without replacing saved evidence. `pnpm dev` starts the package watcher and application; `pnpm build` creates `examples/incognito/dist` for static hosting.

## CCC UI integration checks — 2026-10-02

The [CCC UI adaptation](ccc-ui-demo.md) was checked locally with Node.js 25.8.1 and PNPM 10.32.1. The CI target remains Node.js 24; this session did not run hosted CI or deploy the interface.

| Check | Result |
|---|---|
| `pnpm build` | Passed; package and strict application TypeScript compilation, then Vite production build |
| `pnpm test:stealth` | All 15 existing package tests passed; no cryptographic implementation changes |
| `node examples/incognito/scripts/capture-incognito-evidence.mjs` | Passed; seven 1440px captures and 390px responsive checks |
| Runtime integrity | Zero page errors, data requests, attempted external/write requests or broadcasts |
| `pnpm test:structure` | Passed; two active packages, 37 source files and 125 local documentation links |
| Saved evidence integrity | All seven PNG hashes and 48 source/build fingerprints matched the manifest after capture |

The browser run used actual controls and the Clipboard API. It checked normal versus stealth receiving identities, normal Receive, malformed normal/meta-addresses, invalid capacity, fresh destinations, optional fresh change, matching and nonmatching viewing profiles, local spend preparation, mode/profile/reset cancellation of pending scans, comparison visibility, and simulated account disconnection/reconnection. Receive exposes fixed fixture profiles and readonly key text instead of a private-key input. The test rejects private-key entry fields in that view.

Captures were visually reviewed for the account, send and comparison flows. Source and build fingerprints, exact browser version, image hashes and UTC timestamps are recorded in the [manifest](evidence/incognito-manifest.json). No claim of live wallet connection, scanning, signing or settlement follows from these results.

## Earlier structural checks — 2026-09-29

The structural refactor was verified on 2026-09-29 using local Node.js 25.8.1 and PNPM 10.32.1. The CI configuration uses Node.js 24.

The final maintainer layout was also copied into an isolated directory containing only its 78 intended public files, without `.git`, local archives, environment files, installed dependencies, or existing build output. A fresh `pnpm install --frozen-lockfile` and `pnpm test` passed there: workspace boundaries, 104 local documentation links, all 15 package tests, production compilation, and both browser viewports. The application therefore does not depend on files left in the old workspace.

| Check | Result |
|---|---|
| Frozen dependency installation | Passed; only the root, package, and example belong to the workspace |
| Type checking and production build | Passed |
| Package tests | 15 passed, including an independent derivation vector and public/testing export boundary |
| Browser verification | Passed at 1440px and 390px; zero page errors, data requests, attempted external/write requests, or broadcasts |
| Development startup | Package watcher reported zero errors; the application rendered without browser errors |
| Diagram verification | Source bounds and recorded source/PNG hashes passed without changing evidence |

Package tests cover malformed encodings and curve points, wrong view/spend keys, mutated locks, capacity limits, fresh derivation, unsigned CCC output construction, and unavailable live broadcast. The [test source](../packages/stealth/test/stealth.test.mjs) and [vector](../packages/stealth/test/vector.json) are the reviewable evidence.

Browser checks exercise normal and incognito sends, invalid input, draft invalidation, fixture recognition, spend preparation, fresh-change status, disclosure, reset, and responsive layout. The [Playwright script](../examples/incognito/scripts/capture-incognito-evidence.mjs) drives actual controls and rejects external activity.

## Images and history

The [evidence catalog](evidence/README.md) now contains seven CCC UI captures from 2026-10-02. The previous catalog, manifest and replaced screenshots were copied to ignored `.local/history/captures/` before replacement; committed versions remain in Git history. The existing target diagram was not regenerated and retains its separate generation date and hash. None of these images is deployment evidence.

Earlier reports and artifacts are preserved through [Git history](history.md). They are not additional passing tests for this package. A screenshot hash establishes file identity, not chain settlement.

## Remaining validation

The deployed lock binary and dependencies, a lock-specific signer, canonical-chain discovery, real send/scan/spend transactions, and final change behavior after live input/fee completion still require validation. See [security](security.md) and [current status](status.md).
