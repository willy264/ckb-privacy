# CCC incognito-mode package prototype

`@ckb-ccc/stealth` is a private, local working name for the proposed opt-in CCC package. It is not a published official CCC package, an accepted upstream contribution, or a production wallet. The browser demo consumes this package directly and uses CCC's actual `Script`, `Address` and `Transaction` classes.

This package implements local stealth meta-address encoding/validation, sender ECDH derivation, view-only matching over supplied fixture outputs, one-time spend-key derivation, fresh change derivation, and unsigned CCC output construction. Network scanning, live cell selection, a lock-specific CCC signer, signature witnesses, fee completion, broadcasting and testnet settlement are not implemented here. `broadcastStealthTransaction()` explicitly fails closed.

Every demo payment is labelled `SIMULATED`. `createDemoIdentity()` deliberately returns public fixed keys and requires an explicit import from `@ckb-ccc/stealth/testing`. Never send assets to these addresses. View keys and spend keys in real applications require secure custody; this prototype has no wallet import, persistence, or custody feature.

## API

```ts
import {
  deriveStealthPayment,
  buildSendDraft, scanStealthPayments, prepareSpendDraft,
} from "@ckb-ccc/stealth";
import { createDemoIdentity, createFixturePayment } from "@ckb-ccc/stealth/testing";

const fixtureIdentity = createDemoIdentity(); // PUBLIC fixture keys
const payment = deriveStealthPayment(fixtureIdentity.metaAddress);
const draft = buildSendDraft(payment, "200"); // Actual CCC output, no inputs/signatures
const fixture = createFixturePayment(payment, "200"); // No invented outpoint/hash
const { matches } = scanStealthPayments(
  [fixture], fixtureIdentity.viewKey, fixtureIdentity.spendPublicKey,
);
const spend = prepareSpendDraft(matches[0], fixtureIdentity, fixtureIdentity.metaAddress);
// spend verifies authority locally and derives fresh destinations. No chain state changes.
```

Additional exports: `encodeStealthMetaAddress`, `decodeStealthMetaAddress`, `deriveFreshChange`, `parseCapacity`, `deriveSpendKey` (sensitive low-level helper), `StealthError`, `PRIVACY_DISCLOSURE`, and `TESTNET_STEALTH_LOCK`.

The root entry point also follows CCC's namespace convention: `import { ccc as stealth } from "@ckb-ccc/stealth"`. Its namespace contains the same reusable APIs as the named exports; it does not wrap or replace the application's `@ckb-ccc/core` client and signer.

`@ckb-ccc/stealth/testing` exposes only the deliberately public identity/record creators and `deriveStealthPaymentForTest(metaAddress, ephemeralPrivateKey)` for frozen vectors. `deriveStealthPayment(metaAddress)` at the root always generates a fresh random ephemeral scalar. Existing local callers of its former deterministic option must move that call to the testing entry point. The scanner and transaction draft APIs retain their explicit simulated-record limits; moving files does not add chain scanning, signing or settlement.

## Source layout

| Module | Responsibility |
| --- | --- |
| `src/index.ts`, `src/barrel.ts` | Explicit public named exports and CCC-style namespace |
| `src/meta-address.ts` | Existing raw meta-address codec and validation |
| `src/derivation.ts`, `src/change.ts` | Fresh one-time recipient and change derivation |
| `src/scan.ts`, `src/spend.ts` | View-key record matching and one-time spend authority |
| `src/transactions.ts`, `src/capacity.ts` | Unsigned CCC drafts, spend preparation, capacity checks and fail-closed broadcast |
| `src/types.ts`, `src/errors.ts`, `src/constants.ts`, `src/disclosure.ts` | Shared contracts, source-derived lock configuration and honest-scope disclosure |
| `src/internal/` | Shared curve, encoding, lock and derivation primitives; not package subpath exports |
| `src/testing/` | Explicit public fixture identities, simulated records and deterministic vectors |
| `test/` | Frozen independent vector, adversarial behavior and package-boundary checks |

