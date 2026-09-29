# CCC incognito architecture

[View the architecture PNG](ccc-incognito-architecture.png) · [Editable SVG](ccc-incognito-architecture.svg) · [Generation metadata and hashes](ccc-incognito-architecture.json)

Figure 1 shows the proposed `@ckb-ccc/stealth` contribution within CCC. An application opts into stealth send, scan and spend while CCC continues to provide its client, wallet, transaction and signer facilities. The on-chain target is the existing Obscell stealth lock on testnet. The diagram is **target architecture — not deployment evidence** and does not claim upstream acceptance.

Receiver unlinkability is the goal; amounts and sender inputs remain public. Fresh change avoids address reuse, but does not eliminate transaction-graph, timing, network or amount correlation.

Regenerate the 1600 × 1100 white-background export from the repository root:

```sh
node frontend/scripts/export-incognito-architecture.mjs
```

The command records generation time, source/PNG SHA-256, browser and dimensions. Browser/font changes may change pixels. Real application figures appear in the [evidence catalog](../evidence/README.md).

The [historical architecture catalog](pre-incognito-catalog.md) preserves earlier diagrams and their meaning. They are excluded from the current proposal. User-supplied artwork is retained separately; the reviewed Figure 1 source is `ccc-incognito-architecture.svg`.
