# CCC Incognito integration evidence

These are genuine screenshots of the running local CCC application adaptation with an optional Incognito mode. The account, chain scanning, transaction completion, signing and settlement are **SIMULATED**. Local ECDH derivation, view-key matching against supplied fixtures and unsigned CCC output construction are real computations. No wallet is connected and no transaction is signed or submitted. Public fixture keys must never receive assets.

Normal mode displays a reusable receiving address. Incognito mode displays a public stealth receiving identity and demonstrates fresh one-time destinations, fixture recognition and a spend preview. The integration is a local prototype, not official upstream CCC functionality.

Amounts and sender inputs are **not hidden**. Outputs remain observable. Reducing direct recipient linkage and using fresh change do not defeat timing, network, amount or transaction-graph correlation. These images are **not deployment evidence**.

## Figure catalog

| Figure | File and meaning | Capture / generation time (UTC) | Source | Viewport → PNG pixels | SHA-256 |
|---|---|---|---|---|---|
| 1 | [Architecture](../diagrams/ccc-incognito-architecture.png) — authored target design, not deployment evidence | 2026-09-29T15:54:10.977Z | [SVG](../diagrams/ccc-incognito-architecture.svg) | 1600 × 1100 | `9547668d0073e3b065aed57dca0c2ca5ff8cf40c59855e22fd563c22585734f0` |
| 2 | [incognito-overview.png](incognito-overview.png) — Normal mode: adapted CCC demo shell, public demo account, reusable receiving address and normal send. SIMULATED account; no wallet connection. | 2026-10-02T14:25:06.525Z | http://127.0.0.1:65462/ | 1440 × 1000 → 1440 × 1554 | `2474c7cd4a89bd62cc61a0d0d278f8e19cf217e1e0912cea8b9007dca519faf8` |
| 3 | [incognito-enabled.png](incognito-enabled.png) — Incognito enabled inside the same CCC demo shell: a public stealth receiving identity replaces the reusable address. Prototype capability, not official upstream CCC functionality. | 2026-10-02T14:25:07.478Z | http://127.0.0.1:65462/ | 1440 × 1000 → 1440 × 1553 | `07452885d11bcc6c457defc0f042c6243c2ac43794d3802cdcb19be01013a757` |
| 4 | [incognito-identity.png](incognito-identity.png) — Stealth receiving identity and local fixture profile before scanning. The shared identity contains public keys; the demo accepts no private viewing key. | 2026-10-02T14:25:07.869Z | http://127.0.0.1:65462/ | 1440 × 1000 → 1440 × 1553 | `5d2e37fca959550d436f6686df50d150202af2934670871683131532e2edfa73` |
| 5 | [incognito-comparison.png](incognito-comparison.png) — Normal versus Incognito comparison within the same application: reusable receiving address versus public stealth identity and fresh one-time destinations. Amounts and sender inputs remain public. | 2026-10-02T14:25:08.210Z | http://127.0.0.1:65462/ | 1440 × 1000 → 1440 × 1933 | `0c537e804a5d4392b4b70893b92076334bbeaaa36e43a8b52c026f321c9e6dc4` |
| 6 | [incognito-send.png](incognito-send.png) — Incognito ON: locally derived one-time address and ephemeral public key, actual unsigned CCC output, SIMULATED completion/signing and fresh change. | 2026-10-02T14:25:09.158Z | http://127.0.0.1:65462/ | 1440 × 1000 → 1440 × 1837 | `35ed9c9d67f77f53aad8d24703f3feaa2aeb78e1357716dc8bb99e7f53ee9c38` |
| 7 | [incognito-receive.png](incognito-receive.png) — View-key scan of two public local fixtures: one detected incoming payment, one nonmatching output, Spend simulation action. No chain scan. | 2026-10-02T14:25:10.834Z | http://127.0.0.1:65462/ | 1440 × 1000 → 1440 × 1553 | `36bb84101cf41b9203d7a0dd4ff2adaa183b0cb27b1cd2c47fe69f890c175647` |
| 8 | [incognito-disclosure.png](incognito-disclosure.png) — Disclosure of reduced recipient linkage and its limits: amounts, sender inputs, visible outputs, ephemeral key, timing/network exposure and fresh-change caveats. SIMULATED target flow. | 2026-10-02T14:25:11.679Z | http://127.0.0.1:65462/ | 1440 × 1000 → 1440 × 1443 | `77cadc3e28414b0f1f4559f057285cb238fc5c01731ec8dc17bdcd6b52b6e6df` |

## Reproduce

```sh
pnpm install --frozen-lockfile
pnpm build
node examples/incognito/scripts/capture-incognito-evidence.mjs
```

The [Playwright script](../../examples/incognito/scripts/capture-incognito-evidence.mjs) starts and closes its own Vite preview server. It operates actual UI controls and verifies normal versus Incognito receiving, real clipboard copy, malformed recipient inputs, invalid amounts, fresh destinations, optional fresh change, matching and nonmatching fixture profiles, spend previews, demo account connection states and 390px layouts. Pending fixture scans must not restore stale results after profile changes, mode switches or reset. The viewing key is readonly; users choose public fixture profiles instead of entering private keys.

`--check` runs the same assertions without replacing evidence. External/write requests are blocked and any attempt fails verification. The browser receives local clipboard permissions to test copying without mocks. Captures use a 1440 × 1000 viewport; full-page PNG heights vary. No content is injected into the UI or edited into the PNGs.

[Capture manifest](incognito-manifest.json) records the browser (chrome 153.0.8010.53), Playwright, Node, source URL, source/build fingerprints, base commit, dates, sizes and hashes. The base commit alone does not identify uncommitted source edits. Browser fonts and fresh random one-time destinations can change pixel hashes across runs. The dynamic localhost port is provenance, not a public service. [Diagram metadata](../diagrams/ccc-incognito-architecture.json) records the existing authored target architecture separately; the capture command does not regenerate that diagram.

These artifacts establish interface behavior and local computations, not a verified deployment, live testnet lifecycle, audit, published package or accepted CCC contribution. Live lock-specific signing and indexer scanning remain pending.

## Prior evidence

Before replacement, the script copies the previous catalog, manifest and replaced screenshots into ignored `.local/history/captures/`. Committed earlier captures remain accessible through [Git history](../history.md); they describe their original interface states.
