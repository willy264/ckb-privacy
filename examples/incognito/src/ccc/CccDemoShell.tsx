// Local adaptation of CCC packages/demo/src/app/layoutProvider.tsx.
// Source: https://github.com/ckb-devrel/ccc/tree/3d11c1ed2be6764624ab2b70de2a485eb3a6c93b/packages/demo
// See ../../CCC_UPSTREAM.md for the source mapping and deliberate demo-only changes.
import type { ReactNode } from 'react';
import { Droplets, FlaskConical, Github, Search, Terminal } from 'lucide-react';
import logo from './logo.svg';
import './ccc.css';

function Links() {
  return (
    <nav className="ccc-links" aria-label="CCC ecosystem links">
      <a href="#" className="ccc-brand" aria-label="CCC demo home">
        <img src={logo} alt="" width="28" height="28" />
        <strong>CCC</strong>
      </a>
      <a href="https://live.ckbccc.com/" target="_blank" rel="noopener noreferrer" aria-label="CCC Playground" title="CCC Playground"><Terminal size={22} /></a>
      <a href="https://github.com/ckb-devrel/ccc" target="_blank" rel="noopener noreferrer" aria-label="Upstream CCC on GitHub" title="Upstream CCC"><Github size={22} /></a>
      <a href="https://faucet.nervos.org/" target="_blank" rel="noopener noreferrer" aria-label="CKB testnet faucet" title="CKB testnet faucet"><Droplets size={22} /></a>
      <a href="https://www.nervos.org/" target="_blank" rel="noopener noreferrer" aria-label="Nervos Network" title="Nervos Network">
        <svg width="22" height="22" viewBox="0 0 207.6765 206.318" fill="currentColor" aria-hidden="true">
          <polygon points="0 0 0 206.318 53.151 206.318 53.151 93.897 93.896 93.897 0 0" />
          <polygon points="154.525 0 154.525 112.422 113.781 112.422 207.676 206.318 207.676 0 154.525 0" />
        </svg>
      </a>
      <a href="https://pudge.explorer.nervos.org/" target="_blank" rel="noopener noreferrer" aria-label="CKB testnet explorer" title="CKB testnet explorer"><Search size={22} /></a>
    </nav>
  );
}

export function CccDemoShell({ children }: { children: ReactNode }) {
  return (
    <div className="ccc-shell">
      <div className="ccc-backdrop" aria-hidden="true"><img src={logo} alt="" /><span>CCC</span></div>
      <header className="ccc-header">
        <Links />
        <div className="ccc-account-status"><span>INCOGNITO UX DEMO</span></div>
      </header>
      <main className="ccc-main">{children}</main>
      <footer className="ccc-footer">
        <span>Unofficial Incognito prototype</span>
        <a href="https://github.com/willy264/ckb-privacy" target="_blank" rel="noopener noreferrer">Prototype source</a>
        <span className="ccc-network"><FlaskConical size={18} />Testnet format · Not connected to chain</span>
      </footer>
    </div>
  );
}
