> Historical snapshot of `docs/test-report.md`, superseded by the incognito direction on 2026-09-29. This record describes earlier work, not current deliverables, deployment status, or privacy guarantees. See [current documentation](../../README.md).

# Obscell Privacy Protocol Verification Report

**Runtime verification date:** 2026-09-10

**Proposal/documentation refinement and package validation:** 2026-09-12

**Scope:** Current dirty worktree: corrected-V1 foundation, protocol/SDK documentation, reference application, and local proposal package.

**Result:** Local tests and browser checks pass. Corrected-V1 settlement, real testnet validation, independent review, and mainnet deployment remain open.

## Documentation refinement — 2026-09-12

This pass changed the proposal, supporting documentation, SDK integration diagram and local packaging tool. Runtime code and screenshot evidence were unchanged, so application, contract and browser suites were not rerun. Their dated results remain below.

| Check | Result |
|---|---|
| Proposal source and budget validation | Passed: 13 DAO sections, eleven concrete workstreams, five milestone amounts/percentages, matching workstream names, and reconciled row/column totals |
| Figure and architecture validation | Passed: existing screenshot Figures 1–5 plus target-architecture Figure 6, with the unnumbered system overview retained; no sequence gaps or fictional chain evidence |
| Diagram visual review | Passed: SDK uses the CCC adapter; application-owned Client and operation-scoped Signer supply capabilities to that adapter; no Core-to-CCC implementation stack |
| Word fields and pagination | Passed: the rebuilt `Obscell_CKB_Community_DAO_Proposal_Protocol_Revision.docx` opened, refreshed TOC/fields, and repaginated to 22 pages, 12 tables and seven inline images |
| Final DOCX package validation | Passed after Word saved: black text/hyperlinks, white table cells, black borders, seven images byte-identical to their color sources, refreshed page total, field-update and no-compression settings |
| Evidence and local links | Passed: recorded screenshot hashes/byte counts remain valid; local links resolve; diagram and evidence indexes agree with Figure 6 |
| Consistency and whitespace | Passed: current grant terminology/duration, CCC ownership, reference-use scope and gated-mainnet fallback agree; historical prototype references retained; `git diff --check` passes |

The current DOCX contains two target architecture diagrams and five existing interface screenshots. Figure 5 remains the real developer-view screenshot; Figure 6 is the SDK integration diagram labeled “Target architecture — not deployment evidence.” Capture dates and historical image filenames were preserved.

The release fallback is a validated testnet release with documented remediation when mainnet gates remain unmet. If testnet validation itself is incomplete, only verified results and outstanding work may be reported; a validated-release claim is not permitted. This documentation update does not close any implementation or release gate.

## Environment and provenance

| Component | Version / provenance |
|---|---|
| OS | Windows 11, x64 |
| Node.js / PNPM | `25.8.1` / `10.32.1` |
| Rust | `rustc 1.96.0-nightly (362211dc2 2026-03-24)` |
| Cargo | `1.96.0-nightly (e84cb639e 2026-03-21)` |
| Circom / snarkjs | `2.2.3` / `0.7.6` |
| CCC core | `1.12.5` |
| Browser | Chrome `152.0.7977.83` |
| Local evidence base commit | `73d85a8f9b7330dbeb265dba281ff1bb3c218dcb`; working tree dirty |
| Current local capture | `2026-09-10T00:28:08.644Z` |
| Previous hosted-interface capture | `2026-09-10T00:06:15.112Z`; deployed source revision unknown |

The base commit identifies the checkout, not a committed or independently reproduced release. The [evidence catalog](../../evidence/pre-incognito-catalog.md) distinguishes the real historical hosted interface, current local simulations, and supplementary applicant-authored SDK fixture.

## Checks run on 2026-09-10

