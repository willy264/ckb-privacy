import type { ccc } from "@ckb-ccc/core";
import { fail } from "./errors.js";

const SHANNONS = 100_000_000n;
const MAX_CAPACITY = (1n << 64n) - 1n;

/** Strict base-10 CKB amount, at most eight decimals, within the chain's u64 capacity. */
export function parseCapacity(value: string): bigint {
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,8})?$/.test(value) || value.length > 30) {
    fail("INVALID_AMOUNT", "Use a positive CKB amount with at most eight decimal places.");
  }
  const [whole, fraction = ""] = value.split(".");
  const amount = BigInt(whole) * SHANNONS + BigInt(fraction.padEnd(8, "0"));
  if (amount <= 0n || amount > MAX_CAPACITY) fail("INVALID_AMOUNT", "Capacity must be positive and fit in u64.");
  return amount;
}

/** Internal output validation shared by transaction drafts and local scanning. */
export function assertCapacity(capacity: bigint, lock: ccc.Script): void {
  if (typeof capacity !== "bigint" || capacity <= 0n || capacity > MAX_CAPACITY) {
    fail("INVALID_AMOUNT", "Capacity must be positive and fit in u64.");
  }
  const minimum = BigInt(8 + lock.occupiedSize) * SHANNONS;
  if (capacity < minimum) fail("INSUFFICIENT_CAPACITY", `This empty-data stealth output needs at least ${minimum / SHANNONS} CKB.`);
}
