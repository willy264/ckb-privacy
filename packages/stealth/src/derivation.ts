import { secp256k1 } from "@noble/curves/secp256k1";
import { derivePayment } from "./internal/derive-payment.js";
import type { StealthPayment } from "./types.js";

/**
 * Derive the actual ECDH one-time lock locally using a fresh CSPRNG scalar.
 * Address encoding does not verify deployment or establish chain settlement.
 */
export function deriveStealthPayment(metaAddress: string): StealthPayment {
  return derivePayment(metaAddress, secp256k1.utils.randomPrivateKey());
}
