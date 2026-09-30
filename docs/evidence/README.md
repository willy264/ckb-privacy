# CCC incognito demo evidence

These are genuine screenshots of the running local CCC stealth-address demo. All funding, chain scanning, transaction completion, signing and settlement are **SIMULATED**. Local ECDH derivation, view-key matching and unsigned CCC output construction are real computations. No wallet is connected and no transaction is signed or submitted. Public fixture keys must never receive assets.

Amounts and sender inputs are **not hidden**. Receiver unlinkability and fresh change do not defeat timing, network, amount or transaction-graph correlation.

## Figure catalog

| Figure | File and meaning | Capture / generation time (UTC) | Source | Viewport → PNG pixels | SHA-256 |
|---|---|---|---|---|---|
| 1 | [Architecture](../diagrams/ccc-incognito-architecture.png) — authored target design, not deployment evidence | 2026-09-29T15:54:10.977Z | [SVG](../diagrams/ccc-incognito-architecture.svg) | 1600 × 1100 | `9547668d0073e3b065aed57dca0c2ca5ff8cf40c59855e22fd563c22585734f0` |
| 2 | [incognito-overview.png](incognito-overview.png) — Incognito toggle OFF: normal CCC send, scope banner and disclosure panel. SIMULATED target flow. | 2026-09-29T16:03:51.781Z | http://127.0.0.1:49933/ | 1440 × 1000 → 1440 × 1640 | `831ff44cae921ea87e8d2dcf737908cbe90ec24239d9e17e57512b9ced67636f` |
| 3 | [incognito-send.png](incognito-send.png) — Incognito ON: locally derived one-time address and ephemeral public key, actual unsigned CCC output, SIMULATED completion/signing and fresh change. | 2026-09-29T16:03:53.029Z | http://127.0.0.1:49933/ | 1440 × 1000 → 1440 × 1884 | `0beb342da8f7b8bebdf73fe993ffee5876d6a5f19035a915fd6f0751a0155e48` |
| 4 | [incognito-receive.png](incognito-receive.png) — View-key scan of two public local fixtures: one detected incoming payment, one nonmatching output, Spend simulation action. No chain scan. | 2026-09-29T16:03:54.020Z | http://127.0.0.1:49933/ | 1440 × 1000 → 1440 × 1640 | `6ad07c819f9b3d07941b9de95bf53de5731acff394de2305d78465d97dfc64eb` |
| 5 | [incognito-disclosure.png](incognito-disclosure.png) — Disclosure of recipient unlinkability limits: amounts, sender inputs, ephemeral key, timing/network exposure and fresh-change caveats. SIMULATED target flow. | 2026-09-29T16:03:54.945Z | http://127.0.0.1:49933/ | 1440 × 1000 → 1440 × 1319 | `b3bcd507025dd8e7081aa4ed95b441300a75f495b8bc3c17fba5ea6d3a4981a2` |

## Reproduce

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm diagram:export
pnpm capture:evidence
```

The [Playwright script](../../examples/incognito/scripts/capture-incognito-evidence.mjs) starts and closes its own Vite preview server. It uses real UI controls, checks malformed inputs, mode switching, fresh addresses, nonmatching scan keys, spend simulation and 390px layout. `pnpm test:demo` runs the browser assertions without replacing evidence. External/write requests are blocked and any attempt fails verification. Captures are taken at 1440 × 1000; full-page PNG heights vary. Nothing is injected into the UI or edited into the PNGs.

[Capture manifest](incognito-manifest.json) records the browser (chrome 153.0.8010.53), Playwright, Node, source URL, source/build fingerprints, base commit, dates, sizes and hashes. The base commit alone does not identify uncommitted source edits. Browser fonts and random one-time keys can change pixel hashes across runs. The dynamic localhost port is provenance, not a public service. [Diagram metadata](../diagrams/ccc-incognito-architecture.json) records authored artwork separately.

These artifacts establish interface behavior and local computations, not a verified deployment, live testnet lifecycle, audit, published package or accepted CCC contribution. Live lock-specific signing and indexer scanning remain pending. Funding terms are maintained in the local canonical proposal.

## Source relocation

The figures above were captured before the repository restructuring. Their original PNGs, dates, hashes, and JSON metadata are unchanged. Source paths beginning with `frontend/` in the capture manifest refer to the source at capture time, recorded in commit `099c6ad`; the active example and its capture tools now live in `examples/incognito/`. Package internals have also been reorganized since that capture. The old fingerprints must not be interpreted as hashes of the current source or build. The commands above create a new capture from the current checkout and preserve prior files under ignored `.local/history/captures/`. Earlier committed versions remain in Git history.

## Prior evidence

Earlier captures and their catalogs remain in [Git history](../history.md). They are outside the current review tree and are not figures for this proposal.
