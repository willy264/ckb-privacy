import { useState, type ReactNode } from 'react';
import { ccc } from '@ckb-ccc/core';
import {
  createDemoIdentity,
  deriveStealthPayment,
  createFixturePayment,
  scanStealthPayments,
  buildSendDraft,
  prepareSpendDraft,
  deriveFreshChange,
  parseCapacity,
} from '@ckb-ccc/stealth';
import {
  ArrowDownLeft, ArrowRight, ArrowUpRight, Check, CheckCircle2, ChevronRight,
  Code2, Eye, Fingerprint, Info, KeyRound, Layers, Lock, Radio,
  RefreshCw, ScanLine, Send, Shield, ShieldCheck, Wallet,
} from 'lucide-react';

type Tab = 'send' | 'receive' | 'disclosure';
type Payment = ReturnType<typeof deriveStealthPayment>;
type Match = ReturnType<typeof scanStealthPayments>['matches'][number];

// These are deliberately public demo identities. Never use these keys for funds.
const demoIdentity = createDemoIdentity();
const localClient = new ccc.ClientPublicTestnet();
const normalLock = ccc.Script.from({
  codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
  hashType: 'type',
  args: ccc.hashCkb(demoIdentity.spendPublicKey).slice(0, 42),
});
const normalDemoAddress = ccc.Address.fromScript(normalLock, localClient).toString();
const hexKey = (value: number) => `0x${value.toString(16).padStart(64, '0')}`;
const fixturePayment = deriveStealthPayment(demoIdentity.metaAddress, { ephemeralPrivateKey: hexKey(13) });
const incomingFixtures = [
  createFixturePayment(fixturePayment, '200', 'fixture-incoming-01'),
  // Well-formed output that deliberately does not belong to this recipient.
  createFixturePayment({ ...fixturePayment, lock: ccc.Script.from({ ...fixturePayment.lock, args: `${fixturePayment.lock.args.slice(0, -2)}${fixturePayment.lock.args.endsWith('00') ? '01' : '00'}` }) }, '200', 'fixture-unrelated-02'),
];

const displayError = (error: unknown) => error instanceof Error ? error.message : 'The input could not be validated.';

