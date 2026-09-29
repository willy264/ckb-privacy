import { assertCapacity } from "./capacity.js";
import { fail } from "./errors.js";
import { addTweak, publicKey, scalar, tweak } from "./internal/curve.js";
import { bytes, hex } from "./internal/encoding.js";
import { addressFor, assertLock, pubkeyHash } from "./internal/lock.js";
import type { DetectedPayment, FixturePayment } from "./types.js";

/** View-only matching over supplied fixtures; does not fetch an indexer or claim chain state. */
export function scanStealthPayments(
  records: readonly FixturePayment[], viewKey: string, spendPublicKey: string,
): { matches: DetectedPayment[]; rejected: number } {
  const view = scalar(viewKey, "View key");
  const spend = publicKey(spendPublicKey, "Spend public key");
  const matches: DetectedPayment[] = [];
  const seen = new Set<string>();
  let rejected = 0;
  for (const record of records) {
    try {
      if (record.source !== "SIMULATED" || record.outputData !== "0x" || seen.has(record.id)) {
        fail("INVALID_FIXTURE", "Expected a unique empty-data local fixture.");
      }
      seen.add(record.id);
      const lock = assertLock(record.lock);
      assertCapacity(record.capacity, lock);
      const args = bytes(lock.args, 53, "Stealth lock arguments");
      const derived = addTweak(spend, tweak(args.slice(0, 33), view));
      if (pubkeyHash(derived) !== hex(args.slice(33)).slice(2)) continue;
      matches.push({ ...record, lock: lock.clone(), oneTimePublicKey: hex(derived), address: addressFor(lock) });
    } catch {
      rejected++;
    }
  }
  return { matches, rejected };
}