| Command / check | Result | Evidence boundary |
|---|---|---|
| `pnpm test` | Passed | SDK 24/24; backend V1 20/20; public-package consumer 1/1; corrected circuit public-order, witness, shared-vector and mutation checks |
| `pnpm test:contracts` | Passed | Seven locked RISC-V contract builds; codec 3/3 and contract/integration 45/45 tests; no failed tests |
| `pnpm build` | Passed | SDK, backend, supplementary consumer fixture and reference frontend production builds |
| `pnpm --filter frontend test:demo` | Passed | Production build; client invariants; ten browser interactions; capability/API honesty; no horizontal overflow at 1440, 1280 and 390 pixels; zero fetch/XHR privacy-operation requests |
| `pnpm --filter frontend capture:evidence` | Passed | Eight current PNGs refreshed and checked against the capture manifest; original and historical evidence preserved |
| `pnpm --filter obscell-payment-example test:browser` | Passed | Deterministic local fixture; desktop/mobile layout; zero data requests and zero transaction submissions |
| `node frontend/scripts/capture-hosted-reference.mjs` | Passed | Supplied public site returned HTTP 200; actual interface screenshot, metadata and hash saved; no wallet connection, interaction or transaction submission |
| Evidence validation | Passed | Current, hosted and archived image hashes and dimensions agree with their manifests; all five proposal figures have real media |
| Proposal build and source validation | Passed | All 13 DAO sections in order; five milestones; delivery duration, budget rows and milestone crosswalk reconcile; one main architecture diagram |
| Word field and pagination update | Passed | `Obscell_CKB_Community_DAO_Proposal_Protocol_Revision.docx` opened, updated its TOC/fields and repaginated to 21 pages, 12 tables and six inline images |
| Final DOCX package validation | Passed | Explicit black text/hyperlinks, white table cells and black borders; six embedded images byte-identical to their full-color sources; field refresh and image-compression prevention enabled; verified page total cached |
| Documentation and diff checks | Passed | Revised local Markdown links resolve; current figure references match the evidence catalog; `git diff --check` passes |

The September 10 DOCX contained one target architecture diagram and five genuine interface screenshots; its pagination and image counts above describe that earlier revision. Figure 5 is the local developer integration view, not Pudge transaction evidence. The older hosted interface's SpectraMix/Pudge labels and displayed claims are historical UI text, not independently verified protocol facts.

The previous `Updated.docx` file was locked by Word on September 10, so that build used the explicit `Protocol_Revision.docx` filename. The September 12 refinement regenerated the same reviewer-copy path successfully.

The prior frozen-lockfile installation and additional metadata/formatting checks are historical results, not reruns asserted by this revision. The pre-existing lockfile changes were preserved. Local tests were run without publishing, submitting transactions, committing or pushing.

## Earlier circuit measurement

The previously recorded disposable Groth16 sizing run compiled the corrected circuit at 19,220 constraints (7,497 nonlinear and 11,723 linear), generated a proof in 1,430.74 ms, and verified it with snarkjs in 15.70 ms. Process max RSS was 637,692 KiB; proof JSON was 722 bytes and the fixed Arkworks proof ABI is 256 bytes.

This measurement was not rerun for the documentation revision. Its insecure disposable power-15 setup was deleted and is not a deployable proving key. It was not a CKB-VM verifier measurement. See [the corrected circuit documentation](../../../circuits/v1/README.md).

## Diagnostics and limits

- Existing Vite warnings report browser `vm` externalization and large bundles. Production builds pass.
- Existing Rust dead-code warnings remain; contract builds and tests pass.
- ESLint is not installed/configured for the existing frontend/backend lint scripts; this report claims compilation and the checks above, not a clean lint run.
- Earlier repository-wide Rust formatting checks found legacy drift. No Rust implementation was edited in this revision.
- GitHub-hosted CI was not executed in this local revision.
- Word opened, repaginated and saved the editable DOCX. No PDF export is claimed; fixed-format export previously hung in this Office environment.

## Unmet release gates

- Pool genesis, acceptance and withdrawal still fail closed after structural checks until Poseidon append/empty-root logic, nullifier SMT updates, CT conservation, proof verification and action binding are connected.
- The staging-refund positive test is structural and uses an always-success placeholder asset type; it does not establish CT security.
- Rust codecs remain handwritten; independent Rust recomputation of all Poseidon/Merkle/action/proof vectors is incomplete.
- No secure V1 proving ceremony, deployable proof artifacts, CKB-VM verification measurement, or completed proof-system comparison is available.
- Non-fixture scanner/state-verification/storage/transaction/recovery adapters remain unfinished.
- Corrected-V1 Pudge staging, acceptance, withdrawal, recipient subsequent spend, competing coordinator, Redis rebuild and reorg runs have not occurred.
- Independent review, licensing/asset identity resolution, reproducible release artifacts and mainnet-specific preflight remain required.
- No corrected-V1 mainnet deployment has occurred.

The [deployment guide](deployment.md) defines the testnet, release and mainnet gates. Passing local checks supports the implemented foundation and interface claims only. Mainnet remains a gated grant target, with no unresolved critical or high findings permitted at release.

Historical documents under `progress/` and archived evidence remain project history, not current corrected-V1 settlement evidence.
