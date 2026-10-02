# CCC Incognito Implementation Status

**Current direction:** updated on 2026-10-02. The immediate deliverable is a visual CCC + Incognito proof of concept, reusing the existing package for one-time-address derivation, local recognition and spend preparation. It compares the normal and Incognito experiences without implementing chain-dependent operations.

| Item | Current state | Evidence boundary |
|---|---|---|
| Private package candidate | Local `packages/stealth/` implementation | Not a published or upstream-accepted CCC package |
| Meta-address handling and sender derivation | Local codec and ECDH implementation | Check package tests; deployed-lock compatibility still requires testnet validation |
| Incoming-payment recognition | Supplied-record scanning | Demo records are fixtures, not chain discovery |
| Spend and fresh-change preparation | Local unsigned preparation | No live stealth signature, broadcast, or confirmed spend |
| CCC transaction construction | Draft transaction object | No live input/fee completion or funded signer |
| CCC UI adaptation | Shell, ecosystem navigation, pill controls and amount input adapted from pinned CCC core 1.12.5 demo sources | Selective local UI fork; no full monorepo fork, real wallet provider or latest-upstream UI parity claimed |
| Incognito application | Shared toggle for Send/Receive, copyable normal/stealth identity, fixture account, comparison, optional fresh change and disclosure | Account and chain-dependent steps visibly SIMULATED; no editable private-key fields |
| Workspace boundary | Only `packages/stealth` and `examples/incognito` are active members | Historical source is excluded from default install, builds, and CI |
| Screenshot evidence | Reproducible browser captures | Capture date and hashes in the evidence catalog; no deployment claim |
| Reused Obscell lock | Existing target dependency | This demo does not independently verify the deployed binary or configuration |
| Real testnet send → scan → spend | Not demonstrated | Requires actual chain records and independently checked transactions |
| Upstream CCC contribution | Local UI source adaptation and private package candidate available | No published fork, upstream issue/PR, acceptance or merge is asserted |
| Independent audit / mainnet | Outside the current scope | No security certification or mainnet readiness claim |

Use [validation](validation.md) for command-level evidence and [the package API](../packages/stealth/README.md) for the implementation boundary.

Earlier work is retained in [Git history](history.md). It is not a dependency or acceptance result for this direction. Interface hosting proves delivery of the interface, not that a stealth transaction has settled.
