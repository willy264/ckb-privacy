# Opt-in CCC Stealth Package

The working package is `@ckb-ccc/stealth` in [`packages/stealth/`](../packages/stealth/README.md). It is a private local candidate for the CCC contribution, not a published or accepted official package.

The package boundary adds stealth-address capabilities within CCC's package model. It does not replace CCC's client, transaction, wallet connection, or signer responsibilities.

## Local functionality

| API area | Local capability | Limit |
|---|---|---|
| Meta-address codec | Encode/decode view and spend public keys with strict validation | Exact format/version agreement with upstream remains required |
| Sender derivation | Derive one-time destination and ephemeral public key using ECDH | Source compatibility is not deployed-lock validation |
| Payment recognition | Scan supplied records with a view key | Not a live chain/indexer scanner |
| Spend preparation | Verify local ownership and derive destination/change addresses | No live input or spending transaction; does not sign, broadcast, or prove lock acceptance |
| Fresh change | Derive a fresh destination | Final live transaction must preserve it through fee completion |
| Public fixtures | Deterministic demo identity and incoming records | Fixture secrets are public and must never protect funds |

The [package README](../packages/stealth/README.md) and exported TypeScript types define exact signatures. The frontend consumes the public entry point and labels chain-dependent actions **SIMULATED**.

## Application boundary

The application owns the CCC client, network choice, connected wallet, and user approval. In a real integration it supplies the relevant signer only when the operation needs authority. The package must not silently choose a wallet, submit a transaction, or treat a local recognition result as a chain confirmation.

View-key access enables recognition and can reveal the receiver's payment history. Spend-key access enables ownership derivation and is separately sensitive. Neither belongs in ordinary logs, screenshots, analytics, or public transaction metadata. The demo intentionally uses public fixture material, not user wallet secrets.

## Contribution boundary

The intended deliverable is a CCC-scoped package with tests, JSDoc, a changeset, and a reviewed upstream pull request. This local implementation does not claim a CCC fork, maintainer agreement, an issue, a pull request, a published release, or a merge. Follow [the contribution and release guide](deployment.md) before making those claims.

Amounts and sender inputs remain visible. See [limitations](known-limitations.md) before presenting any privacy claim.
