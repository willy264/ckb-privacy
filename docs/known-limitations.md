# Current Limitations

This implementation demonstrates the CCC incognito direction locally. It has not completed a real testnet stealth lifecycle through CCC.

1. The working package `@ckb-ccc/stealth` is private and local. No publication, CCC endorsement, maintainer-approved boundary, upstream issue, pull request, or merge is established by this checkout.
2. The demo uses public fixture identities and records. They must never receive real funds. **SIMULATED** labels are part of the evidence and must remain visible.
3. Local derivation and byte-format inspection do not prove compatibility with the exact deployed Obscell lock. Its code hash, hash type, cell dependency, announcement format, witness format, and signature checks still require independent testnet verification.
4. Scanning operates on supplied records. Live indexer discovery, bounded rescanning, confirmation policy, reorganization recovery, and spent-cell reconciliation are not demonstrated.
5. CCC drafts are unsigned. Live input/fee completion, wallet approval, the stealth lock's signer integration, broadcasting, and recipient spending on-chain remain acceptance work.
6. A prepared spend does not mean a cell was consumed. The UI must not invent hashes, block heights, confirmations, explorer links, or settlement status.
7. Fresh addresses reduce address reuse. They do not hide amounts, inputs, output relationships, timing, network traffic, or recognizable change patterns.
8. View-key disclosure exposes recognizable payment history. Spend-key disclosure can expose spending authority. Loss of required secrets can prevent recovery.
9. The code has not received an independent audit. Mainnet use, assets of value, and guarantees of anonymity are outside the current scope.
10. Historical source, deployments, test results, and images are retained for provenance. They are not evidence that the new CCC package works on-chain.

See [status](status.md), [testnet acceptance](pudge-runbook.md), and [archived documentation](archive/pre-incognito/README.md).
