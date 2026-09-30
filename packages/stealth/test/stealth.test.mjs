import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createECDH, createHash } from "node:crypto";
import test from "node:test";
import { ccc } from "@ckb-ccc/core";
import * as stealth from "@ckb-ccc/stealth";
import {
  TESTNET_STEALTH_LOCK, broadcastStealthTransaction, buildSendDraft,
  decodeStealthMetaAddress,
  deriveFreshChange, deriveSpendKey, deriveStealthPayment, encodeStealthMetaAddress,
  parseCapacity, prepareSpendDraft, scanStealthPayments,
} from "@ckb-ccc/stealth";
import {
  createDemoIdentity, createFixturePayment, deriveStealthPaymentForTest,
} from "@ckb-ccc/stealth/testing";

const vector = JSON.parse(readFileSync(new URL("./vector.json", import.meta.url), "utf8"));
const identity = createDemoIdentity();
const payment = () => deriveStealthPaymentForTest(identity.metaAddress, vector.ephemeralKey);
const key = (n) => `0x${BigInt(n).toString(16).padStart(64, "0")}`;
const errorCode = (code) => (error) => error.code === code;

test("codec round trip uses the existing 66-byte view/spend representation", () => {
  assert.equal(identity.metaAddress, `${vector.viewPublicKey}${vector.spendPublicKey.slice(2)}`);
  assert.deepEqual(decodeStealthMetaAddress(identity.metaAddress), {
    viewPublicKey: vector.viewPublicKey, spendPublicKey: vector.spendPublicKey,
  });
  assert.equal(encodeStealthMetaAddress(decodeStealthMetaAddress(identity.metaAddress.slice(2).toUpperCase())), identity.metaAddress);
});

test("codec rejects truncated, extended, nonhex and off-curve keys", () => {
  for (const input of ["", "0x", identity.metaAddress.slice(0, -2), `${identity.metaAddress}00`, `zz${identity.metaAddress.slice(2)}`]) {
    assert.throws(() => decodeStealthMetaAddress(input), errorCode("INVALID_ENCODING"));
  }
  assert.throws(() => decodeStealthMetaAddress(`0x04${identity.metaAddress.slice(4)}`), errorCode("INVALID_KEY"));
  assert.throws(() => decodeStealthMetaAddress(`0x02${"ff".repeat(32)}${vector.spendPublicKey.slice(2)}`), errorCode("INVALID_KEY"));
});

test("sender derivation matches a frozen independently generated vector", () => {
  const actual = payment();
  assert.equal(actual.ephemeralPublicKey, vector.ephemeralPublicKey);
  assert.equal(actual.oneTimePublicKey, vector.oneTimePublicKey);
  assert.equal(actual.lock.args, vector.args);
  assert.equal(actual.lock.args.length, 108);
  assert.ok(actual.address.startsWith("ckt1"));
  assert.equal(deriveSpendKey(actual.lock, identity.viewKey, identity.spendKey), vector.oneTimeKey);
});

test("Node/OpenSSL independently verifies the double-hashed ECDH and spend public key", () => {
  // view secret is 1: compressed ECDH is precisely the known 3*G public point.
  const hash = (v) => createHash("sha256").update(v).digest();
  const t = hash(hash(Buffer.from(vector.ephemeralPublicKey.slice(2), "hex")));
  assert.equal(`0x${t.toString("hex")}`, vector.tweak);
  assert.notEqual(`0x${hash(Buffer.from(vector.ephemeralPublicKey.slice(2), "hex")).toString("hex")}`, vector.tweak);
  const ecdh = createECDH("secp256k1");
  ecdh.setPrivateKey(Buffer.from(deriveSpendKey(payment().lock, identity.viewKey, identity.spendKey).slice(2), "hex"));
  assert.equal(`0x${ecdh.getPublicKey(null, "compressed").toString("hex")}`, vector.oneTimePublicKey);
});

test("ephemeral scalars reject zero, curve order and wrong lengths", () => {
  for (const secret of [key(0), "0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"]) {
    assert.throws(() => deriveStealthPaymentForTest(identity.metaAddress, secret), errorCode("INVALID_KEY"));
  }
  assert.throws(() => deriveStealthPaymentForTest(identity.metaAddress, "0x01"), errorCode("INVALID_ENCODING"));
});

test("fresh change and repeated sends use distinct one-time locks", () => {
  const addresses = new Set(Array.from({ length: 12 }, () => deriveFreshChange(identity.metaAddress).address));
  assert.equal(addresses.size, 12);
  assert.ok(!addresses.has(payment().address));
});

test("view-only scan detects a matching fixture without the spend secret", () => {
  const fixture = createFixturePayment(payment(), "200");
  const result = scanStealthPayments([fixture], identity.viewKey, identity.spendPublicKey);
  assert.equal(result.rejected, 0);
  assert.equal(result.matches.length, 1);
  assert.equal(result.matches[0].oneTimePublicKey, vector.oneTimePublicKey);
  assert.equal(result.matches[0].capacity, 20_000_000_000n);
  assert.equal(result.matches[0].source, "SIMULATED");
  assert.ok(!("txHash" in result.matches[0]));
  assert.ok(!("spendKey" in result.matches[0]));
});

test("wrong view or spend public keys do not match", () => {
  const records = [createFixturePayment(payment(), "200")];
  assert.equal(scanStealthPayments(records, key(4), identity.spendPublicKey).matches.length, 0);
  assert.equal(scanStealthPayments(records, identity.viewKey, identity.viewPublicKey).matches.length, 0);
  assert.throws(() => scanStealthPayments(records, key(0), identity.spendPublicKey), errorCode("INVALID_KEY"));
});

