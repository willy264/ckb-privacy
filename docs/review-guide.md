# Maintainer review guide

This repository proposes a bounded, opt-in `@ckb-ccc/stealth` package for CCC applications. The review target is its reusable address, recognition, and transaction boundary. The browser example exercises that boundary with public fixtures and visible simulation labels.

The package is private. No upstream acceptance, published package, completed independent security review, or real testnet send/scan/spend lifecycle is claimed. [Current status](status.md) records the implementation boundary; [source provenance](research.md) identifies the reused protocol references.

For the immediate UX review, start with the [CCC + Incognito demo guide](ccc-ui-demo.md) and [pinned CCC UI adaptation](../examples/incognito/CCC_UPSTREAM.md). The same local account supports normal receiving and opt-in stealth receiving. Review the toggle, identity sharing, Normal/Incognito comparison and visible disclosure before assessing the deeper API. This is a selective local UI fork; no public fork or official CCC integration is claimed.

## Suggested reading order

| Read | Review purpose |
| --- | --- |
| [Package README](../packages/stealth/README.md), [public exports](../packages/stealth/src/barrel.ts), [types](../packages/stealth/src/types.ts) | Decide whether the API belongs in CCC and whether its types distinguish local preparation from live operations. |
| [Meta-address codec](../packages/stealth/src/meta-address.ts), [curve operations](../packages/stealth/src/internal/curve.ts), [payment derivation](../packages/stealth/src/internal/derive-payment.ts), [lock encoding](../packages/stealth/src/internal/lock.ts) | Check compatibility with the source format, randomness, point/scalar validation, and lock arguments. |
| [Recognition](../packages/stealth/src/scan.ts), [spend-key derivation](../packages/stealth/src/spend.ts), [CCC drafts](../packages/stealth/src/transactions.ts) | Inspect ownership checks, supplied-record limits, secret exposure, and the missing signer/chain boundary. |
| [Package tests](../packages/stealth/test/stealth.test.mjs), [independent vector](../packages/stealth/test/vector.json), [validation record](validation.md) | Assess test independence, malformed-input coverage, and the limits of local evidence. |
| [Example entry point](../examples/incognito/src/App.tsx), [send state](../examples/incognito/src/hooks/useSendDemo.ts), [receive state](../examples/incognito/src/hooks/useReceiveDemo.ts) | Verify that a consumer uses package exports and labels simulated chain operations honestly. |

## What the implementation establishes

| Area | Implemented locally | Still needed for live use |
| --- | --- | --- |
| Destination | Validates the existing raw view/spend public-key meta-address; derives a fresh one-time lock and CCC address. | Confirm the agreed public encoding and interoperability with the exact target implementation. |
| Recognition | Matches supplied simulated output records using a view key and spend public key. | Candidate-output discovery, live cell state, checkpoints, and reorganization handling. |
| Spend authority | Checks ownership of the configured lock and derives its one-time spend key. | A reviewed lock-specific signer, valid witness construction, and real live inputs. |
| Transaction | Constructs an actual unsigned CCC output; validates amount and occupied capacity. | Resolve cell dependencies, complete inputs/fees, preserve fresh change, sign, and submit. |
| Evidence | Unit tests, browser checks, and reproducible interface screenshots. | Independently verifiable testnet transactions and review of the deployed script. |

The application retains its CCC client and signer. No replacement client or separate wallet is introduced. See [architecture](architecture.md) and [integration guidance](integration-guide.md) for the proposed handoff.

## Questions for CCC maintainers

- **Package boundary:** Should these helpers use the current named exports and CCC-style namespace? Which types and error conventions should match CCC before an upstream submission?
- **Secret handling:** Is a low-level `deriveSpendKey` export appropriate, or should one-time authorization be contained within a lock-specific signer? The current helper returns sensitive material; the demo displays only public values.
- **Script compatibility:** Which exact testnet script binary and cell dependency should be treated as authoritative? The current lock configuration is source-derived and has not been independently verified against a live deployment.
- **Witness signing:** How should CCC integrate the inspected lock's 65-byte recoverable signature over the raw transaction hash? This differs from standard CKB sighash witness processing, so a normal signer cannot be assumed sufficient.
- **Scanning boundary:** Where should candidate-output discovery and scan state live, and what record type should replace the current fixture-only input? The current helper makes no chain-completeness claim.
- **Transaction completion:** What acceptance tests should verify that input and fee completion retain the intended recipient, amount, occupied capacity, and fresh-change output?

These questions are review decisions and remaining integration work. The current demo does not claim to resolve them through a simulated handoff.

## Reproduce the review

From the repository root, with Node.js 24 and PNPM 10.32.1:

```sh
pnpm install --frozen-lockfile
pnpm --filter @ccc-incognito/demo exec playwright install chromium
pnpm typecheck
pnpm test
pnpm dev
```

`pnpm test:stealth` runs the focused package checks. `pnpm test:demo` builds and checks the browser example without replacing recorded evidence. The [evidence catalog](evidence/README.md) links the capture script, image hashes, dates, and limitations.

Amounts, sender inputs, fees, timing, and transaction relationships remain observable. Public fixtures provide no secrecy and must never receive funds. Read the [security notes](security.md) before assessing privacy or live-use claims.

## Historical context

Earlier implementations are preserved in Git history at commit `099c6ad`. They are outside the active workspace and this package's validation claims. The retained [evidence catalog](evidence/README.md) distinguishes dated captures from current runtime verification.
