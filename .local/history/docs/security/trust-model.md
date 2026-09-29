# Incognito Trust Model

The application controls its CCC client, network, wallet, and operation approval. The optional stealth package supplies address and ownership helpers; it must not silently take over those choices.

CKB consensus and the exact reused stealth-lock binary decide whether a real transaction is accepted. Source-level derivation or an unsigned draft is not sufficient evidence of authorization.

A client/indexer can omit records, lag, return malformed data, or show stale cells. Its observations must be checked against canonical-chain context and live-cell status before spending. A recognized fixture remains a fixture.

The receiver's view key is trusted for local recognition and must remain confidential if payment history is to remain private. Spending secrets are separately sensitive and must not be entrusted to public services or frontend telemetry. Public demo keys intentionally provide no secrecy.

The web host delivers code and can compromise the user environment; it has no consensus authority. Wallet approval must reflect the actual final transaction. Amounts, sender inputs, fees, and the transaction graph are public even when one-time addresses are used.
