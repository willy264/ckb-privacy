# Contributing to CCC Incognito Mode

This repository develops a private candidate for the proposed `@ckb-ccc/stealth` package and an example CCC application. The package name does not imply publication or upstream acceptance. Keep changes within stealth-address send, recognition, spend preparation, and fresh-change handling.

## Where changes belong

| Path | Responsibility |
|---|---|
| `packages/stealth/src/` | Reusable address, derivation, scan, ownership, capacity, and CCC draft helpers |
| `packages/stealth/src/testing/` | Public fixtures and deterministic test-only helpers |
| `packages/stealth/test/` | Known-answer vectors, malformed-input cases, ownership checks, and export boundaries |
| `examples/incognito/src/` | Application state, views, disclosure, and visibly simulated CCC handoff |
| `examples/incognito/scripts/` | Browser verification and evidence capture |
| `docs/` | Current design, integration, limitations, and evidence |
| `docs/review-guide.md` | Maintainer reading order and open integration questions |

The example must consume package exports, not relative imports into package internals. Public demo identities and fixed-scalar derivation belong to `@ckb-ccc/stealth/testing`; normal derivation must use fresh randomness. Keep application presentation and demo state out of the reusable package.

## Local checks

Use Node.js 24 and PNPM 10.32.1 from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
pnpm test
```

`pnpm dev` starts the example. `pnpm build:demo` and `pnpm test:demo` target its build and browser checks. Browser verification requires a local Chromium-compatible browser; install the pinned Playwright browser when needed:

```sh
pnpm --filter @ccc-incognito/demo exec playwright install chromium
```

Add focused tests when changing cryptographic formats, ownership validation, public exports, or transaction boundaries. Preserve independent known-answer vectors and fail-closed behavior for unavailable live operations. Do not substitute local fixture matches for chain confirmation.

## Evidence and privacy claims

Amounts and sender inputs remain public. Keep the disclosure and **SIMULATED** labels visible. Never invent transaction hashes, confirmations, or settlement; public fixture keys must never receive assets.

`pnpm diagram:export` renders target architecture. `pnpm capture:evidence` builds and captures the real local example; the [evidence catalog](docs/evidence/README.md) describes the recorded dates, hashes, and source fingerprints. `pnpm test:demo` checks behavior without replacing evidence. Source relocation alone does not justify changing historical image bytes, capture dates, or hashes.

## Upstream contribution

Follow the [integration guide](docs/integration-guide.md) and [review guide](docs/review-guide.md) for the proposed CCC boundary and acceptance questions. A local implementation, an upstream submission, review disposition, publication, and merge are separate states. Do not claim a state without its evidence.

Historical work is available through [Git history](docs/history.md). Keep local archives, runtime data, proposal documents, generated builds, and editor temporary files out of commits; they are not part of the maintainer review tree.
