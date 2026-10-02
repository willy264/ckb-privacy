import { ArrowDown, Shield, Wallet } from 'lucide-react';

export function ModeComparison({ incognito }: { incognito: boolean }) {
  return (
    <section className="mode-comparison" id="mode-comparison" data-testid="mode-comparison" aria-label="Normal versus Incognito">
      <div className="comparison-heading"><h2>Same CCC flow. A different receiving destination.</h2><p>What changes when you enable Incognito mode?</p></div>
      <div className="comparison-columns">
        <div className={!incognito ? 'comparison-mode selected' : 'comparison-mode'}>
          <h3><Wallet size={18} />Normal { !incognito && <small>Selected</small> }</h3>
          <p>You share a <strong>normal CKB address</strong></p><ArrowDown size={16} />
          <p>Sender pays the <strong>same reusable address</strong></p><ArrowDown size={16} />
          <p>Payments can be grouped directly by that address</p>
        </div>
        <div className={incognito ? 'comparison-mode selected' : 'comparison-mode'}>
          <h3><Shield size={18} />Incognito { incognito && <small>Selected</small> }</h3>
          <p>You share a <strong>stealth meta-address</strong></p><ArrowDown size={16} />
          <p>Sender derives a <strong>fresh one-time destination</strong></p><ArrowDown size={16} />
          <p>You recognize the payment using private viewing information</p>
        </div>
      </div>
      <p className="comparison-caveat">Unchanged: amounts, sender inputs and outputs remain public. Timing and transaction-graph analysis can still link activity. This is not a fully private transaction system.</p>
    </section>
  );
}
