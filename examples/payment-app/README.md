# Obscell Privacy Protocol SDK boundary fixture

This is an applicant-authored local fixture for the public `mixer-sdk` package entry point. It demonstrates the application boundary around `PrivacyClient` without importing SDK internals or reusing the frontend's `DemoPrivacyClient`. It is not a second Obscell product, the grant's reference application, a promised live integration, or evidence of third-party adoption.

The project relationship is Application -> Privacy SDK -> Privacy Core / CKB scripts, with application-owned CCC Client and operation-scoped Signer capabilities injected through the SDK adapter. Privacy Protocol defines validity rules and Privacy Core implements them; this fixture checks consumption of their SDK interface. The reference application in `frontend/` remains the first controlled SDK consumer, not a separately funded wallet product. Its fixed-denomination pool is the initial validation use case, not the project's architectural boundary. The historical `payment-app` directory and `obscell-payment-example` workspace names remain for compatibility and do not promise private payment support.

The browser preview is intentionally deterministic and local. It injects its own CCC-shaped client, transient state store, indexer observation adapter, and state-verifier adapter. It performs no network request, signing, proof generation, or transaction submission and is not evidence of a Pudge deployment.

Run it from the repository root:

```sh
pnpm test:consumer
pnpm dev:consumer
pnpm --filter obscell-payment-example test:browser
```

The browser verifier checks the rendered desktop and mobile layouts, asserts that the fixture makes no `fetch`/XHR request, and records zero transaction submissions. `pnpm --filter obscell-payment-example capture:evidence` writes the SDK-boundary fixture screenshot listed in [the evidence catalog](../../docs/evidence/README.md).

A future non-fixture consumer would need to replace every fixture dependency in `src/fixture.ts` with a real application-owned CCC `Client`, an encrypted-at-rest store, a chain indexer, and an independently validating CKB state verifier. That is not demonstrated here. Live shield and unshield remain unavailable in the corrected V1 SDK foundation.
