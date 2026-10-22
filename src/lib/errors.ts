export function isQuotaError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const e = error as { name?: unknown; inner?: { name?: unknown } };
  return e.name === 'QuotaExceededError' || e.inner?.name === 'QuotaExceededError';
}
