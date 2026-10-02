# Integrating Incognito Mode in a CCC Application

The target is one optional CCC capability: `@ckb-ccc/stealth`. This checkout contains a private candidate package and a simulated demonstration, not a production integration.

## Start locally

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
pnpm dev
```

The example lives in [`examples/incognito/`](../examples/incognito/README.md), with workspace name `@ccc-incognito/demo`. It imports reusable capabilities from `@ckb-ccc/stealth` and public fixtures from `@ckb-ccc/stealth/testing`; it does not import package source files or archived implementations. The demo defaults to an ordinary CCC send concept and offers an Incognito mode toggle. Turning it on changes the destination flow to a stealth meta-address; it does not hide the amount or sender inputs.

The [current UX integration](ccc-ui-demo.md) also applies the toggle to the account's copyable receiving identity and Receive view. It adapts pinned CCC shell/controls while keeping all account state simulated. Match and nonmatch viewing profiles replace private-key entry. Mode changes cancel outstanding fixture scans and invalidate old previews; fresh change is an optional send-preview setting.

## Send flow

1. Validate the recipient's meta-address and selected network. The meta-address carries public view and spend keys; it is not a transaction hash or a normal CKB address.
2. Derive a fresh one-time destination and ephemeral public key. Show which data will be public. Never reuse a sender ephemeral secret for unrelated sends.
3. Build a CCC transaction draft with the intended amount and destination. The local demo performs draft construction without real inputs or fees.
4. In a completed live integration, use the application's CCC signer for input completion, fee completion, wallet approval, signing, and submission. The proposed CCC handoff uses `completeInputsByCapacity` and `completeFeeChangeToLock` (which delegates to `completeFee`) to preserve the fresh-change lock. Verify that final outputs, dependencies, capacity, and fresh change still match the user's intent.
5. Display a transaction hash only after a real submission returns one. Determine confirmation from the canonical chain, not a timer or UI state.

The current demonstration labels the live handoff **SIMULATED** and does not perform steps requiring a funded signer.

## Scan and receive

Recognition accepts a view key and candidate records. The local demo supplies visibly simulated incoming records; a match means the local key recognizes a record, not that a real testnet cell is live or confirmed.

The live integration must discover candidates through the CCC client/indexer, validate their exact lock and metadata, track a scan cursor and canonical block identity, handle reorganizations, and refresh spent status. Do not send a view key to a public RPC provider merely to make discovery easier.

## Spend

Recognizing a payment is not permission to spend it. The recipient must control the spend secret and derive the corresponding one-time signing material. The demo checks local ownership and derives destination/change addresses. It does not construct a spending transaction with a live input or implement a deployed-lock signing ceremony.

A real spend needs the verified lock dependency, its exact witness layout and signature procedure, resolved live inputs, capacity/fee completion, user approval, submission, and chain confirmation. Unavailable live operations must remain unavailable rather than falling back to a generic signer that cannot authorize the lock.

## Fresh change and disclosure

Route change to a fresh derived destination and inspect the finalized transaction, because generic fee completion can otherwise introduce a reusable change address. A fresh address does not hide the change amount or links through the transaction graph.

Keep the disclosure panel visible: recipient linkage is the intended protection; **amounts and sender inputs are NOT hidden**. The [security notes](security.md) cover view-key disclosure, compromised interfaces, and correlation limits.

## Hosting and upstream preparation

`pnpm build` produces `examples/incognito/dist`, which the root Vercel configuration serves. This hosts the simulated interface; it does not deploy a chain script. No environment variables or wallet secrets are needed.

For the connected Vercel project, open **Settings → Build and Deployment** and use these settings:

| Setting | Value |
|---|---|
| Root Directory | Repository root; leave the field empty |
| Framework | Vite |
| Install Command | `npx --yes pnpm@10.32.1 install --frozen-lockfile` |
| Build Command | `npx --yes pnpm@10.32.1 build` |
| Output Directory | `examples/incognito/dist` |
| Node.js Version | 24.x |

The committed [`vercel.json`](../vercel.json) supplies the install, build, and output settings. Root Directory is a separate project setting: an older value of `frontend` points at a folder that the current workspace no longer uses. Clear that value, save, and deploy the current `main` revision. The setting takes effect on the next deployment; saving it does not repair an earlier deployment result. See [Vercel's Root Directory documentation](https://vercel.com/docs/builds/configure-a-build#root-directory).

If a deployment still fails, inspect its actual build log before changing package or workspace paths. With a local Vercel login, run `npx vercel inspect <deployment-id> --logs`, or open the deployment's Build Logs in the dashboard. Never commit account tokens or add wallet secrets to deploy this demonstration.

The contribution target is a CCC-scoped package. Agree its API and integration boundary with maintainers, verify the reused lock and witness format, then prepare the fork, tests, documentation, changeset, and upstream submission using CCC's contribution conventions. A local candidate, a submitted PR, and an accepted package are separate states. Mainnet use and a guaranteed merge are outside the current scope.
