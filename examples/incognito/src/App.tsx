import { useState } from 'react';
import { ArrowDownLeft, Eye, RefreshCw, Send, Shield, Wallet } from 'lucide-react';
import { CccDemoShell } from './ccc/CccDemoShell';
import { CccButton } from './ccc/CccControls';
import { Badge } from './components/Badge';
import { ChangeHygiene } from './components/ChangeHygiene';
import { Disclosure } from './components/Disclosure';
import { Handoff } from './components/Handoff';
import { ModeComparison } from './components/ModeComparison';
import { ReceivingIdentity } from './components/ReceivingIdentity';
import { useReceiveDemo } from './hooks/useReceiveDemo';
import { useSendDemo } from './hooks/useSendDemo';
import { ReceiveView } from './views/ReceiveView';
import { SendView } from './views/SendView';

type Tab = 'send' | 'receive' | 'disclosure';

export default function App() {
  const [tab, setTab] = useState<Tab>('send');
  const [connected, setConnected] = useState(true);
  const [comparison, setComparison] = useState(false);
  const send = useSendDemo();
  const receive = useReceiveDemo();
  const { incognito } = send;
  const visibleChange = tab === 'send' ? send.change : tab === 'receive' ? receive.spend?.change : undefined;

  function toggleMode() {
    send.toggleMode();
    receive.reset();
  }

  function reset() {
    setTab('send');
    setConnected(true);
    setComparison(false);
    send.reset();
    receive.reset();
  }

  function disconnect() {
    send.reset();
    receive.reset();
    setTab('send');
    setConnected(false);
  }

  const tabs = [
    { id: 'send' as const, name: 'Send', icon: Send },
    { id: 'receive' as const, name: incognito ? 'Scan & receive' : 'Receive', icon: ArrowDownLeft },
    { id: 'disclosure' as const, name: 'Disclosure', icon: Eye },
  ];

  return (
    <CccDemoShell>
      <div className="incognito-app" data-testid="ccc-app">
        <div className="page-heading">
          <div><span className="eyebrow">CCC APPLICATION · LOCAL UI FORK</span><h1>CCC, with an Incognito switch.</h1></div>
          <Badge tone="neutral">UNOFFICIAL PROTOTYPE</Badge>
        </div>
        <div className="evidence-banner">
          <span className="banner-tag">DEMO</span>
          <p><strong>Demo only. Do not enter real private keys or send real assets.</strong><br />Public fixture account. Chain-dependent steps are SIMULATED. Not deployment evidence.</p>
        </div>
        <section className={`account-panel ${incognito ? 'mode-on' : ''}`} aria-label="Demo account">
          <div className="account-toolbar">
            <div className="account-status"><Wallet size={18} /><strong>{connected ? 'Demo account' : 'No demo account selected'}</strong><span>{connected ? 'Simulated connection · no wallet connected' : 'Explore without connecting a real wallet'}</span></div>
            {connected && <button className="button-text" onClick={disconnect}>Disconnect demo</button>}
          </div>
          <div className="account-content">
            <div className="mode-control">
              <div className="mode-toggle-line">
                <div><span className="mode-state">{incognito ? 'INCOGNITO ON' : 'NORMAL MODE'}</span><label id="incognito-label">Incognito mode</label></div>
                <button type="button" className="switch" role="switch" aria-checked={incognito} aria-labelledby="incognito-label"
                  disabled={!connected} onClick={toggleMode} data-testid="incognito-toggle"><span /></button>
              </div>
              <p>{incognito ? 'Same CCC flow. Fresh destinations for receiving.' : 'Your usual address. Enable one-time receiving when you need it.'}</p>
              <button className="button-text compare-button" aria-expanded={comparison} aria-controls="mode-comparison" onClick={() => setComparison(value => !value)}>What changed?</button>
            </div>
            {connected ? <ReceivingIdentity incognito={incognito} /> : (
              <div className="connection-empty">
                <h2>Try a public demo account</h2><p>No extension, private key or real assets required.</p>
                <CccButton className="button-primary" onClick={() => setConnected(true)}><Wallet size={16} />Use demo account</CccButton>
              </div>
            )}
          </div>
        </section>
        {comparison && <ModeComparison incognito={incognito} />}
        <div className="scope-banner"><Shield size={18} /><p><strong>Amounts and sender inputs are NOT hidden.</strong> Stealth receiving reduces direct recipient linkage. Outputs, timing and transaction relationships remain observable.</p></div>
        <div className="workbench-header">
          <nav className="tabs" aria-label="Demo views">
            {tabs.map(({ id, name, icon: Icon }) => (
              <button key={id} className={tab === id ? 'tab active' : 'tab'} aria-current={tab === id ? 'page' : undefined}
                disabled={!connected && id !== 'disclosure'} onClick={() => setTab(id)}><Icon size={17} />{name}</button>
            ))}
          </nav>
          <button className="button-text reset-button" onClick={reset}><RefreshCw size={14} />Reset demo</button>
        </div>
        <div className="workspace">
          <div className="primary-column">
            {connected && tab === 'send' && <SendView demo={send} />}
            {connected && tab === 'receive' && <ReceiveView demo={receive} incognito={incognito} />}
            {tab === 'disclosure' && <Disclosure incognito={incognito} expanded />}
            {!connected && tab !== 'disclosure' && <section className="card empty-state"><Wallet size={30} /><h2>Choose a demo account to continue</h2><p>Normal and Incognito previews both use public local fixtures.</p></section>}
            {connected && (tab === 'send' || (tab === 'receive' && incognito)) && (
              <details className="handoff-details"><summary>How this would hand off to CCC <Badge tone="amber">SIMULATED</Badge></summary><Handoff built={tab === 'send' && Boolean(send.draft)} /></details>
            )}
          </div>
          <aside className="sidebar">
            {tab !== 'disclosure' && <Disclosure incognito={incognito} />}
            {connected && tab !== 'disclosure' && <ChangeHygiene enabled={incognito && (tab === 'receive' || send.freshChange)} hasFreshChange={Boolean(visibleChange)} />}
            <p className="prototype-note"><code>@ckb-ccc/stealth</code> is our experimental extension. It is not an official CCC package. Local account and transaction activity is simulated.</p>
          </aside>
        </div>
      </div>
    </CccDemoShell>
  );
}
