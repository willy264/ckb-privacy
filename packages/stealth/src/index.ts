import { ccc } from "@ckb-ccc/core";
import { secp256k1 } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha256";

export type Hex = `0x${string}`;
const Point = secp256k1.ProjectivePoint;
const ORDER = secp256k1.CURVE.n;
const SHANNONS = 100_000_000n;
const MAX_CAPACITY = (1n << 64n) - 1n;

/** Source-derived testnet coordinates; their current chain state is NOT verified here. */
export const TESTNET_STEALTH_LOCK = Object.freeze({
  codeHash: "0x0dc965b5bfb6db2759275ad7d92ee502e10955cca789d001af03e3576cfe3f1c" as Hex,
  hashType: "type" as const,
  network: "testnet" as const,
  verification: "Source configuration only; deployment not independently verified" as const,
});

export const PRIVACY_DISCLOSURE = Object.freeze([
  "The recipient's reusable identity is not written into the one-time output lock.",
  "Amounts and sender inputs are NOT hidden.",
  "The ephemeral public key, one-time lock, outputs and later spending remain public.",
  "Fresh change avoids reusing an address; transaction graphs and amounts can still correlate it.",
  "Timing, network metadata and amount correlation are not concealed.",
  "This demo uses PUBLIC fixture keys and SIMULATED payments. Never send assets to its addresses.",
]);

export class StealthError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "StealthError";
  }
}

function fail(code: string, message: string): never {
  throw new StealthError(code, message);
}

function bytes(value: string, length: number, field: string): Uint8Array {
  const normalized = value.startsWith("0x") ? value.slice(2) : value;
  if (normalized.length !== length * 2 || !/^[0-9a-f]+$/i.test(normalized)) {
    fail("INVALID_ENCODING", `${field} must be exactly ${length} bytes of hexadecimal.`);
  }
  return Uint8Array.from(normalized.match(/../g)!, (part) => Number.parseInt(part, 16));
}

