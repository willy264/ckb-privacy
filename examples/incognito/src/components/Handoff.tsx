import { Layers, RefreshCw, Wallet } from 'lucide-react';
import { Badge } from './Badge';

const steps = [
  { icon: Layers, name: 'completeInputs', detail: 'Select sender-owned inputs' },
  { icon: RefreshCw, name: 'completeFee', detail: 'Balance capacity & route change' },
  { icon: Wallet, name: 'signer', detail: 'Request wallet approval' },
];

export function Handoff({ built }: { built: boolean }) {
  return (
    <section className="handoff" aria-label="CCC transaction hand-off">
      <div className="section-heading">
        <div><span className="eyebrow">THE EXISTING CCC FLOW</span><h3>CCC takes it from here</h3></div>
        <Badge tone="amber">SIMULATED</Badge>
      </div>
      <div className="handoff-steps">
        {steps.map(({ icon: Icon, name, detail }, index) => (
          <div key={name} className="handoff-step">
            <span className="step-number">{index + 1}</span>
            <Icon size={17} /><strong>{name}</strong><small>{detail}</small>
          </div>
        ))}
      </div>
      <p className="microcopy">
        {built ? 'A real unsigned CCC output draft is ready locally. ' : ''}
        Input selection, fee completion and signing are illustrated only. No wallet is connected; nothing is signed or submitted.
      </p>
    </section>
  );
}
