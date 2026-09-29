# CCC Incognito Threat Model

## Protected property

Stealth addresses aim to obscure the relationship between a payment's one-time destination and the recipient's published identity. Fresh change avoids reusing an address. Neither hides transfer amounts or sender inputs.

The current application is a simulated demonstration. This document describes the target security boundary, not a security certification or an assertion that live integration is complete.

## Assets and authority

- A view key enables recognition and can reveal the recipient's payment history.
- A spend key and derived one-time signing material control spending authority.
- The application owns wallet choice, network selection, and user approval.
- CKB determines whether the actual transaction satisfies the reused lock and spends live cells.
- Indexer observations and UI state do not establish confirmation or authorization.

## Threats and mitigations

| Threat | Required response |
|---|---|
| Recipient substitution or malformed meta-address | Strict decoding, curve checks, explicit intended recipient/network review |
| Ephemeral-key reuse or poor randomness | Fresh secure randomness for real sends; deterministic values restricted to labeled fixtures |
| Wrong deployment or witness layout | Independently verify code, dependency, arguments, and signature format before live signing |
| View-key leakage | Keep scanning secrets local; exclude them from logs, telemetry, URLs, and public RPC parameters |
| Spending-secret leakage | Isolate signing material; never expose it through screenshots or routine UI state |
| Malicious or stale indexer | Validate candidate lock/metadata, canonical-chain context, spent status, and reorganization behavior |
| Fee completion changes recipient or change | Inspect final outputs and capacity after CCC completion, before approval |
| Compromised frontend or dependency | Reproducible source/build provenance and explicit transaction review; consensus cannot stop secret exfiltration |
| False privacy or settlement claims | Persistent disclosure, visible simulation labels, actual chain evidence for real confirmations |

## Residual privacy limits

Public amounts, sender inputs, output relationships, fees, timing, and network observations remain linkable. A fresh address alone does not defeat transaction-graph analysis. View-key compromise can expose past recognizable records, and spending-secret compromise can endanger funds.

The demo uses public fixture keys and records. It must not accept real value or display those fixtures as confirmed payments. Mainnet use and independent auditing are outside the current scope.

See [trust assumptions](security/trust-model.md), [implementation limits](known-limitations.md), and [future testnet acceptance](pudge-runbook.md).