function hex(value: Uint8Array): Hex {
  return `0x${Array.from(value, (v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function scalar(value: string, field: string): Uint8Array {
  const result = bytes(value, 32, field);
  if (!secp256k1.utils.isValidPrivateKey(result)) {
    fail("INVALID_KEY", `${field} must be a non-zero secp256k1 scalar below the curve order.`);
  }
  return result;
}

function publicKey(value: string, field: string): Uint8Array {
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

function scalarBytes(value: bigint): Uint8Array {
  return bytes(value.toString(16).padStart(64, "0"), 32, "scalar");
}

/** Obscell uses the libsecp256k1 ECDH default hash, then a second SHA-256. */
function tweak(point: Uint8Array, secret: Uint8Array): bigint {
  const sharedPoint = secp256k1.getSharedSecret(secret, point, true);
  const digest = sha256(sha256(sharedPoint));
  const result = BigInt(hex(digest));
  if (result === 0n || result >= ORDER) {
    fail("INVALID_TWEAK", "The derived tweak is not a valid scalar; use a fresh ephemeral key.");
  }
  return result;
}

function addTweak(spendPublicKey: Uint8Array, value: bigint): Uint8Array {
  const result = Point.fromHex(spendPublicKey).add(Point.BASE.multiply(value));
  if (result.equals(Point.ZERO)) fail("INVALID_TWEAK", "The derived point is infinity.");
  return result.toRawBytes(true);
}

function pubkeyHash(pub: Uint8Array): string {
  return ccc.hashCkb(pub).slice(2, 42);
}

function assertLock(lockLike: ccc.ScriptLike): ccc.Script {
  const lock = ccc.Script.from(lockLike);
  if (lock.codeHash !== TESTNET_STEALTH_LOCK.codeHash || lock.hashType !== TESTNET_STEALTH_LOCK.hashType) {
    fail("WRONG_LOCK", "The output does not use the configured testnet stealth lock.");
  }
  bytes(lock.args, 53, "Stealth lock arguments");
  publicKey(lock.args.slice(0, 68), "Ephemeral public key");
  return lock;
}

function addressFor(lock: ccc.Script): string {
  return ccc.Address.from({ script: lock, prefix: "ckt" }).toString();
}

export interface StealthMetaAddress {
  viewPublicKey: Hex;
  spendPublicKey: Hex;
}

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

export interface DemoIdentity extends StealthMetaAddress {
  /** PUBLIC fixture keys; not a wallet identity and never suitable for assets. */
  viewKey: Hex;
  spendKey: Hex;
  metaAddress: Hex;
}

/** Deliberately public deterministic keys. Real applications must supply secure key custody. */
export function createDemoIdentity(): DemoIdentity {
  const viewKey = `0x${"0".repeat(63)}1` as Hex;
  const spendKey = `0x${"0".repeat(63)}2` as Hex;
  const viewPublicKey = hex(secp256k1.getPublicKey(scalar(viewKey, "View key"), true));
  const spendPublicKey = hex(secp256k1.getPublicKey(scalar(spendKey, "Spend key"), true));
  return { viewKey, spendKey, viewPublicKey, spendPublicKey, metaAddress: encodeStealthMetaAddress({ viewPublicKey, spendPublicKey }) };
}

export interface StealthPayment {
  metaAddress: Hex;
  ephemeralPublicKey: Hex;
  oneTimePublicKey: Hex;
  lock: ccc.Script;
  address: string;
}

/**
 * Derive the actual ECDH one-time lock locally. The optional ephemeral scalar is
 * ONLY for reproducible vectors; production callers must leave it unspecified.
 * Address encoding does not verify deployment or establish chain settlement.
 */
export function deriveStealthPayment(
  metaAddress: string,
  options: { ephemeralPrivateKey?: string } = {},
): StealthPayment {
  const decoded = decodeStealthMetaAddress(metaAddress);
  const ephemeral = options.ephemeralPrivateKey === undefined
    ? secp256k1.utils.randomPrivateKey()
    : scalar(options.ephemeralPrivateKey, "Ephemeral private key");
  const ephemeralPublicKey = hex(secp256k1.getPublicKey(ephemeral, true));
  const oneTimePublicKey = hex(addTweak(
    publicKey(decoded.spendPublicKey, "Spend public key"),
    tweak(publicKey(decoded.viewPublicKey, "View public key"), ephemeral),
  ));
  ephemeral.fill(0);
  const lock = ccc.Script.from({
    codeHash: TESTNET_STEALTH_LOCK.codeHash,
    hashType: TESTNET_STEALTH_LOCK.hashType,
    args: `${ephemeralPublicKey}${pubkeyHash(bytes(oneTimePublicKey, 33, "One-time public key"))}`,
  });
  return { metaAddress: encodeStealthMetaAddress(decoded), ephemeralPublicKey, oneTimePublicKey, lock, address: addressFor(lock) };
}

/** Generate fresh CSPRNG-backed change; never reuses the payment's ephemeral key. */
export function deriveFreshChange(metaAddress: string): StealthPayment {
  return deriveStealthPayment(metaAddress);
}

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

function assertCapacity(capacity: bigint, lock: ccc.Script): void {
  if (typeof capacity !== "bigint" || capacity <= 0n || capacity > MAX_CAPACITY) {
    fail("INVALID_AMOUNT", "Capacity must be positive and fit in u64.");
  }
  const minimum = BigInt(8 + lock.occupiedSize) * SHANNONS;
  if (capacity < minimum) fail("INSUFFICIENT_CAPACITY", `This empty-data stealth output needs at least ${minimum / SHANNONS} CKB.`);
}

/** No outpoint or chain transaction identifier exists for a simulated fixture. */
export interface FixturePayment {
  id: string;
  source: "SIMULATED";
  lock: ccc.Script;
  capacity: bigint;
  outputData: "0x";
}

export function createFixturePayment(payment: StealthPayment, capacityCkb: string, id = "local-payment-1"): FixturePayment {
  const lock = assertLock(payment.lock);
  const capacity = parseCapacity(capacityCkb);
  assertCapacity(capacity, lock);
  if (!/^[a-z][a-z0-9-]{0,63}$/.test(id)) fail("INVALID_ID", "Use a short local fixture label, not a transaction hash.");
  return { id, source: "SIMULATED", lock: lock.clone(), capacity, outputData: "0x" };
}

export interface DetectedPayment extends FixturePayment {
  oneTimePublicKey: Hex;
  address: string;
}

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

export interface SendDraft {
  source: "SIMULATED";
  transaction: ccc.Transaction;
  amountCkb: string;
  outputAddress: string;
  steps: readonly string[];
}

/** Actual CCC output serialization, but no invented inputs, fee completion or signatures. */
export function buildSendDraft(payment: StealthPayment, capacityCkb: string): SendDraft {
  const output = createFixturePayment(payment, capacityCkb);
  return {
    source: "SIMULATED",
    transaction: ccc.Transaction.from({ outputs: [{ capacity: output.capacity, lock: output.lock }], outputsData: ["0x"] }),
    amountCkb: capacityCkb,
    outputAddress: addressFor(output.lock),
    steps: [
      "LOCAL: derive the one-time recipient lock with ECDH",
      "LOCAL: build the unsigned output using ccc.Transaction.from",
      "SIMULATED: transaction.completeInputsByCapacity(signer)",
      "SIMULATED: transaction.completeFeeChangeToLock(signer, freshChange.lock) delegates to completeFee",
      "SIMULATED: signer.sendTransaction(transaction); no signature or broadcast performed",
    ],
  };
}

export interface SpendDraft {
  source: "SIMULATED";
  oneTimePublicKey: Hex;
  destination: StealthPayment;
  change: StealthPayment;
  steps: readonly string[];
}

/**
 * Demonstrates local spend authority and fresh destinations only. A fixture has
 * no live outpoint; do not manufacture a transaction input or mark it spent.
 */
export function prepareSpendDraft(
  payment: DetectedPayment, identity: DemoIdentity, destinationMetaAddress: string,
): SpendDraft {
  if (payment.source !== "SIMULATED") fail("INVALID_FIXTURE", "Only simulated payments are accepted by this demo.");
  const expectedMeta = encodeStealthMetaAddress({
    viewPublicKey: hex(secp256k1.getPublicKey(scalar(identity.viewKey, "View key"), true)),
    spendPublicKey: hex(secp256k1.getPublicKey(scalar(identity.spendKey, "Spend key"), true)),
  });
  if (encodeStealthMetaAddress(decodeStealthMetaAddress(identity.metaAddress)) !== expectedMeta) {
    fail("INVALID_IDENTITY", "The change meta-address must belong to the supplied view/spend keys.");
  }
  assertCapacity(payment.capacity, assertLock(payment.lock));
  const secret = scalar(deriveSpendKey(payment.lock, identity.viewKey, identity.spendKey), "One-time spend key");
  const oneTimePublicKey = hex(secp256k1.getPublicKey(secret, true));
  secret.fill(0);
  return {
    source: "SIMULATED",
    oneTimePublicKey,
    destination: deriveStealthPayment(destinationMetaAddress),
    change: deriveFreshChange(identity.metaAddress),
    steps: [
      "LOCAL: verify view/spend keys authorize the detected one-time lock",
      "LOCAL: derive a new recipient output and a separate fresh change address",
      "SIMULATED: select a live outpoint and complete capacity/fees with CCC",
      "SIMULATED: stealth witness signing; requires a verified lock-specific signer",
      "SIMULATED: broadcast and settlement are not performed",
    ],
  };
}

/** Fail closed: this local prototype has no verified live signer/deployment adapter. */
export function broadcastStealthTransaction(): never {
  return fail("LIVE_UNAVAILABLE", "Live signing and broadcast are unavailable. Validate deployment, implement the lock-specific signer and testnet lifecycle first.");
}
