# Documentation

Start with the [maintainer review guide](review-guide.md). The runnable code is the private `@ckb-ccc/stealth` candidate and its [Incognito example](../examples/incognito/README.md).

| Document | What it answers |
|---|---|
| [Review guide](review-guide.md) | Where to read the code and which CCC integration decisions need feedback |
| [CCC + Incognito UI demo](ccc-ui-demo.md) | Normal versus Incognito behavior, simulated account, run instructions and live integration boundary |
| [Pinned CCC UI sources](../examples/incognito/CCC_UPSTREAM.md) | Which upstream shell and controls were adapted and what changed |
| [Architecture](architecture.md) | How the package, application, CCC client/signer, and reused lock relate |
| [Package API](../packages/stealth/README.md) | Exports, a runnable local example, formats, and module responsibilities |
| [Integration](integration-guide.md) | Send, recognition, spend, and transaction-completion boundaries |
| [Security](security.md) | Privacy limits, key handling, ownership checks, and pending signing verification |
| [Status](status.md) | Implemented behavior versus pending live integration |
| [Validation](validation.md) | Reproduction commands, executed checks, and evidence limits |
| [Research and attribution](research.md) | Reused sources and unresolved compatibility questions |
| [Evidence](evidence/README.md) | Normal mode, Incognito, identity, send, receive, comparison and disclosure captures, dates and hashes |
| [Architecture artwork](diagrams/README.md) | Current target diagram and its source |
| [History](history.md) | Earlier work retained outside the current review tree |

Local computations are real; chain-dependent demo steps remain **SIMULATED**. Amounts and sender inputs are public. Funding documents are local and excluded from this public documentation.
