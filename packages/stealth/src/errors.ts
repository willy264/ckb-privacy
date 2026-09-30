export class StealthError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "StealthError";
  }
}

/** Internal convenience helper; the package exports the error class only. */
export function fail(code: string, message: string): never {
  throw new StealthError(code, message);
}
