import { RefreshCw } from 'lucide-react';

type ChangeHygieneProps = { enabled: boolean; hasFreshChange: boolean };

export function ChangeHygiene({ enabled, hasFreshChange }: ChangeHygieneProps) {
  return (
    <section className="card change-card">
      <div className="card-heading">
        <span className="icon-box"><RefreshCw size={19} /></span>
        <div><span className="eyebrow">CHANGE HYGIENE</span><h2>A fresh way back.</h2></div>
      </div>
      <div className="change-indicator">
        <span className="change-dot" />
        <strong>
          {hasFreshChange
            ? 'Fresh change address derived'
            : enabled ? 'Fresh change on preview' : 'Enable incognito for fresh change'}
        </strong>
      </div>
      <p>
        {enabled
          ? 'Change targets a separately derived address instead of a reusable identity. Its capacity remains public.'
          : 'Normal mode keeps the app’s existing change policy. Incognito adds an optional fresh-address helper.'}
      </p>
      <span className="mini-note">
        {hasFreshChange ? 'SIMULATED · destination only, no completed fee' : 'SIMULATED · no funded transaction'}
      </span>
    </section>
  );
}
