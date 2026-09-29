import { ccc } from '@ckb-ccc/core';
import { parseCapacity } from '@ckb-ccc/stealth';
import { localClient } from './fixtures';

export function displayError(error: unknown): string {
  return error instanceof Error ? error.message : 'The input could not be validated.';
}

/** Local output construction only: no input discovery, fee completion or signing. */
export async function buildNormalSendDraft(addressText: string, amount: string) {
  const address = await ccc.Address.fromString(addressText, localClient);
  const capacity = parseCapacity(amount);
  const output = ccc.CellOutput.from({ lock: address.script, capacity });

  if (capacity < BigInt(output.occupiedSize) * 100_000_000n) {
    throw new Error('The amount is below the occupied capacity required for this output.');
  }

  return ccc.Transaction.from({ outputs: [output], outputsData: ['0x'] });
}

export function serializeOutputDraft(transaction: ccc.Transaction): string {
  return JSON.stringify({
    outputs: transaction.outputs,
    outputsData: transaction.outputsData,
    inputs: [],
  }, (_key, value) => typeof value === 'bigint' ? `0x${value.toString(16)}` : value, 2);
}
