# CCC Incognito Mode

A local candidate for `@ckb-ccc/stealth`: an opt-in package that gives CCC applications stealth-address derivation, view-key payment recognition, and one-time spend-key helpers. Applications retain their CCC client, transaction completion, and signer. The implementation targets reuse of the existing [Obscell stealth lock](https://github.com/quake/obscell).

The package is **private and experimental**. Its working name does not imply CCC endorsement, publication, or upstream acceptance. Local cryptographic operations and unsigned CCC outputs work; live chain scanning, witness signing, transaction completion, and a verified testnet lifecycle remain pending.

**Privacy scope:** one-time addresses reduce linkage to a recipient's published identity. Amounts, sender inputs, and the transaction graph remain public. Fresh change reduces address reuse; it does not hide amounts or eliminate correlation.

## Start reviewing here

1. [Review guide](docs/review-guide.md): scope, implementation boundaries, and questions for CCC maintainers.
2. [Package API](packages/stealth/README.md) and [public exports](packages/stealth/src/barrel.ts): the proposed integration surface.
3. [Derivation primitives](packages/stealth/src/internal/curve.ts) and [lock encoding](packages/stealth/src/internal/lock.ts): compatibility-sensitive code.
4. [Tests](packages/stealth/test/stealth.test.mjs) and [validation record](docs/validation.md): what has been checked and what remains unverified.
5. [Incognito example](examples/incognito/README.md): a consumer of the package's public API.

## Repository layout

```text
packages/stealth/     Reusable package, public API, and focused tests
examples/incognito/  Browser example and evidence-capture scripts
scripts/             Workspace structure checks
docs/                Review, design, security, validation, and evidence
```

The active workspace contains only the package and example. Earlier project implementations are available in Git history at commit `099c6ad`; they are outside the current review surface. The repository URL retains its historical name.

## Run and verify

Use Node.js 24 and PNPM 10.32.1:

```sh
pnpm install --frozen-lockfile
pnpm --filter @ccc-incognito/demo exec playwright install chromium
pnpm typecheck
pnpm test
pnpm dev
```

`pnpm test` checks workspace structure, package behavior, and the built example in a browser. `pnpm build` produces the example's production build. See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow.

The example labels chain-dependent steps **SIMULATED**. Its incoming payments use public fixtures; it does not sign, broadcast, or claim settlement. Never send assets to fixture addresses. Screenshot captures and their hashes are recorded in the [evidence catalog](docs/evidence/README.md); they demonstrate the interface, not a deployment.

[Documentation index](docs/README.md) · [Current status](docs/status.md) · [Security and limitations](docs/security.md) · [Source provenance](docs/research.md)
