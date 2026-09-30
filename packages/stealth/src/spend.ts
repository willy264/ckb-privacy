import type { ccc } from "@ckb-ccc/core";
import { secp256k1 } from "@noble/curves/secp256k1";
import { fail } from "./errors.js";
import { ORDER, scalar, tweak } from "./internal/curve.js";
import { bytes, hex, scalarBytes } from "./internal/encoding.js";
import { assertLock, pubkeyHash } from "./internal/lock.js";
import type { Hex } from "./types.js";

/**
 * Sensitive low-level helper. Never log/store its result. Verifies ownership of
 * the whole configured lock before returning the one-time secret scalar.
 */
export function deriveSpendKey(lockLike: ccc.ScriptLike, viewKey: string, spendKey: string): Hex {
  const lock = assertLock(lockLike);
  const view = scalar(viewKey, "View key");
  const spend = scalar(spendKey, "Spend key");
  const args = bytes(lock.args, 53, "Stealth lock arguments");
  const secretValue = (BigInt(hex(spend)) + tweak(args.slice(0, 33), view)) % ORDER;
  if (secretValue === 0n) fail("NOT_OWNED", "The supplied keys do not authorize this output.");
  const result = scalarBytes(secretValue);
  if (pubkeyHash(secp256k1.getPublicKey(result, true)) !== hex(args.slice(33)).slice(2)) {
    fail("NOT_OWNED", "The supplied keys do not authorize this output.");
  }
  return hex(result);
}
