# CCC Stealth Testnet Acceptance Runbook

**Status: not executed for the incognito package.** The filename is retained for existing links. This procedure is for real testnet validation of the new CCC capability; local fixtures do not satisfy it.

## Preconditions

Record the exact package/app commit, tool versions, CCC version, CKB network/genesis, RPC/indexer endpoints, and independently verified Obscell stealth-lock deployment data. Use dedicated testnet-only signers and fresh recipient keys. Never publish secrets, wallet backups, or mnemonic phrases.

The existing local UI does not have a live scanner, deployed-lock signer, or broadcast path. Complete and validate those integrations before attempting this procedure.

## Required observations

| Step | Required real evidence |
|---|---|
| Derive | Published recipient meta-address; sender's fresh one-time destination and ephemeral public key; format and curve checks |
| Build | Decoded CCC draft, intended amount, verified lock/dependency, input/fee completion, final fresh-change output |
| Send | Actual submitted transaction hash, independently fetched chain transaction, network and inclusion evidence |
| Recognize | CCC/indexer discovery of that real output using the recipient's view key; nonmatching view key does not recognize it |
| Confirm | Canonical block identity and explicit confirmation policy; do not infer from elapsed time |
| Spend | Recipient authorizes the one-time cell through the correct lock signer and witness layout; actual accepted spending transaction |
| Reconcile | Spent input no longer reported spendable; rescanning avoids duplicates; reorganization behavior documented |
| Disclose | Amounts, sender inputs, ephemeral announcement, fees, and transaction graph correctly presented as public |

At every signing step, verify the actual final transaction rather than an earlier draft. In particular, check that fee completion did not introduce reusable change.

## Report format

Publish commands, commit, versions, sanitized deployment metadata, actual transaction hashes and explorer links, decoded output/lock details, and outcomes. Explain failed checks and missing coverage. A successful UI animation, a local signing calculation, or a deterministic fixture identifier is not settlement evidence.

The [evidence catalog](evidence/README.md) currently covers real captures of the simulated interface. Keep future testnet evidence in a separately labeled record so readers can tell it apart.
