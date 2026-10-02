# CCC UI source and local adaptation

This demo contains a small local adaptation of the existing CCC application UI, with an experimental Incognito flow. It is not a fork of the complete CCC monorepo, a new upstream release, or an official CCC privacy feature.

## Pinned baseline

- Upstream: [ckb-devrel/ccc](https://github.com/ckb-devrel/ccc).
- Commit: [`3d11c1ed2be6764624ab2b70de2a485eb3a6c93b`](https://github.com/ckb-devrel/ccc/tree/3d11c1ed2be6764624ab2b70de2a485eb3a6c93b).
- Release tag: `@ckb-ccc/core@1.12.5`, whose annotated tag resolves to that commit.
- UI baseline: `packages/demo`, the CCC application at this release. The current upstream application has subsequently changed; this demo does not claim to reproduce the latest `packages/app` interface.

The existing workspace uses CCC core `1.12.5`. Pinning its corresponding application source keeps the comparison reproducible and avoids importing unrelated newer modules and a second application toolchain.

## Source mapping

| Local file | Upstream source at the pinned commit | Adaptation |
| --- | --- | --- |
| [CccDemoShell.tsx](src/ccc/CccDemoShell.tsx) | [`packages/demo/src/app/layoutProvider.tsx`](https://github.com/ckb-devrel/ccc/blob/3d11c1ed2be6764624ab2b70de2a485eb3a6c93b/packages/demo/src/app/layoutProvider.tsx) | Retains the ecosystem links, header/main/footer arrangement, white surfaces and testnet context. Next links become standard anchors. The real wallet provider, balance/address queries and network switch become an explicit demo account and static testnet-format indicator. The receiving address and Incognito toggle live in the child content. |
| [CccControls.tsx](src/ccc/CccControls.tsx) | [`Button.tsx`](https://github.com/ckb-devrel/ccc/blob/3d11c1ed2be6764624ab2b70de2a485eb3a6c93b/packages/demo/src/components/Button.tsx), [`Input.tsx`](https://github.com/ckb-devrel/ccc/blob/3d11c1ed2be6764624ab2b70de2a485eb3a6c93b/packages/demo/src/components/Input.tsx) | Preserves the pill button variants and underlined input/state API. Replaces utility classes with scoped CSS, removes unused polymorphic button behavior, associates labels with inputs and keeps component-only props off DOM elements. |
| [ccc.css](src/ccc/ccc.css) | Utility classes in the three files above, with the faint backdrop concept from [`Background.tsx`](https://github.com/ckb-devrel/ccc/blob/3d11c1ed2be6764624ab2b70de2a485eb3a6c93b/packages/demo/src/components/Background.tsx) | Translates the relevant styles to ordinary CSS. Uses a static logo backdrop instead of the animated layers. Adds responsive wrapping and visible focus treatment. |
| [logo.svg](src/ccc/logo.svg) | [`assets/logo.svg`](https://github.com/ckb-devrel/ccc/blob/3d11c1ed2be6764624ab2b70de2a485eb3a6c93b/assets/logo.svg) | Same graphic geometry, colors and gradient; strips editor metadata and unused IDs. Bundled locally so evidence capture does not depend on remote image requests. |

The upstream [Transfer page](https://github.com/ckb-devrel/ccc/blob/3d11c1ed2be6764624ab2b70de2a485eb3a6c93b/packages/demo/src/app/connected/%28tools%29/Transfer/page.tsx) was inspected for the address → amount → CCC output construction → input/fee completion → signer sequence. This adaptation keeps unsigned previews and labels the later stages as simulated; it does not execute the upstream signing or broadcast callbacks.

## Boundaries

The local Vite/React workspace remains the runtime. There is no additional Next.js, Tailwind, connector, wallet or routing dependency. Existing `packages/stealth` code handles the real local cryptographic operations; fixture-based application hooks supply the simulated payment/account state.

The normal and Incognito views both run without a connected wallet, chain indexing or RPC settlement. No private-key entry form, live balance, fake explorer transaction link or confirmation state is carried over from upstream. Unrelated CCC tools are not presented as functioning local modules.

## Attribution and license facts

CCC source and branding belong to the upstream CCC contributors. The pinned [`packages/core/package.json`](https://github.com/ckb-devrel/ccc/blob/3d11c1ed2be6764624ab2b70de2a485eb3a6c93b/packages/core/package.json) declares MIT for the core library. The inspected pinned tree contains no repository-wide license file, and its `packages/demo/package.json` has no separate license declaration. This document records those facts without inventing a copyright notice or extending the core package's declaration to all application assets. The source links and adaptation comments preserve provenance; upstream clarification of application/asset licensing remains a distribution consideration.

Incognito, `@ckb-ccc/stealth`, the comparison panel and fixture flows are local prototype work. Their presence here does not imply upstream acceptance, endorsement or production security.
