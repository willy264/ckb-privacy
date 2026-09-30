import { secp256k1 } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha256";
import { fail } from "../errors.js";
import { bytes, hex } from "./encoding.js";

export const Point = secp256k1.ProjectivePoint;
export const ORDER = secp256k1.CURVE.n;

export function scalar(value: string, field: string): Uint8Array {
  const result = bytes(value, 32, field);
  if (!secp256k1.utils.isValidPrivateKey(result)) {
    fail("INVALID_KEY", `${field} must be a non-zero secp256k1 scalar below the curve order.`);
  }
  return result;
}

export function publicKey(value: string, field: string): Uint8Array {
  const result = bytes(value, 33, field);
  if (result[0] !== 2 && result[0] !== 3) {
    fail("INVALID_KEY", `${field} must be a compressed secp256k1 point.`);
  }
  try {
    Point.fromHex(result).assertValidity();
  } catch {
    fail("INVALID_KEY", `${field} is not a secp256k1 point.`);
  }
  return result;
}

/** Obscell uses the libsecp256k1 ECDH default hash, then a second SHA-256. */
export function tweak(point: Uint8Array, secret: Uint8Array): bigint {
  const sharedPoint = secp256k1.getSharedSecret(secret, point, true);
  const digest = sha256(sha256(sharedPoint));
  const result = BigInt(hex(digest));
  if (result === 0n || result >= ORDER) {
    fail("INVALID_TWEAK", "The derived tweak is not a valid scalar; use a fresh ephemeral key.");
  }
  return result;
}

export function addTweak(spendPublicKey: Uint8Array, value: bigint): Uint8Array {
  const result = Point.fromHex(spendPublicKey).add(Point.BASE.multiply(value));
  if (result.equals(Point.ZERO)) fail("INVALID_TWEAK", "The derived point is infinity.");
  return result.toRawBytes(true);
}
