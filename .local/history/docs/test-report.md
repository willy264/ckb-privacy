# CCC Incognito Validation Report

**Scope date:** 2026-09-29. Local package candidate and simulated example; no live testnet or upstream acceptance claim.

The [previous report](archive/pre-incognito/test-report.md) preserves earlier command results. Those results belong to the earlier implementation and do not validate this package.

## Repository restructuring

The active workspace now contains `packages/stealth` and `examples/incognito`. The following checks ran against the reorganized source on 2026-09-29 using local Node.js 25.8.1 and PNPM 10.32.1. CI targets Node.js 24; no hosted CI run is claimed here.

| Check | Result |
|---|---|
| `pnpm install --frozen-lockfile` | Passed for three workspace projects including the root; 448 old dependency installations removed |
| `pnpm typecheck` | Passed for the package and example |
| `pnpm test` | Passed: workspace/import boundaries, 15 package tests, production build, and Playwright browser verification |
| Development startup via `pnpm dev` | Package watcher reported zero errors; example rendered at localhost without browser errors; verification processes stopped afterward |
| `node examples/incognito/scripts/export-incognito-architecture.mjs --check` | Passed: relocated renderer resolves the original diagram and validates bounds and preserved hashes without rewriting evidence |
| Archive preservation | 269 historical files match their original contents; 14 existing Windows text checkouts required line-ending normalization for comparison with Git |
| Evidence preservation | 42 PNGs remain byte-identical, recorded capture hashes still match, and original metadata/artwork has no Git diff |
| Documentation and whitespace | 104 active local links resolve; active source/tooling and changed-file whitespace checks passed |

Browser verification covered 1440px and 390px widths, normal/stealth modes, invalid inputs, fresh derivation, matching/nonmatching view keys, spend preparation, disclosure, and reset. It observed zero page errors, data requests, attempted external/write requests, and broadcasts. The package boundary test verifies that public fixture keys and deterministic derivation are available only through the testing entry point.

These checks preserve the earlier screenshot and metadata files. The dated table below records the first incognito pivot separately.

## Initial pivot validation (commit `099c6ad`)

| Command | Result on 2026-09-29 |
|---|---|
| `pnpm install --frozen-lockfile` | Passed across all seven recorded workspace projects |
| `pnpm build` | Passed: package TypeScript build and production frontend bundle |
| `pnpm test` | Passed: 14 package tests, frontend production build, and headless browser verification |
| `node frontend/scripts/export-incognito-architecture.mjs` | Passed: target diagram PNG and source/output hashes generated; text bounds checked |
| `node frontend/scripts/capture-incognito-evidence.mjs` | Passed: four actual browser screenshots at 1440px width, with capture dates and SHA-256 hashes |
| `git diff --cached --check -- . ':!frontend/archive/previous-app/'` | Passed for the staged change outside the preserved historical frontend source |

The browser run exercised desktop (1440 × 1000) and mobile (390 × 844) layouts. It observed zero page errors, zero data requests, zero attempted external/write requests, and zero broadcasts. Full-page screenshot heights differ by view. The capture manifest records exact tool versions and source/build fingerprints; random one-time keys can change future screenshot hashes.

The old UI source is now preserved in `archive/obscell/frontend/src/`, including its original whitespace. The commands and paths in this dated table identify their locations when those checks ran. Current browser and diagram scripts live in `examples/incognito/scripts/`. Existing image and metadata bytes were not changed by the relocation.

## What local checks can establish

Codec checks validate format and key rejection. Derivation and recognition vectors establish agreement between local sender and receiver calculations. Negative cases exercise malformed data and nonmatching ownership. CCC draft checks verify construction without treating an unsigned draft as accepted by the chain.

Browser checks exercised both toggle states, malformed recipient rejection, fresh stealth derivation, draft invalidation after edits, normal CCC output construction, wrong-view-key rejection, fixture recognition, spend preparation, fresh-change status, reset, and disclosure. They verified **SIMULATED** labels, absence of old active-design terminology and invented settlement identifiers, and no horizontal overflow at either viewport. No wallet connection or transaction submission occurred.

The [evidence catalog](evidence/README.md) contains the captured image metadata. A screenshot hash proves the bytes being referenced; it does not prove testnet settlement.

## Not established

No local check alone proves the reused lock's deployed configuration, indexer completeness, a correct live stealth signer, an accepted testnet send or spend, an independent audit, package publication, or CCC maintainer acceptance.
