import { useRef, useState } from 'react';
import { buildSendDraft, deriveFreshChange, deriveStealthPayment } from '@ckb-ccc/stealth';
import { demoIdentity, normalDemoAddress } from '../demo/fixtures';
import { buildNormalSendDraft, displayError, serializeOutputDraft } from '../demo/transactions';

type Payment = ReturnType<typeof deriveStealthPayment>;

export function useSendDemo() {
  const [incognito, setIncognito] = useState(false);
  const [metaAddress, setMetaAddress] = useState<string>(demoIdentity.metaAddress);
  const [normalAddress, setNormalAddress] = useState(normalDemoAddress);
  const [amount, setAmount] = useState('200');
  const [payment, setPayment] = useState<Payment>();
  const [change, setChange] = useState<Payment>();
  const [draft, setDraft] = useState<string>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const buildVersion = useRef(0);

  function clearDraft() {
    buildVersion.current += 1;
    setPayment(undefined);
    setDraft(undefined);
    setChange(undefined);
    setError('');
    setBusy(false);
  }

  function toggleMode() {
    setIncognito(value => !value);
    clearDraft();
  }

  function useDemoRecipient() {
    setMetaAddress(demoIdentity.metaAddress);
    setNormalAddress(normalDemoAddress);
    clearDraft();
  }

  function updateMetaAddress(value: string) {
    setMetaAddress(value);
    clearDraft();
  }

  function updateNormalAddress(value: string) {
    setNormalAddress(value);
    clearDraft();
  }

  function updateAmount(value: string) {
    setAmount(value);
    clearDraft();
  }

  function derive() {
    clearDraft();
    try {
      setPayment(deriveStealthPayment(metaAddress));
    } catch (cause) {
      setError(displayError(cause));
    }
  }

  async function buildDraft() {
    const version = ++buildVersion.current;
    setError('');
    setBusy(true);
    try {
      if (incognito && !payment) {
        throw new Error('Derive a one-time address before building the transaction preview.');
      }

      const transaction = incognito && payment
        ? buildSendDraft(payment, amount).transaction
        : await buildNormalSendDraft(normalAddress, amount);

      // Ignore an outdated async address parse if the form or mode has changed.
      if (version !== buildVersion.current) return;
      setChange(incognito ? deriveFreshChange(demoIdentity.metaAddress) : undefined);
      setDraft(serializeOutputDraft(transaction));
    } catch (cause) {
      if (version !== buildVersion.current) return;
      setDraft(undefined);
      setChange(undefined);
      setError(displayError(cause));
    } finally {
      if (version === buildVersion.current) setBusy(false);
    }
  }

  function reset() {
    setIncognito(false);
    setMetaAddress(demoIdentity.metaAddress);
    setNormalAddress(normalDemoAddress);
    setAmount('200');
    clearDraft();
  }

  return {
    incognito, metaAddress, normalAddress, amount, payment, change, draft, error, busy,
    toggleMode, useDemoRecipient, updateMetaAddress, updateNormalAddress, updateAmount,
    derive, buildDraft, reset,
  };
}

export type SendDemo = ReturnType<typeof useSendDemo>;
