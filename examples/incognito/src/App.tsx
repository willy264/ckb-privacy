import { useState } from 'react';
import { Check, CheckCircle2, Code2, Eye, RefreshCw, ScanLine, Send, Shield, ShieldCheck } from 'lucide-react';
import { Badge } from './components/Badge';
import { ChangeHygiene } from './components/ChangeHygiene';
import { Disclosure } from './components/Disclosure';
import { Handoff } from './components/Handoff';
import { useReceiveDemo } from './hooks/useReceiveDemo';
import { useSendDemo } from './hooks/useSendDemo';
import { ReceiveView } from './views/ReceiveView';
import { SendView } from './views/SendView';

type Tab = 'send' | 'receive' | 'disclosure';

const tabs = [
  { id: 'send', name: 'Send', icon: Send },
  { id: 'receive', name: 'Scan & receive', icon: ScanLine },
  { id: 'disclosure', name: 'Disclosure', icon: Eye },
] as const;

export default function App() {
  const [tab, setTab] = useState<Tab>('send');
  const send = useSendDemo();
  const receive = useReceiveDemo();
  const { incognito } = send;

  // A change preview belongs to its operation, never to a different tab's draft.
  const visibleChange = tab === 'send' ? send.change : tab === 'receive' ? receive.spend?.change : undefined;
  const freshChangeEnabled = incognito || tab === 'receive';

  function reset() {
    setTab('send');
    send.reset();
    receive.reset();
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a href="/" className="brand" aria-label="CCC Incognito home">
          <span className="brand-mark">c<span>c</span>c</span>
          <span className="brand-divider" /><span className="brand-title">Incognito</span>
        </a>
        <div className="topbar-right">
          <code className="package-name">@ckb-ccc/stealth</code>
          <span className="local-status"><span />Local demonstration</span>
        </div>
      </header>
      <main className="page">
        <div className="evidence-banner" role="status">
          <span className="banner-tag">SIMULATED</span>
          <span><strong>Target flow demonstration.</strong> Public demo keys and local fixtures. No live scanning, wallet approval or on-chain settlement. Not deployment evidence.</span>
        </div>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><span className="small-line" /> AN OPT-IN CAPABILITY FOR CCC</span>
            <h1>Incognito mode,<br /><span>inside your app.</span></h1>
            <p>Send to a one-time address. Discover your payments.<br className="desktop-break" /> Spend with the same CCC transaction flow.</p>
          </div>
          <div className={`mode-card ${incognito ? 'mode-on' : ''}`}>
            <div className="mode-card-heading">
              <div className="mode-icon"><Shield size={23} /></div>
              <Badge tone={incognito ? 'blue' : 'neutral'}>{incognito ? 'STEALTH SEND' : 'NORMAL SEND'}</Badge>
            </div>
            <div className="mode-toggle-line">
              <div>
                <label id="incognito-label">Incognito mode</label>
                <p>{incognito ? 'One-time receiving is enabled' : 'Your usual CCC sending flow'}</p>
              </div>
              <button
                type="button" className="switch" role="switch" aria-checked={incognito}
                aria-labelledby="incognito-label" onClick={send.toggleMode} data-testid="incognito-toggle"
              >
                <span />
              </button>
            </div>
            <div className="mode-card-footer">
              <CheckCircle2 size={15} /><span>Opt-in package. Existing CCC client & signer.</span>
            </div>
          </div>
        </section>
        <div className="scope-banner">
          <ShieldCheck size={19} />
          <p><strong>Recipient unlinkability, within a clear scope.</strong> Amounts and sender inputs are NOT hidden. Timing, network and amount correlation remain possible.</p>
        </div>
        <div className="workbench-header">
          <nav className="tabs" aria-label="Demo views">
            {tabs.map(({ id, name, icon: Icon }) => (
              <button
                key={id} className={tab === id ? 'tab active' : 'tab'}
                aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}
              >
                <Icon size={17} />{name}
              </button>
            ))}
          </nav>
          <button className="button-text reset-button" onClick={reset}><RefreshCw size={14} />Reset demo</button>
        </div>
        <div className={`workspace ${tab === 'disclosure' ? 'workspace-disclosure' : ''}`}>
          <div className="primary-column">
            {tab === 'send' && <SendView demo={send} />}
            {tab === 'receive' && <ReceiveView demo={receive} />}
            {tab === 'disclosure' && <Disclosure incognito={incognito} expanded />}
            {tab !== 'disclosure' && <Handoff built={Boolean(send.draft)} />}
          </div>
          <aside className="sidebar">
            {tab !== 'disclosure' && <Disclosure incognito={incognito || tab === 'receive'} />}
            <ChangeHygiene enabled={freshChangeEnabled} hasFreshChange={Boolean(visibleChange)} />
            <section className="boundary-card">
              <div className="boundary-title"><Code2 size={18} /><h3>One package. Existing CCC.</h3></div>
              <code>@ckb-ccc/stealth</code>
              <ul>
                <li><Check size={15} />Meta-address & one-time derivation</li>
                <li><Check size={15} />View-key detection & spend authority</li>
                <li><Check size={15} />Optional fresh-change helper</li>
              </ul>
              <div className="boundary-divider" />
              <p>The app keeps its CCC client, wallet and signer. Target on-chain boundary: the existing Obscell stealth lock on CKB testnet.</p>
              <span className="mini-note">Local prototype · proposed upstream package</span>
            </section>
          </aside>
        </div>
        <footer className="footer">
          <span><Shield size={15} />Incognito mode for CCC</span>
          <p>Local target-flow demo. Public fixture keys. No on-chain activity.</p>
          <span className="footer-version">@ckb-ccc/stealth · prototype</span>
        </footer>
      </main>
    </div>
  );
}
