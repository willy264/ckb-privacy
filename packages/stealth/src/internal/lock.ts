import { ccc } from "@ckb-ccc/core";
import { TESTNET_STEALTH_LOCK } from "../constants.js";
import { fail } from "../errors.js";
import { publicKey } from "./curve.js";
import { bytes } from "./encoding.js";

export function pubkeyHash(pub: Uint8Array): string {
  return ccc.hashCkb(pub).slice(2, 42);
}

export function assertLock(lockLike: ccc.ScriptLike): ccc.Script {
  const lock = ccc.Script.from(lockLike);
  if (lock.codeHash !== TESTNET_STEALTH_LOCK.codeHash || lock.hashType !== TESTNET_STEALTH_LOCK.hashType) {
    fail("WRONG_LOCK", "The output does not use the configured testnet stealth lock.");
  }
  bytes(lock.args, 53, "Stealth lock arguments");
  publicKey(lock.args.slice(0, 68), "Ephemeral public key");
  return lock;
}

export function addressFor(lock: ccc.Script): string {
  return ccc.Address.from({ script: lock, prefix: "ckt" }).toString();
}
