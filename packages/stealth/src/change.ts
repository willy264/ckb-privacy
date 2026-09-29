import { deriveStealthPayment } from "./derivation.js";
import type { StealthPayment } from "./types.js";

/** Generate fresh CSPRNG-backed change; never reuses the payment's ephemeral key. */
export function deriveFreshChange(metaAddress: string): StealthPayment {
  return deriveStealthPayment(metaAddress);
}
