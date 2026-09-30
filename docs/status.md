# CCC Incognito Implementation Status

**Current direction:** reviewed on 2026-09-29. The deliverable is an opt-in CCC package for one-time-address send, recognition, and spend, with an optional fresh-change helper.

| Item | Current state | Evidence boundary |
|---|---|---|
| Private package candidate | Local `packages/stealth/` implementation | Not a published or upstream-accepted CCC package |
| Meta-address handling and sender derivation | Local codec and ECDH implementation | Check package tests; deployed-lock compatibility still requires testnet validation |
| Incoming-payment recognition | Supplied-record scanning | Demo records are fixtures, not chain discovery |
| Spend and fresh-change preparation | Local unsigned preparation | No live stealth signature, broadcast, or confirmed spend |
| CCC transaction construction | Draft transaction object | No live input/fee completion or funded signer |
| Incognito application | `examples/incognito`: toggle, Send, Scan/Receive, change status, disclosure | Chain-dependent steps visibly SIMULATED |
| Workspace boundary | Only `packages/stealth` and `examples/incognito` are active members | Historical source is excluded from default install, builds, and CI |
| Screenshot evidence | Reproducible browser captures | Capture date and hashes in the evidence catalog; no deployment claim |
| Reused Obscell lock | Target dependency identified by the proposal | This demo does not independently verify the deployed binary or configuration |
| Real testnet send → scan → spend | Not demonstrated | Requires actual chain records and independently checked transactions |
| Upstream CCC contribution | Target, not claimed complete | No issue, fork state, pull request, review, or merge is asserted |
| Independent audit / mainnet | Outside the current scope | No security certification or mainnet readiness claim |

Use [validation](validation.md) for command-level evidence and [the package API](../packages/stealth/README.md) for the implementation boundary.

Earlier work is retained in [Git history](history.md). It is not a dependency or acceptance result for this direction. Interface hosting proves delivery of the interface, not that a stealth transaction has settled.