test("scanner rejects malformed points, deployment mismatch, bad capacity and duplicate records", () => {
  const fixture = createFixturePayment(payment(), "200");
  const malformedPoint = { ...fixture, id: "bad-point", lock: ccc.Script.from({ ...TESTNET_STEALTH_LOCK, args: `0x04${fixture.lock.args.slice(4)}` }) };
  const shortArgs = { ...fixture, id: "short-args", lock: ccc.Script.from({ ...TESTNET_STEALTH_LOCK, args: "0x" }) };
  const wrongLock = { ...fixture, id: "other-lock", lock: ccc.Script.from({ codeHash: `0x${"11".repeat(32)}`, hashType: "type", args: fixture.lock.args }) };
  const tooSmall = { ...fixture, id: "small-cell", capacity: 1n };
  const result = scanStealthPayments([fixture, malformedPoint, shortArgs, wrongLock, tooSmall, fixture], identity.viewKey, identity.spendPublicKey);
  assert.equal(result.matches.length, 1);
  assert.equal(result.rejected, 5);
});

test("tampered lock ownership never grants spending authority", () => {
  const original = payment().lock;
  const tampered = ccc.Script.from({ ...TESTNET_STEALTH_LOCK, args: `${original.args.slice(0, -2)}00` });
  assert.throws(() => deriveSpendKey(tampered, identity.viewKey, identity.spendKey), errorCode("NOT_OWNED"));
  assert.throws(() => deriveSpendKey(original, key(4), identity.spendKey), errorCode("NOT_OWNED"));
  assert.throws(() => deriveSpendKey(original, identity.viewKey, key(4)), errorCode("NOT_OWNED"));
  const badDeployment = ccc.Script.from({ codeHash: `0x${"11".repeat(32)}`, hashType: "type", args: original.args });
  assert.throws(() => deriveSpendKey(badDeployment, identity.viewKey, identity.spendKey), errorCode("WRONG_LOCK"));
});

test("capacity parsing prevents rounding, signs, exponents, overflow and malformed decimals", () => {
  assert.equal(parseCapacity("200.00000001"), 20_000_000_001n);
  assert.equal(parseCapacity("184467440737.09551615"), (1n << 64n) - 1n);
  for (const amount of ["0", "-1", "+1", "1e3", " 200", "0200", "200.", "200.000000001", "NaN", "184467440737.09551616"]) {
    assert.throws(() => parseCapacity(amount), errorCode("INVALID_AMOUNT"));
  }
  assert.throws(() => buildSendDraft(payment(), "93.99999999"), errorCode("INSUFFICIENT_CAPACITY"));
  assert.equal(buildSendDraft(payment(), "94").transaction.outputs[0].capacity, 9_400_000_000n);
});

test("CCC draft contains only the real intended output and no invented chain data", async () => {
  const derived = payment();
  const draft = buildSendDraft(derived, "200");
  assert.ok(draft.transaction instanceof ccc.Transaction);
  assert.equal(draft.transaction.inputs.length, 0);
  assert.equal(draft.transaction.witnesses.length, 0);
  assert.equal(draft.transaction.cellDeps.length, 0);
  assert.equal(draft.transaction.outputs.length, 1);
  assert.equal(draft.transaction.outputs[0].lock.args, vector.args);
  assert.equal(draft.transaction.outputs[0].capacity, 20_000_000_000n);
  assert.deepEqual(draft.transaction.outputsData, ["0x"]);
  assert.ok(!("txHash" in draft));
  assert.ok(!("confirmations" in draft));
  const client = new ccc.ClientPublicTestnet(); // Address decoding performs no RPC.
  assert.equal((await ccc.Address.fromString(draft.outputAddress, client)).script.args, derived.lock.args);
});

test("spend preparation verifies authority and fresh change without marking a fixture spent", () => {
  const fixture = createFixturePayment(payment(), "200");
  const detected = scanStealthPayments([fixture], identity.viewKey, identity.spendPublicKey).matches[0];
  const draft = prepareSpendDraft(detected, identity, identity.metaAddress);
  assert.equal(draft.oneTimePublicKey, vector.oneTimePublicKey);
  assert.notEqual(draft.destination.address, draft.change.address);
  assert.notEqual(draft.change.address, detected.address);
  assert.equal(scanStealthPayments([fixture], identity.viewKey, identity.spendPublicKey).matches.length, 1);
  assert.ok(!("spendKey" in draft));
  assert.ok(!("txHash" in draft));
  assert.throws(() => prepareSpendDraft(detected, { ...identity, metaAddress: `${vector.spendPublicKey}${vector.viewPublicKey.slice(2)}` }, identity.metaAddress), errorCode("INVALID_IDENTITY"));
});

test("live broadcast fails closed", () => {
  assert.throws(() => broadcastStealthTransaction(), errorCode("LIVE_UNAVAILABLE"));
});

test("package entry points keep public fixture keys outside the reusable API", () => {
  for (const demoOnly of ["createDemoIdentity", "createFixturePayment", "deriveStealthPaymentForTest"]) {
    assert.ok(!(demoOnly in stealth), `${demoOnly} must require the testing entry point`);
    assert.ok(!(demoOnly in stealth.ccc), `${demoOnly} must not leak through the CCC namespace`);
  }
  assert.equal(stealth.ccc.deriveStealthPayment, deriveStealthPayment);
  assert.equal(stealth.ccc.deriveSpendKey, deriveSpendKey);
  assert.equal(stealth.ccc.scanStealthPayments, scanStealthPayments);
  assert.equal(stealth.ccc.buildSendDraft, buildSendDraft);
  assert.notEqual(deriveStealthPayment(identity.metaAddress).address, deriveStealthPayment(identity.metaAddress).address);
});
