# CCC Incognito Mode

An opt-in stealth-address capability for CCC applications, with the working package name `@ckb-ccc/stealth`. A CCC application can demonstrate a normal send or an incognito send, derive a one-time receiving address, scan supplied payment records, and prepare a local spending plan while keeping CCC's transaction and signer flow.

The intended contribution belongs in the CCC monorepo. The local package is a private implementation candidate for that upstream path; its name does not claim publication, CCC endorsement, an opened upstream pull request, or a merge.

**Privacy scope:** one-time addresses aim to hide the link to the recipient's published identity. Amounts and sender inputs remain public. Timing, network, and amount correlation remain possible. Fresh change avoids reusing an address but does not hide the change amount or transaction graph.

## What runs today

`frontend/` is a clearly labeled **SIMULATED** demonstration. It derives addresses locally and builds a CCC send draft, but does not connect a funded wallet, call a live chain scanner, sign, broadcast, or display invented settlement data. Incoming payments are explicitly marked fixtures. Spend preparation checks local authority and derives destination/change addresses; it does not construct a spendable transaction input.

`packages/stealth/` contains the new package candidate: strict meta-address encoding, ECDH one-time-address derivation, supplied-record detection, local spend preparation, and fresh-change helpers. See [package documentation](packages/stealth/README.md) for the precise API and limits.

The target reuses the existing [Obscell stealth lock](https://github.com/quake/obscell), with credit to its contract and wallet authors. This repository's local demo does not independently establish that deployment or demonstrate a CCC testnet send → scan → spend. Compatibility with the exact deployed lock, live scanning, signing, and testnet evidence remain validation work. See [current status](docs/status.md).

## Run and verify

Use the Node and PNPM versions recorded by the repository configuration.

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm dev
```

The browser opens a CCC application concept with an Incognito mode toggle, Send and Scan/Receive views, fresh-change status, and an always-readable disclosure panel. All simulated steps must remain labeled during screenshots and demos.

```sh
pnpm --filter frontend test:demo
pnpm --filter frontend capture:evidence
```

The [evidence catalog](docs/evidence/README.md) records screenshot sources, capture dates, dimensions, and hashes. Interface images are evidence of the interface only.

## Repository map

| Path | Role |
|---|---|
| [`packages/stealth/`](packages/stealth/README.md) | Opt-in CCC package candidate |
| `frontend/` | Incognito demonstration and reproducible browser capture |
| [`docs/`](docs/README.md) | Current scope, design, integration, security, and validation |
| [`docs/archive/pre-incognito/`](docs/archive/pre-incognito/README.md) | Preserved documentation for superseded designs |
| `contracts/`, `circuits/`, `mixer-sdk/`, `backend/`, `tests/` | Historical research implementations, not current incognito dependencies or deliverables |
| [`examples/payment-app/`](examples/payment-app/README.md), `legacy-demo/`, `progress/` | Earlier fixtures, prototypes, and dated research history |

The historical repository URL retains its original name. Historical code and test results do not establish correctness of the new package. Existing script deployment helpers must not be used as incognito deployment instructions.

## Scope and next acceptance steps

The bounded goal is stealth send, view-key scan, spend through CCC, and optional fresh change, followed by a real testnet demonstration and an upstream contribution with documented review disposition. It does not include hidden amounts, a separate wallet product, new on-chain machinery, mainnet use, or a guaranteed upstream merge.

Next acceptance steps are to agree the upstream boundary, confirm the exact reused testnet script and scanning format, complete live CCC integration, and publish independently verifiable testnet transactions. [Deployment and contribution guidance](docs/deployment.md) describes those gates without claiming they have passed.

Grant proposals and funding details remain local and ignored. This is unaudited experimental software; do not use the demo or fixture keys for assets of value.
