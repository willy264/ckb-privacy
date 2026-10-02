import { ccc } from '@ckb-ccc/core';
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, KeyRound, Radio, ScanLine, ShieldCheck } from 'lucide-react';
import { Badge } from '../components/Badge';
import { CodeValue } from '../components/CodeValue';
import { normalDemoAddress } from '../demo/fixtures';
import { CccButton } from '../ccc/CccControls';
import type { ReceiveDemo } from '../hooks/useReceiveDemo';

export function ReceiveView({ demo, incognito }: { demo: ReceiveDemo; incognito: boolean }) {
  const { matches, rejected, spend } = demo;

  if (!incognito) {
    return (
      <section className="card receive-card" data-testid="normal-receive">
        <div className="card-heading">
          <span className="icon-box"><ArrowDownLeft size={23} /></span>
          <div><span className="eyebrow">NORMAL MODE</span><h2>Receive CKB</h2></div>
          <Badge tone="amber">DEMO</Badge>
        </div>
        <p className="card-intro">Share your normal receiving address. Each payment to this address can be directly grouped with the others.</p>
        <CodeValue label="Reusable testnet address · demo only">{normalDemoAddress}</CodeValue>
        <div className="empty-state">
          <ArrowDownLeft size={30} /><h3>One address, every time</h3>
          <p>Enable Incognito mode to share a stealth receiving identity and recognize payments to one-time destinations.</p>
        </div>
        <p className="microcopy">No balance or incoming chain activity is loaded. Do not send assets to this demo address.</p>
      </section>
    );
  }

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
        <p><strong>Public demo profiles only.</strong> Viewing information checks which payments belong to you. No real private keys are needed or accepted here.</p>
      </div>
      <div className="field-heading">
        <label htmlFor="viewing-profile">Demo viewing profile</label>
      </div>
      <select id="viewing-profile" value={demo.profile} onChange={event => demo.updateProfile(event.target.value === 'unrelated' ? 'unrelated' : 'matching')}>
        <option value="matching">Demo account · one matching payment</option>
        <option value="unrelated">Different viewing key · no matching payments</option>
      </select>
      <details className="technical-details">
        <summary>Technical details: public fixture viewing key</summary>
        <CodeValue label="Public demo view key · never use for funds">{demo.viewKey}</CodeValue>
      </details>
      <div className="scan-controls">
        <span><Radio size={15} />Source: local public fixtures</span>
        <CccButton className="button-primary" disabled={demo.busy} onClick={demo.scan}><ScanLine size={17} />{demo.busy ? 'Checking fixture payments…' : 'Scan fixture payments'}</CccButton>
      </div>
      {demo.error && <div className="error-message" role="alert">{demo.error}</div>}
      {demo.busy ? (
        <div className="empty-state" role="status"><ScanLine size={30} /><h3>Checking local fixtures…</h3><p>No chain request is being made.</p></div>
      ) : matches === null ? (
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
                <CccButton variant="info" className="button-secondary" onClick={() => demo.prepareSpend(match)}>
                  Spend simulation<ArrowUpRight size={15} />
                </CccButton>
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
