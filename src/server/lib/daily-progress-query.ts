/** Input validation for the opt-in, read-only daily progress view. */
export function isDailyProgressView(value: unknown): boolean {
  return value === 'daily';
}

export function childIdFromDailyParam(value: unknown): number | null {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;
  const childId = Number(value);
  return Number.isSafeInteger(childId) ? childId : null;
}

/** `undefined` means the first page; `null` means an invalid supplied cursor. */
export function beforeIdFromQuery(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;
  const cursor = Number(value);
  return Number.isSafeInteger(cursor) ? cursor : null;
}
