# Incognito Direction: Implementation Report

**Revision scope:** align the active application and documentation with the proposal's opt-in CCC stealth-address package.

The current package boundary is `@ckb-ccc/stealth`: meta-address encoding, sender derivation, supplied-record recognition, local spend preparation, and fresh-change helpers. CCC continues to own transaction primitives and the application-selected client and signer flow.

## Active application

The frontend now presents the intended Incognito mode interaction: a toggle, ordinary or stealth send, a one-time destination and ephemeral public key, Scan/Receive with a labeled fixture payment, spend preparation, fresh-change status, and a disclosure panel. All chain-dependent behavior remains **SIMULATED**.

The visible handoff to CCC input completion, fee completion, and signing explains the target integration. It does not assert that those live steps ran. No invented transaction hashes, confirmations, or settlement evidence are permitted.

## Repository boundary

Active documentation describes this direction and links the new package. Historical documents were copied to [the archive](archive/pre-incognito/README.md) before being replaced. Their original findings and limitations remain available. Earlier contract, circuit, service, and example source are retained for research provenance, not relabeled as completed incognito functionality.

The working package name denotes a local private candidate. It does not establish publication, endorsement, an upstream issue or pull request, or acceptance into CCC.

## Evidence and remaining work

The capture script exercises the real local UI and saves images with provenance and hashes in [the evidence catalog](evidence/README.md). Captures demonstrate the rendered target flow only.

See [the test report](test-report.md) for executed checks, [status](status.md) for current capability boundaries, and [the testnet runbook](pudge-runbook.md) for the real send → scan → spend evidence still needed. Live chain discovery, deployed-lock signing, and testnet validation remain unfinished.
