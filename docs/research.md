# CCC Incognito Research and Reuse Record

The current direction is a narrow integration contribution: make existing stealth-address functionality reusable as an opt-in CCC package. The working name is `@ckb-ccc/stealth`. It does not introduce new on-chain machinery or a standalone wallet.

## Source attribution

The canonical proposal identifies these upstream projects as the basis for reuse:

| Source | Relationship |
|---|---|
| [CCC](https://github.com/ckb-devrel/ccc) | Client, transaction, wallet, signer, and scoped-package contribution model |
| [Obscell contracts](https://github.com/quake/obscell) | Existing stealth-lock implementation targeted for reuse; repository credits its originating contract work |
| [Obscell Rust wallet](https://github.com/quake/obscell-wallet) | Prior complete-wallet implementation and interoperability reference |
| [Obscell browser wallet](https://github.com/tianlitao/obscell-web) | TypeScript/browser implementation reference |

The package README records source-level derivation provenance and implementation limits. Credit and source inspection are not an independent security review or proof of testnet compatibility.

## Integration decision

One-time-address capabilities fit a CCC-scoped package. Applications keep their normal client, wallet approval, transaction completion, and submission path. The extension handles the additional destination encoding, ECDH derivation, view-key recognition, one-time ownership, and fresh-change concerns.

The current implementation validates local behavior first. It scans supplied records and constructs unsigned CCC drafts. Public deterministic fixtures make the demo reproducible, but are unsuitable for real funds.

## Questions that require live validation

- Which exact deployed lock binary and dependency are being reused, and do its argument and witness layouts match the package?
- Where does the sender place the ephemeral public key, and what indexer query discovers candidate outputs without disclosing a view key?
- How is the one-time spend authorization expressed through CCC's signer boundary?
- Does input/fee completion preserve the intended amount, recipient, capacity, and fresh-change output?
- How are stale cells, duplicate announcements, malformed records, scan checkpoints, and reorganizations handled?
- What API and packaging shape will CCC maintainers accept?

These are concrete acceptance questions, not claims already established by the UI.

## Privacy rationale

A different receiving address for each payment reduces linkage to the recipient's published identity. A fresh change destination reduces address reuse. Neither hides transfer amounts, sender inputs, fees, timing, or network metadata, and neither defeats all transaction-graph analysis.

The disclosure panel is part of the design because the privacy boundary must remain visible to the user.

## Historical research

Earlier alternatives, measurements, implementations, and progress reports remain in [Git history](history.md). Their measurements are not rerun or repurposed as evidence for the current package.
