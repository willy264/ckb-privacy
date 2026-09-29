# Stealth Package Vector Contract

The current tests belong to [`packages/stealth/`](../packages/stealth/README.md). Prior cross-component vectors are preserved in [the archived record](archive/pre-incognito/test-vectors.md) and do not validate this direction.

## Required local coverage

| Boundary | Positive and negative cases |
|---|---|
| Meta-address codec | Canonical round trip; malformed lengths and non-curve keys rejected |
| Sender derivation | Fixed public fixture vectors; fresh ephemeral keys produce distinct one-time destinations |
| Recognition | Recipient view key recognizes its record; unrelated view key does not; malformed announcements rejected |
| Ownership | Derived one-time spend key matches the one-time public destination; mismatched ownership rejected |
| CCC draft | Intended lock and amount retained; draft has no invented input, signature, confirmation, or chain identifier |
| Fresh change | Fresh destination differs from the reusable identity and prior derivations |
| Privacy disclosure | Public amounts and sender inputs remain explicit |

Fixture keys are public test material. They must never be used to protect funds, described as user secrets, or mistaken for chain evidence. Import `createDemoIdentity`, `createFixturePayment`, and `deriveStealthPaymentForTest` from `@ckb-ccc/stealth/testing`; the main entry point exposes only fresh-random derivation. Package boundary checks must prevent these fixture helpers from leaking into the main public exports.

Use independently sourced known-answer vectors and deployed-lock integration tests before claiming interoperability. Self-consistent sender/receiver tests alone cannot detect a shared encoding or derivation mistake. The package's source provenance must identify the inspected upstream revision and byte-format assumptions.

The [test report](test-report.md) separates local checks from future testnet validation.
