import { describe, expect, it } from 'vitest';
import { isQuotaError } from './errors';

describe('isQuotaError', () => {
  it('이름이나 inner 이름이 QuotaExceededError면 참', () => {
    expect(isQuotaError({ name: 'QuotaExceededError' })).toBe(true);
    expect(isQuotaError({ name: 'AbortError', inner: { name: 'QuotaExceededError' } })).toBe(true);
  });

  it('그 밖에는 거짓', () => {
    expect(isQuotaError(new Error('x'))).toBe(false);
    expect(isQuotaError(null)).toBe(false);
  });
});
