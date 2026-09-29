import { ccc } from '@ckb-ccc/core';
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, KeyRound, Radio, ScanLine, ShieldCheck } from 'lucide-react';
import { Badge } from '../components/Badge';
import { CodeValue } from '../components/CodeValue';
import type { ReceiveDemo } from '../hooks/useReceiveDemo';

export function ReceiveView({ demo }: { demo: ReceiveDemo }) {
  const { matches, rejected, spend } = demo;

  return (
    <section className="card receive-card" data-testid="receive-view">
      <div className="card-heading">
        <span className="icon-box"><ArrowDownLeft size={23} /></span>
        <div><span className="eyebrow">SCAN & RECEIVE</span><h2>Find the payments meant for you.</h2></div>
        <Badge tone="amber">SIMULATED</Badge>
      </div>
      <p className="card-intro">Use a view key to recognize incoming one-time outputs. This demonstration checks two local fixtures; it does not scan CKB.</p>
      <div className="fixture-warning">
        <KeyRound size={16} />
        <p><strong>Public demo key — never use for funds.</strong> Your real view key reveals incoming activity. Do not paste real keys into this demo.</p>
      </div>
      <div className="field-heading">
        <label htmlFor="view-key">Demo view key</label>
        <button className="button-text" onClick={demo.useDemoKey}>Use demo key</button>
      </div>
      <input
        id="view-key" className="key-input" spellCheck={false}
        value={demo.viewKey} onChange={event => demo.updateViewKey(event.target.value)}
      />
      <div className="scan-controls">
        <span><Radio size={15} />Source: local public fixtures</span>
        <button className="button-primary" onClick={demo.scan}><ScanLine size={17} />Scan fixture payments</button>
      </div>
      {demo.error && <div className="error-message" role="alert">{demo.error}</div>}
      {matches === null ? (
        <div className="empty-state">
          <ScanLine size={35} /><h3>Ready to scan locally</h3>
          <p>The view key checks ownership without signing a transaction.</p>
        </div>
      ) : (
        <div className="scan-results" data-testid="scan-results">
          <div className="scan-summary">
            <span><CheckCircle2 size={17} /><strong>{matches.length} payment{matches.length === 1 ? '' : 's'} detected</strong></span>
            <small>{rejected} unrelated or invalid output{rejected === 1 ? '' : 's'} excluded</small>
          </div>
          {matches.length === 0 && <p className="no-matches">No local fixture matches this view key. No incoming payment is claimed.</p>}
          {matches.map(match => (
            <article className="payment-card" key={match.id}>
              <div className="payment-heading">
                <span className="payment-icon"><ArrowDownLeft size={21} /></span>
                <div><h3>Incoming stealth payment</h3><p>LOCAL FIXTURE · SIMULATED</p></div>
                <strong className="payment-amount">{ccc.fixedPointToString(match.capacity)} <span>CKB</span></strong>
              </div>
              <CodeValue label="Detected one-time address" testId="detected-address">{match.address}</CodeValue>
              <div className="payment-footer">
                <span><CheckCircle2 size={14} />View-key match verified locally</span>
                <button className="button-secondary" onClick={() => demo.prepareSpend(match)}>
                  Spend simulation<ArrowUpRight size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      {spend && (
        <div className="spend-result" data-testid="spend-preview">
          <div className="result-heading">
            <ShieldCheck size={18} /><strong>Spend authority derived locally</strong><Badge tone="amber">SIMULATED</Badge>
          </div>
          <p>The local key matches this output. CCC input completion, fee calculation, signing and submission remain simulated. The fixture remains unspent.</p>
          <CodeValue label="One-time destination · locally derived">{spend.destination.address}</CodeValue>
          <CodeValue label="Change → fresh address · locally derived">{spend.change.address}</CodeValue>
          <p className="microcopy">No one-time private key is exposed. No signature or transaction was submitted.</p>
        </div>
      )}
    </section>
  );
}
