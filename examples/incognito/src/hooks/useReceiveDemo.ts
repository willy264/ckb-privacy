import { useState } from 'react';
import { prepareSpendDraft, scanStealthPayments } from '@ckb-ccc/stealth';
import { demoIdentity, incomingFixtures } from '../demo/fixtures';
import { displayError } from '../demo/transactions';

type Match = ReturnType<typeof scanStealthPayments>['matches'][number];

export function useReceiveDemo() {
  const [viewKey, setViewKey] = useState<string>(demoIdentity.viewKey);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [rejected, setRejected] = useState(0);
  const [error, setError] = useState('');
  const [spend, setSpend] = useState<ReturnType<typeof prepareSpendDraft>>();

  function updateViewKey(value: string) {
    setViewKey(value);
    setMatches(null);
    setSpend(undefined);
    setError('');
  }

  function useDemoKey() {
    updateViewKey(demoIdentity.viewKey);
  }

  function scan() {
    setError('');
    setSpend(undefined);
    try {
      const result = scanStealthPayments(incomingFixtures, viewKey, demoIdentity.spendPublicKey);
      setMatches(result.matches);
      setRejected(incomingFixtures.length - result.matches.length);
    } catch (cause) {
      setMatches(null);
      setError(displayError(cause));
    }
  }

  function prepareSpend(match: Match) {
    setError('');
    try {
      setSpend(prepareSpendDraft(match, demoIdentity, demoIdentity.metaAddress));
    } catch (cause) {
      setSpend(undefined);
      setError(displayError(cause));
    }
  }

  function reset() {
    useDemoKey();
    setRejected(0);
  }

  return { viewKey, matches, rejected, error, spend, updateViewKey, useDemoKey, scan, prepareSpend, reset };
}

export type ReceiveDemo = ReturnType<typeof useReceiveDemo>;
