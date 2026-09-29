# Incognito Demo, Testnet Validation, and CCC Contribution

## Current local deployment

The frontend is a static, **SIMULATED** demonstration. Build from the repository root so the local `@ckb-ccc/stealth` workspace package resolves:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm --filter frontend preview
```

The repository's web-host configuration builds the frontend. A hosted page is interface delivery only; it is not evidence of an on-chain deployment, a completed testnet lifecycle, or CCC acceptance. Do not configure funded wallet secrets in frontend environment variables.

## Reuse the existing lock

The project targets the existing Obscell stealth lock. It does not deploy the historical contracts in this repository as a new protocol.

Before a live demonstration, independently record the network/genesis identity, lock code hash and hash type, dependency outpoint and dep type, binary/source revision, lock-argument layout, announcement location, and witness/signature format. Confirm those facts against the deployed cells and the credited upstream sources. Unknown deployment metadata must remain unknown; do not fill it with placeholder hashes in public evidence.

## Testnet acceptance

A real candidate must complete the [send → scan → spend runbook](pudge-runbook.md) using testnet-only capacity and newly generated local secrets. Verify recipient ownership and final fresh-change outputs independently of the UI.

Reports must distinguish drafted, signed, submitted, included, confirmed, and subsequently spent. Publish actual hashes and explorer links only after verifying the corresponding chain data. Record failed or incomplete steps honestly. No local fixture, screenshot, or inferred transaction identifier satisfies this gate.

## Upstream path

The proposal targets a CCC-scoped package and a contribution to `ckb-devrel/ccc` against its contribution branch. First agree the API and boundary with maintainers, and coordinate attribution and lock compatibility with the Obscell authors. Then prepare the fork changes, colocated tests, JSDoc, changeset, reproducible demo, and pull request according to CCC's actual contribution guidance.

No external issue, message, fork, pull request, package publication, or deployment is created by this documentation pass. An upstream merge depends on maintainer review. A documented review disposition is distinct from a merge.

## Release limits

This direction is testnet-only. Mainnet use and an independent audit are outside the scoped work. The local candidate is unaudited and not suitable for assets of value.

Preserve the explicit disclosure: recipient identity linkage is the intended protection; amounts and sender inputs remain public. Releasing an application must not silently change its simulation banner into a testnet badge unless the actual integration and evidence justify that change.
