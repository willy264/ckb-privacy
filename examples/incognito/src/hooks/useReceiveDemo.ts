import { useEffect, useRef, useState } from 'react';
import { prepareSpendDraft, scanStealthPayments } from '@ckb-ccc/stealth';
import { demoIdentity, incomingFixtures, unrelatedDemoViewKey } from '../demo/fixtures';
import { displayError } from '../demo/transactions';

type Match = ReturnType<typeof scanStealthPayments>['matches'][number];
export type FixtureProfile = 'matching' | 'unrelated';

export function useReceiveDemo() {
  const [profile, setProfile] = useState<FixtureProfile>('matching');
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [rejected, setRejected] = useState(0);
  const [error, setError] = useState('');
  const [spend, setSpend] = useState<ReturnType<typeof prepareSpendDraft>>();
  const [busy, setBusy] = useState(false);
  const scanVersion = useRef(0);
  const viewKey = profile === 'matching' ? demoIdentity.viewKey : unrelatedDemoViewKey;

  useEffect(() => () => { scanVersion.current += 1; }, []);

  function clearResults() {
    scanVersion.current += 1;
    setMatches(null);
    setRejected(0);
    setSpend(undefined);
    setError('');
    setBusy(false);
  }

  function updateProfile(value: FixtureProfile) {
    setProfile(value);
    clearResults();
  }

  function useDemoKey() {
    updateProfile('matching');
  }

  async function scan() {
    const version = ++scanVersion.current;
    setError('');
    setMatches(null);
    setRejected(0);
    setSpend(undefined);
    setBusy(true);
    try {
      // Give the browser time to display "Checking fixtures". This is a local
      // UX transition, not indexer latency or an assertion of chain activity.
      await new Promise<void>(resolve => window.setTimeout(resolve, 180));
      if (version !== scanVersion.current) return;
      const result = scanStealthPayments(incomingFixtures, viewKey, demoIdentity.spendPublicKey);
      setMatches(result.matches);
      setRejected(incomingFixtures.length - result.matches.length);
    } catch (cause) {
      if (version !== scanVersion.current) return;
      setMatches(null);
      setError(displayError(cause));
    } finally {
      if (version === scanVersion.current) setBusy(false);
    }
  }

  function prepareSpend(match: Match) {
    setError('');
    if (busy || !matches?.includes(match)) {
      setSpend(undefined);
      setError('Scan the demo fixtures before preparing a spend preview.');
      return;
    }
    try {
      setSpend(prepareSpendDraft(match, demoIdentity, demoIdentity.metaAddress));
    } catch (cause) {
      setSpend(undefined);
      setError(displayError(cause));
    }
  }

  function reset() {
    useDemoKey();
  }

  return { profile, viewKey, matches, rejected, error, spend, busy, updateProfile, useDemoKey, scan, prepareSpend, reset };
}

export type ReceiveDemo = ReturnType<typeof useReceiveDemo>;
