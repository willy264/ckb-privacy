import { publicKey } from "./internal/curve.js";
import { bytes, hex } from "./internal/encoding.js";
import type { Hex, StealthMetaAddress } from "./types.js";

/** Raw Obscell format: two compressed points (view, spend), 66 bytes. No checksum. */
export function encodeStealthMetaAddress(value: StealthMetaAddress): Hex {
  return `0x${hex(publicKey(value.viewPublicKey, "View public key")).slice(2)}${hex(publicKey(value.spendPublicKey, "Spend public key")).slice(2)}`;
}

export function decodeStealthMetaAddress(value: string): StealthMetaAddress {
  const raw = bytes(value, 66, "Stealth meta-address");
  const viewPublicKey = hex(publicKey(hex(raw.slice(0, 33)), "View public key"));
  const spendPublicKey = hex(publicKey(hex(raw.slice(33)), "Spend public key"));
  return { viewPublicKey, spendPublicKey };
}