| Capability | Implementation and limit |
| --- | --- |
| Meta-address | Existing raw 66-byte hexadecimal view/spend compressed public keys; validates both curve points; no checksum in the source format |
| Send derivation | Fresh CSPRNG ephemeral scalar; double SHA-256 over compressed secp256k1 ECDH; actual testnet address encoding |
| Scan | View key plus spend public key checks supplied fixture lock arguments; malformed records are rejected; no indexer/network calls or chain-completeness claim |
| Spend | Verifies the supplied keys actually authorize the one-time lock before deriving the secret; demo exposes only the resulting public key |
| Change | Independently generated ephemeral key; `prepareSpendDraft` verifies that the change meta-address belongs to the supplied view/spend keys |
| CCC handoff | Actual unsigned `Transaction.from` output; shows future `completeInputsByCapacity`, `completeFeeChangeToLock` (delegates to `completeFee`), then signer handoff |
| Capacity | Strict positive decimal CKB with up to eight fractional digits, u64 checked; 94 CKB minimum for this empty-data 53-byte-args lock |
| Privacy | Recipient identity is absent from the output lock; amounts, sender inputs, ephemeral key and transaction graph remain public. Public demo keys provide no secrecy. |

`deriveSpendKey` returns sensitive material and must never be logged or persisted casually. This package does not use a standard secp256k1 signer for stealth spends: the inspected lock authenticates a 65-byte recoverable signature over the **raw transaction hash**, which differs from standard CKB sighash witness processing. A reviewed lock-specific signer and verified cell dependencies are prerequisites to live use.

## Source provenance and compatibility limits

Implementation was independently authored after inspecting these primary sources on 2026-09-29; source files were not copied into this package:

- [Rust wallet stealth derivation, commit 1c842479](https://github.com/quake/obscell-wallet/blob/1c84247980b30dc91cad9a52d3d984c22f14f06a/src/domain/stealth.rs): existing ECDH and tweak semantics.
- [Browser-wallet stealth implementation, commit 36ac80e7](https://github.com/tianlitao/obscell-web/blob/36ac80e7f90351b9b7ddf8d1d7eaa673885d37ff/src/lib/stealth.ts): confirms the same double hash and 53-byte lock arguments.
- [Browser-wallet source configuration at that commit](https://github.com/tianlitao/obscell-web/blob/36ac80e7f90351b9b7ddf8d1d7eaa673885d37ff/src/lib/config.ts): source for testnet lock code hash `0x0dc965b5bfb6db2759275ad7d92ee502e10955cca789d001af03e3576cfe3f1c` and hash type `type`.
- [Inspected upstream stealth-lock implementation, commit 82437e9a](https://github.com/quake/obscell/blob/82437e9a8f4a141145a5a1b3454d348e464ee23f/contracts/stealth-lock/src/main.rs): 53-byte arguments (`ephemeral public key || one-time public-key hash`); the lock validates the last 20 bytes against `ckb-auth` with a 65-byte signature over `load_tx_hash()`.

The code hash matches the recorded local deployment recipe and inspected upstream configuration. This is a **source comparison**, not a live deployment or transaction verification. No real testnet lifecycle, cross-wallet runtime interoperability, upstream acceptance, or security review is claimed. The scope is receiver unlinkability, with amounts and sender inputs explicitly visible; timing/network/amount correlations remain possible.

## Validation

```sh
pnpm --filter @ckb-ccc/stealth test
```

Tests cover codec corruption/off-curve points, a frozen independently generated ECDH/lock vector, Node/OpenSSL verification of the resulting spend public key, wrong view/spend keys, mutated lock ownership, malformed scanning records, code-hash mismatch, fresh change, capacity precision/overflow, actual CCC draft serialization, fail-closed live broadcast, and the public/testing export boundary.

The vector's public keys and double-SHA-256 were computed using Node/OpenSSL; its CKB `blake160` was computed with `@nervosnetwork/ckb-sdk-utils` 0.109.5. The package itself uses Noble plus CCC, providing an independent vector-generation path. This is local algorithm validation, not CKB-VM execution. The deterministic helper in the testing entry point exists for reproducible tests only; reusing it in live payments would destroy one-time-address freshness.
