# Incognito Direction: Implementation Report

**Revision scope:** organize the codebase around the opt-in CCC stealth-address package and its example application.

The current package boundary is `@ckb-ccc/stealth`: meta-address encoding, sender derivation, supplied-record recognition, local spend preparation, and fresh-change helpers. CCC continues to own transaction primitives and the application-selected client and signer flow.

## Active application

The application in `examples/incognito` presents the intended Incognito mode interaction: a toggle, ordinary or stealth send, a one-time destination and ephemeral public key, Scan/Receive with a labeled fixture payment, spend preparation, fresh-change status, and a disclosure panel. All chain-dependent behavior remains **SIMULATED**.

The visible handoff to CCC input completion, fee completion, and signing explains the target integration. It does not assert that those live steps ran. No invented transaction hashes, confirmations, or settlement evidence are permitted.

## Repository boundary

The root PNPM workspace includes only `packages/stealth` and `examples/incognito`. Default development, type checks, builds, browser verification, and hosting follow those paths. Package capabilities are split into modules; fixture generators and deterministic derivation are exported separately through `@ckb-ccc/stealth/testing`.

Historical documents remain in [the documentation archive](archive/pre-incognito/README.md). Earlier contracts, circuits, services, SDK, examples, and build tooling are preserved in [the source archive](../archive/obscell/README.md), with snapshot configuration for provenance. They are excluded from active workspace installation and CI. Dated `progress/` records retain their original historical context. Archived source is not relabeled as completed incognito functionality.

The working package name denotes a local private candidate. It does not establish publication, endorsement, an upstream issue or pull request, or acceptance into CCC.

## Evidence and remaining work

The capture script in `examples/incognito/scripts` exercises the real local UI and saves images with provenance and hashes in [the evidence catalog](evidence/README.md). Existing PNGs and metadata retain their original capture bytes and dates; old `frontend/` fingerprints identify the earlier layout. Captures demonstrate the rendered target flow only.

See [the test report](test-report.md) for executed checks, [status](status.md) for current capability boundaries, and [the testnet runbook](pudge-runbook.md) for the real send → scan → spend evidence still needed. Live chain discovery, deployed-lock signing, and testnet validation remain unfinished.
