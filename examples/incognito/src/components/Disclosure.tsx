import { Eye, Info } from 'lucide-react';

export function Disclosure({ incognito, expanded = false }: { incognito: boolean; expanded?: boolean }) {
  return (
    <section
      className={`card disclosure ${expanded ? 'disclosure-expanded' : ''}`}
      data-testid={expanded ? 'disclosure-detail' : 'disclosure-panel'}
      aria-label="Disclosure panel"
    >
      <div className="card-heading">
        <span className="icon-box"><Eye size={20} /></span>
        <div><span className="eyebrow">KNOW WHAT IS VISIBLE</span><h2>Disclosure panel</h2></div>
      </div>
      <p className="card-intro">
        A one-time receiving address changes what is linked. It does not make the entire transaction private.
      </p>
      <dl className="disclosure-list">
        <div>
          <dt>Recipient identity</dt>
          <dd className={incognito ? 'status-blue' : 'status-muted'}>
            {incognito ? 'NOT IN THE OUTPUT' : 'REUSABLE ADDRESS'}
          </dd>
        </div>
        <div><dt>Transfer amount</dt><dd>NOT HIDDEN</dd></div>
        <div><dt>Sender inputs</dt><dd>NOT HIDDEN</dd></div>
        <div><dt>Outputs & transaction graph</dt><dd>OBSERVABLE</dd></div>
        <div><dt>Ephemeral public key</dt><dd>{incognito ? 'PUBLIC' : 'NOT USED'}</dd></div>
        <div><dt>Timing & network metadata</dt><dd>NOT PROTECTED</dd></div>
      </dl>
      <div className="disclosure-note">
        <Info size={17} />
        <p>Stealth addresses <strong>reduce direct recipient linkage</strong>. Amount, timing, network and transaction-graph analysis can still reveal relationships.</p>
      </div>
      {expanded && (
        <div className="disclosure-explanation">
          <h3>What a chain observer would see</h3>
          <p>
            {incognito
              ? "The proposed stealth send publishes a one-time lock, its ephemeral public key, the output capacity and the consumed sender inputs. The recipient's reusable meta-address is not embedded in that output."
              : 'Normal CCC sending publishes the reusable recipient address, output capacity and consumed sender inputs. No ephemeral key is used. Enable Incognito mode to derive a one-time recipient instead.'}
          </p>
          <h3>What this demonstration proves</h3>
          <p>Local key derivation, fixture detection and unsigned CCC output construction run in this browser. Scanning is against public local fixtures. Input completion, fee calculation, signing and settlement are SIMULATED. This is not deployment evidence.</p>
          <h3>Fresh change reduces address reuse</h3>
          <p>With Incognito mode, a separately derived change address avoids sending change straight back to a reusable address. It does not hide the amount or break the transaction's input/output relationships.</p>
        </div>
      )}
    </section>
  );
}
