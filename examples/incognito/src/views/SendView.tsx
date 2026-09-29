import {
  ArrowRight, ArrowUpRight, CheckCircle2, ChevronRight, Code2, Fingerprint,
  KeyRound, Lock, RefreshCw,
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { CodeValue } from '../components/CodeValue';
import type { SendDemo } from '../hooks/useSendDemo';

export function SendView({ demo }: { demo: SendDemo }) {
  const { incognito, payment, draft, change, amount } = demo;

  return (
    <section className="card send-card" data-testid="send-view">
      <div className="card-heading">
        <span className="icon-box"><ArrowUpRight size={23} /></span>
        <div>
          <span className="eyebrow">{incognito ? 'STEALTH SEND' : 'STANDARD CCC SEND'}</span>
          <h2>{incognito ? 'A fresh address. Every payment.' : 'Start with your usual send.'}</h2>
        </div>
        <Badge tone="amber">SIMULATED</Badge>
      </div>
      <p className="card-intro">
        {incognito
          ? 'The recipient shares a meta-address. Derive a one-time lock locally, then let CCC handle the transaction.'
          : 'Send to a reusable CKB address. Turn on Incognito mode above to add one-time receiving.'}
      </p>
      <div className="field-heading">
        <label htmlFor={incognito ? 'meta-address' : 'normal-address'}>
          {incognito ? 'Recipient stealth meta-address' : 'Recipient CKB address'}
        </label>
        <button className="button-text" onClick={demo.useDemoRecipient}>Use demo recipient</button>
      </div>
      {incognito ? (
        <textarea
          id="meta-address" data-testid="meta-address" spellCheck={false} rows={3}
          value={demo.metaAddress} onChange={event => demo.updateMetaAddress(event.target.value)}
        />
      ) : (
        <textarea
          id="normal-address" data-testid="normal-address" spellCheck={false} rows={3}
          value={demo.normalAddress} onChange={event => demo.updateNormalAddress(event.target.value)}
        />
      )}
      <p className="field-help">
        <KeyRound size={13} />
        {incognito
          ? 'Published view + spend public keys. No private key is shared.'
          : 'A public demo receiving address. Never send real assets to this address.'}
      </p>
      <div className="amount-and-action">
        <div className="amount-field">
          <label htmlFor="amount">Amount <span>visible on-chain</span></label>
          <div>
            <input id="amount" inputMode="decimal" value={amount} onChange={event => demo.updateAmount(event.target.value)} />
            <span>CKB</span>
          </div>
        </div>
        {incognito && (
          <button className="button-primary" onClick={demo.derive}>
            <Fingerprint size={17} />Derive one-time address<ArrowRight size={16} />
          </button>
        )}
      </div>
      {payment && incognito && (
        <div className="derived-result" data-testid="derived-payment">
          <div className="result-heading">
            <CheckCircle2 size={17} /><strong>One-time address derived locally</strong><Badge>REAL KEY DERIVATION</Badge>
          </div>
          <CodeValue label="One-time testnet address · do not fund" testId="one-time-address">{payment.address}</CodeValue>
          <CodeValue label="Ephemeral public key · published with the output" testId="ephemeral-public-key">{payment.ephemeralPublicKey}</CodeValue>
          <p className="microcopy">A fresh ephemeral key produces a different address each time. Local cryptographic output is not evidence of settlement.</p>
        </div>
      )}
      {demo.error && <div className="error-message" role="alert">{demo.error}</div>}
      <div className="build-row">
        <span><Lock size={15} />Unsigned preview only</span>
        <button
          className={incognito ? 'button-secondary' : 'button-primary'}
          disabled={demo.busy || (incognito && !payment)} onClick={demo.buildDraft}
        >
          Build transaction preview<ChevronRight size={16} />
        </button>
      </div>
      {draft && (
        <div className="draft-result" data-testid="transaction-preview">
          <div className="result-heading">
            <CheckCircle2 size={17} /><strong>CCC output draft built</strong><Badge tone="amber">SIMULATED TRANSACTION</Badge>
          </div>
          <p>Output capacity: <strong>{amount} CKB</strong>. No inputs selected, fees completed, signatures or submission.</p>
          <details><summary><Code2 size={15} />Inspect unsigned CCC output</summary><pre>{draft}</pre></details>
        </div>
      )}
      {change && (
        <div className="change-result" data-testid="fresh-change">
          <div className="result-heading">
            <RefreshCw size={16} /><strong>Change → fresh address</strong><Badge tone="amber">SIMULATED</Badge>
          </div>
          <CodeValue label="Fresh change destination · exact change awaits fee completion">{change.address}</CodeValue>
        </div>
      )}
    </section>
  );
}
