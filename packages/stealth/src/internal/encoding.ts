import { fail } from "../errors.js";
import type { Hex } from "../types.js";

export function bytes(value: string, length: number, field: string): Uint8Array {
  const normalized = value.startsWith("0x") ? value.slice(2) : value;
  if (normalized.length !== length * 2 || !/^[0-9a-f]+$/i.test(normalized)) {
    fail("INVALID_ENCODING", `${field} must be exactly ${length} bytes of hexadecimal.`);
  }
  return Uint8Array.from(normalized.match(/../g)!, (part) => Number.parseInt(part, 16));
}

export function hex(value: Uint8Array): Hex {
  return `0x${Array.from(value, (v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export function scalarBytes(value: bigint): Uint8Array {
  return bytes(value.toString(16).padStart(64, "0"), 32, "scalar");
}
