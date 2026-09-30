import type { ccc } from "@ckb-ccc/core";

export type Hex = `0x${string}`;

export interface StealthMetaAddress {
  viewPublicKey: Hex;
  spendPublicKey: Hex;
}

export interface StealthIdentity extends StealthMetaAddress {
  /** Sensitive keys; real applications must supply secure custody. */
  viewKey: Hex;
  spendKey: Hex;
  metaAddress: Hex;
}

/** Compatibility name for the public-key fixture identity returned by the testing entry point. */
export type DemoIdentity = StealthIdentity;

export interface StealthPayment {
  metaAddress: Hex;
  ephemeralPublicKey: Hex;
  oneTimePublicKey: Hex;
  lock: ccc.Script;
  address: string;
}

/** No outpoint or chain transaction identifier exists for a simulated fixture. */
export interface FixturePayment {
  id: string;
  source: "SIMULATED";
  lock: ccc.Script;
  capacity: bigint;
  outputData: "0x";
}

export interface DetectedPayment extends FixturePayment {
  oneTimePublicKey: Hex;
  address: string;
}

export interface SendDraft {
  source: "SIMULATED";
  transaction: ccc.Transaction;
  amountCkb: string;
  outputAddress: string;
  steps: readonly string[];
}

export interface SpendDraft {
  source: "SIMULATED";
  oneTimePublicKey: Hex;
  destination: StealthPayment;
  change: StealthPayment;
  steps: readonly string[];
}
