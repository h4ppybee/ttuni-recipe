import { describe, expect, it } from 'vitest';
import { formatDate, yyyymmdd } from './date';

describe('date', () => {
  it('yyyymmdd', () => {
    expect(yyyymmdd(new Date(2026, 9, 2))).toBe('20261002');
  });

  it('formatDate', () => {
    expect(formatDate(new Date(2026, 9, 2).getTime())).toBe('2026년 10월 2일');
  });
});
