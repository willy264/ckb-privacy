# CCC Incognito Validation Report

**Scope date:** 2026-09-29. Local package candidate and simulated frontend; no live testnet or upstream acceptance claim.

The [previous report](archive/pre-incognito/test-report.md) preserves earlier command results. Those results belong to the earlier implementation and do not validate this package.

## Executed validation

| Command | Result on 2026-09-29 |
|---|---|
| `pnpm install --frozen-lockfile` | Passed across all seven recorded workspace projects |
| `pnpm build` | Passed: package TypeScript build and production frontend bundle |
| `pnpm test` | Passed: 14 package tests, frontend production build, and headless browser verification |
| `node frontend/scripts/export-incognito-architecture.mjs` | Passed: target diagram PNG and source/output hashes generated; text bounds checked |
| `node frontend/scripts/capture-incognito-evidence.mjs` | Passed: four actual browser screenshots at 1440px width, with capture dates and SHA-256 hashes |
| `git diff --cached --check -- . ':!frontend/archive/previous-app/'` | Passed for the staged change outside the preserved historical frontend source |

The browser run exercised desktop (1440 × 1000) and mobile (390 × 844) layouts. It observed zero page errors, zero data requests, zero attempted external/write requests, and zero broadcasts. Full-page screenshot heights differ by view. The capture manifest records exact tool versions and source/build fingerprints; random one-time keys can change future screenshot hashes.

The archived frontend source is preserved byte-for-byte from the previous revision, including its original whitespace. It is excluded from the scoped whitespace check rather than reformatted as part of the new implementation.

## What local checks can establish

Codec checks validate format and key rejection. Derivation and recognition vectors establish agreement between local sender and receiver calculations. Negative cases exercise malformed data and nonmatching ownership. CCC draft checks verify construction without treating an unsigned draft as accepted by the chain.

Browser checks exercised both toggle states, malformed recipient rejection, fresh stealth derivation, draft invalidation after edits, normal CCC output construction, wrong-view-key rejection, fixture recognition, spend preparation, fresh-change status, reset, and disclosure. They verified **SIMULATED** labels, absence of old active-design terminology and invented settlement identifiers, and no horizontal overflow at either viewport. No wallet connection or transaction submission occurred.

The [evidence catalog](evidence/README.md) contains the captured image metadata. A screenshot hash proves the bytes being referenced; it does not prove testnet settlement.

## Not established

No local check alone proves the reused lock's deployed configuration, indexer completeness, a correct live stealth signer, an accepted testnet send or spend, an independent audit, package publication, or CCC maintainer acceptance.
