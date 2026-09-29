# Historical Obscell source archive

This directory preserves the earlier project implementation as historical source. It is outside the active CCC Incognito workspace, dependency installation, build, and CI. These files do not provide current incognito functionality or evidence of live stealth integration.

The archive was relocated from the tracked tree at commit `099c6ad` on 2026-09-29. Source and historical artifacts retain their bytes; this index explains their new location. Files ignored by Git, private local environment configuration, external checkouts, caches, and local funding documents are not part of the migration.

## Layout

| Archived path | Original role |
|---|---|
| `mixer-sdk/` | Earlier standalone privacy SDK and legacy compatibility exports |
| `backend/` | Historical coordinator, relayer, deposit services, and deployment helpers |
| `contracts/`, `schemas/`, `tests/` | Previous CKB scripts, schemas, contract tests, and fixtures |
| `circuits/` | Previous circuits, proving artifacts, and vector tests |
| `tools/`, `scripts/`, `.cargo/`, Rust and Docker files | Earlier build and deployment tooling |
| `frontend/` | Previous UI source, proof assets, styling configuration, and evidence tooling |
| `examples/payment-app/` | Earlier deterministic SDK consumer fixture |
| `legacy-demo/` | Historical artifact inventory and prototype description |
| `.github/workflows/` | Previous manual workflow, no longer an active GitHub Actions workflow |
| `root-package.snapshot.json`, `pnpm-workspace.snapshot.yaml`, `pnpm-lock.snapshot.yaml` | Root configuration preserved for provenance, not a runnable nested workspace |

The former `frontend/archive/previous-app/src/` is now `frontend/src/` here. The current example moved separately from `frontend/` to `examples/incognito/` at the repository root. The active package remains `packages/stealth/`.

Historical [documentation](../../docs/archive/pre-incognito/README.md), [evidence](../../docs/evidence/pre-incognito-catalog.md), and dated [progress](../../progress/README.md) retain their original context and recorded claims. Paths inside those records describe the layout at their writing or capture date. They are not current run instructions.

## Reproduction boundary

This is a source archive, not a supported nested application. Original relative relationships among the SDK, services, circuits, contracts, and fixtures are retained, but the old root workspace and deployment environment are no longer active. Snapshot configuration deliberately uses non-executable names. Do not rename it over the active workspace or run archived deployment helpers against current configuration.

For historical investigation, create a separate checkout of the original revision. Commit `099c6ad` records the first incognito pivot; its parent records the preceding implementation before the old UI was archived:

```sh
git worktree add --detach ../obscell-before-incognito "099c6ad^"
```

Inspect that checkout's original instructions and limitations before attempting a historical build. A checkout does not supply ignored proving artifacts, local runtime secrets, external source repositories, or previously deployed cells. Historical scripts can sign or submit transactions when configured; they are not part of current demo verification.

The current entry point is the [CCC Incognito README](../../README.md), with [contribution guidance](../../CONTRIBUTING.md) and [current validation](../../docs/test-report.md).
