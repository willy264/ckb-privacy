import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Shield, Wallet } from 'lucide-react';
import { demoIdentity, normalDemoAddress } from '../demo/fixtures';

export function ReceivingIdentity({ incognito }: { incognito: boolean }) {
  const identity = incognito ? demoIdentity.metaAddress : normalDemoAddress;
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const copyVersion = useRef(0);
  useEffect(() => {
    setCopyState('idle');
    copyVersion.current += 1;
    return () => { copyVersion.current += 1; };
  }, [identity]);

  async function copy() {
    const version = ++copyVersion.current;
    try {
      await navigator.clipboard.writeText(identity);
      if (version === copyVersion.current) setCopyState('copied');
    } catch {
      if (version === copyVersion.current) setCopyState('failed');
    }
  }

  return (
    <section className={`receiving-identity ${incognito ? 'is-incognito' : ''}`} aria-label="Your receiving identity">
      <div className="identity-heading">
        {incognito ? <Shield size={18} /> : <Wallet size={18} />}
        <h2>{incognito ? 'Stealth receiving identity' : 'Normal receiving address'}</h2>
        <button type="button" className="button-text" onClick={copy} aria-label="Copy receiving identity">
          {copyState === 'copied' ? <Check size={15} /> : <Copy size={15} />}
          {copyState === 'copied' ? 'Copied' : 'Copy'}
        </button>
      </div>
      <code data-testid="receiving-identity">{identity}</code>
      <p>{incognito
        ? 'Share this meta-address. A sender derives a fresh one-time destination for each payment. Your private viewing information recognizes the match.'
        : 'Share this reusable address. Payments sent to the same address can be directly grouped together.'}</p>
      <span className="mini-note">Public demo identity · do not send assets</span>
      <span role="status" className={copyState === 'failed' ? 'copy-failure' : 'sr-only'}>
        {copyState === 'copied' ? 'Receiving identity copied.' : copyState === 'failed' ? 'Clipboard unavailable. Select the identity above and copy it manually.' : ''}
      </span>
    </section>
  );
}
