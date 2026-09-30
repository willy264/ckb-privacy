import type { Hex } from "./types.js";

/** Source-derived testnet coordinates; their current chain state is NOT verified here. */
export const TESTNET_STEALTH_LOCK = Object.freeze({
  codeHash: "0x0dc965b5bfb6db2759275ad7d92ee502e10955cca789d001af03e3576cfe3f1c" as Hex,
  hashType: "type" as const,
  network: "testnet" as const,
  verification: "Source configuration only; deployment not independently verified" as const,
});
