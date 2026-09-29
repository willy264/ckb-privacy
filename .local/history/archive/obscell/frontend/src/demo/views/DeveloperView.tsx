import { ArrowDown, ArrowLeft, Box, Code2, KeyRound, Layers, Network, ShieldCheck, Wallet } from "lucide-react";

interface DeveloperViewProps {
  onOpenApplication: () => void;
}

const SDK_API = `// Existing public SDK API; dependencies supplied by the host.
// Use verified fixture services for local testing.
import { createPrivacyClient } from "mixer-sdk";

const privacy = createPrivacyClient({
  client,      // application-owned CCC Client
  deployment,  // validated V1 configuration
  stateStore,  // injected private note storage
  services,    // indexer + authoritative state verifier
});

const capabilities = await privacy.getCapabilities();

if (capabilities.sync === "supported") {
  const snapshot = await privacy.sync({ poolId });
  const notes = await privacy.listNotes({ poolId });
  const balance = await privacy.getPrivateBalance({ poolId });
}

// shield(), refund() and unshield() exist as API boundaries.
// They currently throw UnsupportedOperationError.
// Production prover and state-service adapters remain grant work.`;

export function DeveloperView({ onOpenApplication }: DeveloperViewProps) {
  return (
    <section className="demo-developer-view" aria-labelledby="demo-developer-title">
      <header className="demo-view-header">
        <div className="demo-view-heading">
          <span className="demo-eyebrow">Developer integration</span>
          <h1 id="demo-developer-title" className="demo-view-title">Use the protocol through the Privacy SDK</h1>
          <p className="demo-view-summary">
            The SDK is the developer interface to the Privacy Core: the reusable protocol rules,
            cryptographic machinery and CKB implementation. The application owns its CCC client and signer.
          </p>
        </div>
        <button className="demo-back-button" type="button" onClick={onOpenApplication}>
          <ArrowLeft className="demo-button-icon" aria-hidden="true" /> Application view
        </button>
      </header>

      <aside className="demo-prototype-notice" aria-label="SDK foundation status">
        <Box className="demo-notice-icon" aria-hidden="true" />
        <div className="demo-notice-copy">
          <strong className="demo-notice-title">Existing foundation API · local validation</strong>
          <p className="demo-notice-text">
            State sync and balance inspection work with injected verification services. Production
            adapters remain incomplete. Live shield, refund, unshield, proof generation and transaction
            construction are unavailable; corrected-V1 scripts are not deployed. This application's
            operation controls use a separate deterministic simulation client.
          </p>
        </div>
      </aside>

      <div className="demo-developer-layout">
        <section className="demo-code-section" aria-labelledby="demo-code-title">
          <div className="demo-section-heading">
            <Code2 className="demo-section-icon" aria-hidden="true" />
            <div className="demo-section-heading-copy">
              <h2 id="demo-code-title" className="demo-section-title">Existing public API</h2>
              <p className="demo-section-description">
                Framework-agnostic integration shape using current exported methods. Host dependencies
                must be configured before this example can run.
              </p>
            </div>
          </div>
          <figure className="demo-code-editor">
            <figcaption className="demo-code-caption">
              <span className="demo-code-filename">privacy.ts · mixer-sdk</span>
              <span className="demo-code-status">Foundation API</span>
            </figcaption>
            <pre className="demo-code-block" tabIndex={0} aria-label="Existing PrivacyClient API integration example">
              <code className="demo-code-content">{SDK_API}</code>
            </pre>
          </figure>
        </section>

        <section className="demo-responsibility-section" aria-labelledby="demo-responsibility-title">
          <div className="demo-section-heading">
            <Layers className="demo-section-icon" aria-hidden="true" />
            <div className="demo-section-heading-copy">
              <h2 id="demo-responsibility-title" className="demo-section-title">Integration responsibilities</h2>
              <p className="demo-section-description">CCC supplies the CKB transaction and signing boundary.</p>
            </div>
          </div>
          <div className="demo-responsibility-columns">
            <article className="demo-responsibility-column">
              <div className="demo-responsibility-heading">
                <Wallet className="demo-responsibility-icon" aria-hidden="true" />
                <h3 className="demo-responsibility-title">Application + CCC</h3>
              </div>
              <ul className="demo-responsibility-list">
                <li className="demo-responsibility-item">Wallet connection and user approval</li>
                <li className="demo-responsibility-item">Injected CCC Client and Signer</li>
                <li className="demo-responsibility-item">CKB transaction, RPC and submission primitives</li>
                <li className="demo-responsibility-item">No raw private keys passed to the SDK</li>
              </ul>
            </article>
            <article className="demo-responsibility-column">
              <div className="demo-responsibility-heading">
                <ShieldCheck className="demo-responsibility-icon" aria-hidden="true" />
                <h3 className="demo-responsibility-title">Privacy Core + SDK</h3>
              </div>
              <ul className="demo-responsibility-list">
                <li className="demo-responsibility-item">Protocol configuration and state validation</li>
                <li className="demo-responsibility-item">Note metadata and verified balance inspection</li>
                <li className="demo-responsibility-item">Target: proof and privacy-operation construction</li>
                <li className="demo-responsibility-item">Target: protocol enforcement through CKB scripts</li>
              </ul>
            </article>
          </div>
          <p className="demo-integration-note">
            The existing <code>examples/payment-app</code> fixture independently imports the public
            SDK to validate sync and balance handling. Its payment-themed screen demonstrates a
            package boundary; payment settlement is unavailable. The main reference application
            remains this protocol demo.
          </p>
        </section>
      </div>

      <section className="demo-capability-section" aria-labelledby="demo-capability-title">
        <div className="demo-section-heading">
          <KeyRound className="demo-section-icon" aria-hidden="true" />
          <div className="demo-section-heading-copy">
            <h2 id="demo-capability-title" className="demo-section-title">Current SDK capabilities</h2>
            <p className="demo-section-description">Read capabilities before presenting an operation as available.</p>
          </div>
        </div>
        <dl className="demo-capability-grid">
          <div className="demo-capability-item">
            <dt className="demo-capability-name">Configuration and capability discovery</dt>
            <dd className="demo-capability-value">Implemented in the foundation</dd>
          </div>
          <div className="demo-capability-item">
            <dt className="demo-capability-name">Authoritative state sync</dt>
            <dd className="demo-capability-value">Requires injected indexer + state verifier; locally tested with fixtures</dd>
          </div>
          <div className="demo-capability-item">
            <dt className="demo-capability-name">Notes and private balance</dt>
            <dd className="demo-capability-value">Available from stored, verified state; production adapters remain incomplete</dd>
          </div>
          <div className="demo-capability-item">
            <dt className="demo-capability-name">Shield, refund and unshield</dt>
            <dd className="demo-capability-value">Unavailable · grant-funded V1 implementation</dd>
          </div>
          <div className="demo-capability-item">
            <dt className="demo-capability-name">Proofs and transaction construction</dt>
            <dd className="demo-capability-value">Unavailable · grant-funded integration</dd>
          </div>
          <div className="demo-capability-item">
            <dt className="demo-capability-name">Private transfers and payments</dt>
            <dd className="demo-capability-value">Future application examples; outside this V1 scope</dd>
          </div>
        </dl>
      </section>

      <section className="demo-architecture-section" aria-labelledby="demo-architecture-title">
        <div className="demo-section-heading">
          <Network className="demo-section-icon" aria-hidden="true" />
          <div className="demo-section-heading-copy">
            <h2 id="demo-architecture-title" className="demo-section-title">Protocol and integration architecture</h2>
            <p className="demo-section-description">
              Target settlement architecture. The Privacy Core is the protocol implementation;
              CCC is the application's CKB integration layer.
            </p>
          </div>
        </div>
        <div className="demo-protocol-architecture" aria-label="Application through SDK and privacy core, with CCC side integration, to CKB">
          <div className="demo-stack-node"><Code2 aria-hidden="true" /><strong>CKB application / reference demo</strong><span>First SDK use case</span></div>
          <ArrowDown className="demo-stack-arrow" aria-hidden="true" />
          <div className="demo-stack-node"><Layers aria-hidden="true" /><strong>Privacy SDK</strong><span>Developer interface to the protocol</span></div>
          <ArrowDown className="demo-stack-arrow" aria-hidden="true" />
          <div className="demo-stack-branches">
            <div className="demo-stack-node"><ShieldCheck aria-hidden="true" /><strong>Privacy Core / Protocol</strong><span>Privacy rules, cryptography and CKB scripts</span></div>
            <div className="demo-stack-node demo-stack-node--ccc"><Wallet aria-hidden="true" /><strong>Application-owned CCC</strong><span>CKB transactions, signing and submission</span></div>
          </div>
          <ArrowDown className="demo-stack-arrow" aria-hidden="true" />
          <div className="demo-stack-node"><Network aria-hidden="true" /><strong>CKB L1</strong><span>Scripts, Cells, consensus and settlement</span></div>
        </div>
      </section>
    </section>
  );
}
