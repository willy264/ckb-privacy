# Incognito Attack Surface

| Boundary | Risk | Required validation |
|---|---|---|
| Meta-address entry | Substitution, malformed encoding, invalid points | Canonical decode, curve checks, intended-recipient review |
| Derivation | Reused or weak ephemeral secret, incompatible hashing | Secure randomness, vectors, source and deployed-lock compatibility |
| Candidate records | Malformed announcements, false positives, repeated or stale records | Strict parsing, ownership checks, deduplication, live-cell refresh |
| Scan infrastructure | Omitted history, privacy leakage, reorganizations | Local view-key use, bounded replay, canonical block/checkpoint policy |
| Draft completion | Changed destination, capacity mismatch, reused change | Inspect final transaction after CCC input/fee completion |
| Spend signer | Wrong witness, exposed derived keys, wrong network | Exact lock signing format, isolated approval, verified deployment |
| Web delivery | Malicious assets, dependencies, misleading labels | Reproducible builds, disclosure, explicit simulation/chain boundaries |
| Public evidence | Fake confirmations or exposed secrets | Actual browser captures, provenance/hashes, sanitized independently checked chain records |

These controls are acceptance requirements, not a claim that the local demo already implements a live chain service or audited signer. The [current limitations](../known-limitations.md) identify the boundary.
