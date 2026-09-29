# Stealth Integration Invariants

These are integration requirements for the existing lock, not a new on-chain specification.

1. A meta-address contains canonical valid public keys. Invalid lengths, encodings, points, and scalar inputs must fail explicitly.
2. Each real send uses fresh secure ephemeral randomness. Public deterministic fixture material remains labeled and cannot be presented as secret.
3. The recognized one-time destination and derived ownership key must agree with the exact reused lock format.
4. A view key alone does not authorize spending. Recognition and spending authority remain distinct.
5. The final signed transaction preserves the intended recipient, amount, network, lock dependency, and fresh-change destination after CCC input and fee completion.
6. Scanned records do not become confirmed or spendable solely because the UI recognizes them. Canonical-chain and live-cell checks are required.
7. Amounts and sender inputs are never described as hidden. Fresh change is never described as complete transaction unlinkability.
8. Simulated steps remain visibly labeled. Hashes, confirmations, block heights, and explorer evidence are displayed only when obtained from real verified chain activity.
9. Secrets are excluded from public evidence, logs, telemetry, and ordinary transaction metadata. Public fixture secrets are explicitly identified as such.
10. Package publication, upstream review, and deployment claims require their own independently checkable records.
