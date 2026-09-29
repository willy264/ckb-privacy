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

## Executed checks

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

The [four incognito captures](evidence/README.md) retain their original dates and hashes. Their manifest describes the source at capture time, before later file reorganization. It must not be treated as a fingerprint of today's checkout. The target diagram is not deployment evidence.

Earlier reports and artifacts are preserved through [Git history](history.md). They are not additional passing tests for this package. A screenshot hash establishes file identity, not chain settlement.

## Remaining validation

The deployed lock binary and dependencies, a lock-specific signer, canonical-chain discovery, real send/scan/spend transactions, and final change behavior after live input/fee completion still require validation. See [security](security.md) and [current status](status.md).
