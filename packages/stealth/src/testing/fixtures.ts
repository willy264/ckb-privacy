import { secp256k1 } from "@noble/curves/secp256k1";
import { assertCapacity, parseCapacity } from "../capacity.js";
import { fail } from "../errors.js";
import { scalar } from "../internal/curve.js";
import { derivePayment } from "../internal/derive-payment.js";
import { hex } from "../internal/encoding.js";
import { assertLock } from "../internal/lock.js";
import { encodeStealthMetaAddress } from "../meta-address.js";
import type { DemoIdentity, FixturePayment, Hex, StealthPayment } from "../types.js";

/** Deliberately public deterministic keys. Real applications must supply secure key custody. */
export function createDemoIdentity(): DemoIdentity {
  const viewKey = `0x${"0".repeat(63)}1` as Hex;
  const spendKey = `0x${"0".repeat(63)}2` as Hex;
  const viewPublicKey = hex(secp256k1.getPublicKey(scalar(viewKey, "View key"), true));
  const spendPublicKey = hex(secp256k1.getPublicKey(scalar(spendKey, "Spend key"), true));
  return { viewKey, spendKey, viewPublicKey, spendPublicKey, metaAddress: encodeStealthMetaAddress({ viewPublicKey, spendPublicKey }) };
}

/** Reproducible vectors only. Reusing a scalar defeats one-time-address freshness. */
export function deriveStealthPaymentForTest(metaAddress: string, ephemeralPrivateKey: string): StealthPayment {
  return derivePayment(metaAddress, scalar(ephemeralPrivateKey, "Ephemeral private key"));
}

export function createFixturePayment(payment: StealthPayment, capacityCkb: string, id = "local-payment-1"): FixturePayment {
  const lock = assertLock(payment.lock);
  const capacity = parseCapacity(capacityCkb);
  assertCapacity(capacity, lock);
  if (!/^[a-z][a-z0-9-]{0,63}$/.test(id)) fail("INVALID_ID", "Use a short local fixture label, not a transaction hash.");
  return { id, source: "SIMULATED", lock: lock.clone(), capacity, outputData: "0x" };
}