function Badge({ children, tone = 'blue' }: { children: ReactNode; tone?: 'blue' | 'amber' | 'neutral' | 'green' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function CodeValue({ label, children, testId }: { label: string; children: ReactNode; testId?: string }) {
  return <div className="code-value"><span className="code-label">{label}</span><code data-testid={testId}>{children}</code></div>;
}

function Handoff({ built }: { built: boolean }) {
  return <section className="handoff" aria-label="CCC transaction hand-off">
    <div className="section-heading"><div><span className="eyebrow">THE EXISTING CCC FLOW</span><h3>CCC takes it from here</h3></div><Badge tone="amber">SIMULATED</Badge></div>
    <div className="handoff-steps">
      {[
        { icon: Layers, name: 'completeInputs', detail: 'Select sender-owned inputs' },
        { icon: RefreshCw, name: 'completeFee', detail: 'Balance capacity & route change' },
        { icon: Wallet, name: 'signer', detail: 'Request wallet approval' },
      ].map(({ icon: Icon, name, detail }, i) => <div key={name} className="handoff-step"><span className="step-number">{i + 1}</span><Icon size={17} /><strong>{name}</strong><small>{detail}</small></div>)}
    </div>
    <p className="microcopy">{built ? 'A real unsigned CCC output draft is ready locally. ' : ''}Input selection, fee completion and signing are illustrated only. No wallet is connected; nothing is signed or submitted.</p>
  </section>;
}

function Disclosure({ incognito, expanded = false }: { incognito: boolean; expanded?: boolean }) {
  return <section className={`card disclosure ${expanded ? 'disclosure-expanded' : ''}`} data-testid={expanded ? 'disclosure-detail' : 'disclosure-panel'} aria-label="Disclosure panel">
    <div className="card-heading"><span className="icon-box"><Eye size={20} /></span><div><span className="eyebrow">KNOW WHAT IS VISIBLE</span><h2>Disclosure panel</h2></div></div>
    <p className="card-intro">A one-time receiving address changes what is linked. It does not make the entire transaction private.</p>
    <dl className="disclosure-list">
      <div><dt>Recipient identity</dt><dd className={incognito ? 'status-blue' : 'status-muted'}>{incognito ? 'NOT IN THE OUTPUT' : 'REUSABLE ADDRESS'}</dd></div>
      <div><dt>Transfer amount</dt><dd>NOT HIDDEN</dd></div>
      <div><dt>Sender inputs</dt><dd>NOT HIDDEN</dd></div>
      <div><dt>Ephemeral public key</dt><dd>{incognito ? 'PUBLIC' : 'NOT USED'}</dd></div>
      <div><dt>Timing & network metadata</dt><dd>NOT PROTECTED</dd></div>
    </dl>
    <div className="disclosure-note"><Info size={17} /><p>Stealth addresses target <strong>receiver unlinkability</strong>. Amount, timing and network correlation can still reveal relationships.</p></div>
    {expanded && <div className="disclosure-explanation"><h3>What a chain observer would see</h3><p>{incognito ? "The proposed stealth send publishes a one-time lock, its ephemeral public key, the output capacity and the consumed sender inputs. The recipient's reusable meta-address is not embedded in that output." : 'Normal CCC sending publishes the reusable recipient address, output capacity and consumed sender inputs. No ephemeral key is used. Enable Incognito mode to derive a one-time recipient instead.'}</p><h3>What this demonstration proves</h3><p>Local key derivation, fixture detection and unsigned CCC output construction run in this browser. Scanning is against public local fixtures. Input completion, fee calculation, signing and settlement are SIMULATED. This is not deployment evidence.</p><h3>Fresh change reduces address reuse</h3><p>With Incognito mode, a separately derived change address avoids sending change straight back to a reusable address. It does not hide the amount or break the transaction's input/output relationships.</p></div>}
  </section>;
}

export default function App() {
  const [tab, setTab] = useState<Tab>('send');
  const [incognito, setIncognito] = useState(false);
  const [metaAddress, setMetaAddress] = useState<string>(demoIdentity.metaAddress);
  const [normalAddress, setNormalAddress] = useState(normalDemoAddress);
  const [amount, setAmount] = useState('200');
  const [payment, setPayment] = useState<Payment>();
  const [change, setChange] = useState<Payment>();
  const [draft, setDraft] = useState<string>();
  const [sendError, setSendError] = useState('');
  const [viewKey, setViewKey] = useState<string>(demoIdentity.viewKey);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [rejected, setRejected] = useState(0);
  const [scanError, setScanError] = useState('');
  const [spend, setSpend] = useState<ReturnType<typeof prepareSpendDraft>>();
  const [busy, setBusy] = useState(false);
  const visibleChange = tab === 'send' ? change : tab === 'receive' ? spend?.change : undefined;
  const freshChangeEnabled = incognito || tab === 'receive';

  function clearDraft() { setPayment(undefined); setDraft(undefined); setChange(undefined); setSendError(''); }
  function toggleMode() { setIncognito(!incognito); clearDraft(); }
  function derive() {
    setSendError(''); setDraft(undefined); setChange(undefined);
    try { setPayment(deriveStealthPayment(metaAddress)); } catch (error) { setPayment(undefined); setSendError(displayError(error)); }
  }
  async function buildDraft() {
    setSendError(''); setBusy(true);
    try {
      let transaction: ccc.Transaction;
      if (incognito) {
        if (!payment) throw new Error('Derive a one-time address before building the transaction preview.');
        transaction = buildSendDraft(payment, amount).transaction;
        setChange(deriveFreshChange(demoIdentity.metaAddress));
      } else {
        const address = await ccc.Address.fromString(normalAddress, localClient);
        const capacity = parseCapacity(amount);
        const output = ccc.CellOutput.from({ lock: address.script, capacity });
        if (capacity < BigInt(output.occupiedSize) * 100_000_000n) throw new Error('The amount is below the occupied capacity required for this output.');
        transaction = ccc.Transaction.from({ outputs: [output], outputsData: ['0x'] });
        setChange(undefined);
      }
      setDraft(JSON.stringify({ outputs: transaction.outputs, outputsData: transaction.outputsData, inputs: [] }, (_key, value) => typeof value === 'bigint' ? `0x${value.toString(16)}` : value, 2));
    } catch (error) { setDraft(undefined); setChange(undefined); setSendError(displayError(error)); }
    finally { setBusy(false); }
  }
  function scan() {
    setScanError(''); setSpend(undefined);
    try { const result = scanStealthPayments(incomingFixtures, viewKey, demoIdentity.spendPublicKey); setMatches(result.matches); setRejected(incomingFixtures.length - result.matches.length); }
    catch (error) { setMatches(null); setScanError(displayError(error)); }
  }
  function prepareSpend(match: Match) {
    setScanError('');
    try { setSpend(prepareSpendDraft(match, demoIdentity, demoIdentity.metaAddress)); }
    catch (error) { setSpend(undefined); setScanError(displayError(error)); }
  }
  function reset() {
    setTab('send'); setIncognito(false); setMetaAddress(demoIdentity.metaAddress); setNormalAddress(normalDemoAddress); setAmount('200'); clearDraft(); setViewKey(demoIdentity.viewKey); setMatches(null); setRejected(0); setScanError(''); setSpend(undefined);
  }

  return <div className="app-shell">
    <header className="topbar"><a href="/" className="brand" aria-label="CCC Incognito home"><span className="brand-mark">c<span>c</span>c</span><span className="brand-divider" /><span className="brand-title">Incognito</span></a><div className="topbar-right"><code className="package-name">@ckb-ccc/stealth</code><span className="local-status"><span />Local demonstration</span></div></header>
    <main className="page">
      <div className="evidence-banner" role="status"><span className="banner-tag">SIMULATED</span><span><strong>Target flow demonstration.</strong> Public demo keys and local fixtures. No live scanning, wallet approval or on-chain settlement. Not deployment evidence.</span></div>
      <section className="hero"><div className="hero-copy"><span className="eyebrow"><span className="small-line" /> AN OPT-IN CAPABILITY FOR CCC</span><h1>Incognito mode,<br /><span>inside your app.</span></h1><p>Send to a one-time address. Discover your payments.<br className="desktop-break" /> Spend with the same CCC transaction flow.</p></div><div className={`mode-card ${incognito ? 'mode-on' : ''}`}><div className="mode-card-heading"><div className="mode-icon"><Shield size={23} /></div><Badge tone={incognito ? 'blue' : 'neutral'}>{incognito ? 'STEALTH SEND' : 'NORMAL SEND'}</Badge></div><div className="mode-toggle-line"><div><label id="incognito-label">Incognito mode</label><p>{incognito ? 'One-time receiving is enabled' : 'Your usual CCC sending flow'}</p></div><button type="button" className="switch" role="switch" aria-checked={incognito} aria-labelledby="incognito-label" onClick={toggleMode} data-testid="incognito-toggle"><span /></button></div><div className="mode-card-footer"><CheckCircle2 size={15} /><span>Opt-in package. Existing CCC client & signer.</span></div></div></section>
      <div className="scope-banner"><ShieldCheck size={19} /><p><strong>Recipient unlinkability, within a clear scope.</strong> Amounts and sender inputs are NOT hidden. Timing, network and amount correlation remain possible.</p></div>
      <div className="workbench-header"><nav className="tabs" aria-label="Demo views">{([{ id: 'send', name: 'Send', icon: Send }, { id: 'receive', name: 'Scan & receive', icon: ScanLine }, { id: 'disclosure', name: 'Disclosure', icon: Eye }] as const).map(({ id, name, icon: Icon }) => <button key={id} className={tab === id ? 'tab active' : 'tab'} aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}><Icon size={17} />{name}</button>)}</nav><button className="button-text reset-button" onClick={reset}><RefreshCw size={14} />Reset demo</button></div>
      <div className={`workspace ${tab === 'disclosure' ? 'workspace-disclosure' : ''}`}>
        <div className="primary-column">
          {tab === 'send' && <section className="card send-card" data-testid="send-view"><div className="card-heading"><span className="icon-box"><ArrowUpRight size={23} /></span><div><span className="eyebrow">{incognito ? 'STEALTH SEND' : 'STANDARD CCC SEND'}</span><h2>{incognito ? 'A fresh address. Every payment.' : 'Start with your usual send.'}</h2></div><Badge tone="amber">SIMULATED</Badge></div><p className="card-intro">{incognito ? 'The recipient shares a meta-address. Derive a one-time lock locally, then let CCC handle the transaction.' : 'Send to a reusable CKB address. Turn on Incognito mode above to add one-time receiving.'}</p>
            <div className="field-heading"><label htmlFor={incognito ? 'meta-address' : 'normal-address'}>{incognito ? 'Recipient stealth meta-address' : 'Recipient CKB address'}</label><button className="button-text" onClick={() => { setMetaAddress(demoIdentity.metaAddress); setNormalAddress(normalDemoAddress); clearDraft(); }}>Use demo recipient</button></div>
            {incognito ? <textarea id="meta-address" data-testid="meta-address" spellCheck={false} value={metaAddress} onChange={e => { setMetaAddress(e.target.value); clearDraft(); }} rows={3} /> : <textarea id="normal-address" data-testid="normal-address" spellCheck={false} value={normalAddress} onChange={e => { setNormalAddress(e.target.value); clearDraft(); }} rows={3} />}
            <p className="field-help"><KeyRound size={13} />{incognito ? 'Published view + spend public keys. No private key is shared.' : 'A public demo receiving address. Never send real assets to this address.'}</p>
            <div className="amount-and-action"><div className="amount-field"><label htmlFor="amount">Amount <span>visible on-chain</span></label><div><input id="amount" inputMode="decimal" value={amount} onChange={e => { setAmount(e.target.value); clearDraft(); }} /><span>CKB</span></div></div>{incognito && <button className="button-primary" onClick={derive}><Fingerprint size={17} />Derive one-time address<ArrowRight size={16} /></button>}</div>
            {payment && incognito && <div className="derived-result" data-testid="derived-payment"><div className="result-heading"><CheckCircle2 size={17} /><strong>One-time address derived locally</strong><Badge>REAL KEY DERIVATION</Badge></div><CodeValue label="One-time testnet address · do not fund" testId="one-time-address">{payment.address}</CodeValue><CodeValue label="Ephemeral public key · published with the output" testId="ephemeral-public-key">{payment.ephemeralPublicKey}</CodeValue><p className="microcopy">A fresh ephemeral key produces a different address each time. Local cryptographic output is not evidence of settlement.</p></div>}
            {sendError && <div className="error-message" role="alert">{sendError}</div>}
            <div className="build-row"><span><Lock size={15} />Unsigned preview only</span><button className={incognito ? 'button-secondary' : 'button-primary'} disabled={busy || (incognito && !payment)} onClick={buildDraft}>Build transaction preview<ChevronRight size={16} /></button></div>
            {draft && <div className="draft-result" data-testid="transaction-preview"><div className="result-heading"><CheckCircle2 size={17} /><strong>CCC output draft built</strong><Badge tone="amber">SIMULATED TRANSACTION</Badge></div><p>Output capacity: <strong>{amount} CKB</strong>. No inputs selected, fees completed, signatures or submission.</p><details><summary><Code2 size={15} />Inspect unsigned CCC output</summary><pre>{draft}</pre></details></div>}
            {change && <div className="change-result" data-testid="fresh-change"><div className="result-heading"><RefreshCw size={16} /><strong>Change → fresh address</strong><Badge tone="amber">SIMULATED</Badge></div><CodeValue label="Fresh change destination · exact change awaits fee completion">{change.address}</CodeValue></div>}
          </section>}
          {tab === 'receive' && <section className="card receive-card" data-testid="receive-view"><div className="card-heading"><span className="icon-box"><ArrowDownLeft size={23} /></span><div><span className="eyebrow">SCAN & RECEIVE</span><h2>Find the payments meant for you.</h2></div><Badge tone="amber">SIMULATED</Badge></div><p className="card-intro">Use a view key to recognize incoming one-time outputs. This demonstration checks two local fixtures; it does not scan CKB.</p><div className="fixture-warning"><KeyRound size={16} /><p><strong>Public demo key — never use for funds.</strong> Your real view key reveals incoming activity. Do not paste real keys into this demo.</p></div><div className="field-heading"><label htmlFor="view-key">Demo view key</label><button className="button-text" onClick={() => { setViewKey(demoIdentity.viewKey); setMatches(null); setScanError(''); setSpend(undefined); }}>Use demo key</button></div><input id="view-key" className="key-input" spellCheck={false} value={viewKey} onChange={e => { setViewKey(e.target.value); setMatches(null); setSpend(undefined); setScanError(''); }} /><div className="scan-controls"><span><Radio size={15} />Source: local public fixtures</span><button className="button-primary" onClick={scan}><ScanLine size={17} />Scan fixture payments</button></div>{scanError && <div className="error-message" role="alert">{scanError}</div>}
            {matches === null ? <div className="empty-state"><ScanLine size={35} /><h3>Ready to scan locally</h3><p>The view key checks ownership without signing a transaction.</p></div> : <div className="scan-results" data-testid="scan-results"><div className="scan-summary"><span><CheckCircle2 size={17} /><strong>{matches.length} payment{matches.length === 1 ? '' : 's'} detected</strong></span><small>{rejected} unrelated or invalid output{rejected === 1 ? '' : 's'} excluded</small></div>{matches.length === 0 && <p className="no-matches">No local fixture matches this view key. No incoming payment is claimed.</p>}{matches.map(match => <article className="payment-card" key={match.id}><div className="payment-heading"><span className="payment-icon"><ArrowDownLeft size={21} /></span><div><h3>Incoming stealth payment</h3><p>LOCAL FIXTURE · SIMULATED</p></div><strong className="payment-amount">{ccc.fixedPointToString(match.capacity)} <span>CKB</span></strong></div><CodeValue label="Detected one-time address" testId="detected-address">{match.address}</CodeValue><div className="payment-footer"><span><CheckCircle2 size={14} />View-key match verified locally</span><button className="button-secondary" onClick={() => prepareSpend(match)}>Spend simulation<ArrowUpRight size={15} /></button></div></article>)}</div>}
            {spend && <div className="spend-result" data-testid="spend-preview"><div className="result-heading"><ShieldCheck size={18} /><strong>Spend authority derived locally</strong><Badge tone="amber">SIMULATED</Badge></div><p>The local key matches this output. CCC input completion, fee calculation, signing and submission remain simulated. The fixture remains unspent.</p><CodeValue label="One-time destination · locally derived">{spend.destination.address}</CodeValue><CodeValue label="Change → fresh address · locally derived">{spend.change.address}</CodeValue><p className="microcopy">No one-time private key is exposed. No signature or transaction was submitted.</p></div>}
          </section>}
          {tab === 'disclosure' && <Disclosure incognito={incognito} expanded />}
          {tab !== 'disclosure' && <Handoff built={Boolean(draft)} />}
        </div>
        <aside className="sidebar">{tab !== 'disclosure' && <Disclosure incognito={incognito || tab === 'receive'} />}
          <section className="card change-card"><div className="card-heading"><span className="icon-box"><RefreshCw size={19} /></span><div><span className="eyebrow">CHANGE HYGIENE</span><h2>A fresh way back.</h2></div></div><div className="change-indicator"><span className="change-dot" /><strong>{visibleChange ? 'Fresh change address derived' : freshChangeEnabled ? 'Fresh change on preview' : 'Enable incognito for fresh change'}</strong></div><p>{freshChangeEnabled ? 'Change targets a separately derived address instead of a reusable identity. Its capacity remains public.' : 'Normal mode keeps the app’s existing change policy. Incognito adds an optional fresh-address helper.'}</p><span className="mini-note">{visibleChange ? 'SIMULATED · destination only, no completed fee' : 'SIMULATED · no funded transaction'}</span></section>
          <section className="boundary-card"><div className="boundary-title"><Code2 size={18} /><h3>One package. Existing CCC.</h3></div><code>@ckb-ccc/stealth</code><ul><li><Check size={15} />Meta-address & one-time derivation</li><li><Check size={15} />View-key detection & spend authority</li><li><Check size={15} />Optional fresh-change helper</li></ul><div className="boundary-divider" /><p>The app keeps its CCC client, wallet and signer. Target on-chain boundary: the existing Obscell stealth lock on CKB testnet.</p><span className="mini-note">Local prototype · proposed upstream package</span></section>
        </aside>
      </div>
      <footer className="footer"><span><Shield size={15} />Incognito mode for CCC</span><p>Local target-flow demo. Public fixture keys. No on-chain activity.</p><span className="footer-version">@ckb-ccc/stealth · prototype</span></footer>
    </main>
  </div>;
}
