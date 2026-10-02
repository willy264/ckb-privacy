import { ccc } from '@ckb-ccc/core';
import { createDemoIdentity, createFixturePayment, deriveStealthPaymentForTest } from '@ckb-ccc/stealth/testing';

// Public fixture keys only. Never use these identities or addresses for funds.
export const demoIdentity = createDemoIdentity();
// A second public viewing scalar demonstrates a nonmatching fixture profile.
// Neither profile accepts a user's private viewing information.
export const unrelatedDemoViewKey = `0x${'0'.repeat(63)}4`;
export const localClient = new ccc.ClientPublicTestnet();

const normalLock = ccc.Script.from({
  codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
  hashType: 'type',
  args: ccc.hashCkb(demoIdentity.spendPublicKey).slice(0, 42),
});

export const normalDemoAddress = ccc.Address.fromScript(normalLock, localClient).toString();

const fixturePayment = deriveStealthPaymentForTest(
  demoIdentity.metaAddress,
  `0x${(13).toString(16).padStart(64, '0')}`,
);
const unrelatedArgs = `${fixturePayment.lock.args.slice(0, -2)}${
  fixturePayment.lock.args.endsWith('00') ? '01' : '00'
}`;

export const incomingFixtures = [
  createFixturePayment(fixturePayment, '200', 'fixture-incoming-01'),
  // A validly encoded output that does not belong to this recipient.
  createFixturePayment({
    ...fixturePayment,
    lock: ccc.Script.from({ ...fixturePayment.lock, args: unrelatedArgs }),
  }, '200', 'fixture-unrelated-02'),
];
