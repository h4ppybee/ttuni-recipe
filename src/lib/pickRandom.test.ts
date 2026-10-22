import { describe, expect, it } from 'vitest';
import { pickRandom } from './pickRandom';

const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

describe('pickRandom', () => {
  it('후보가 없으면 undefined', () => {
    expect(pickRandom([], undefined, () => 0)).toBeUndefined();
  });

  it('rng 값으로 후보를 균등하게 고른다', () => {
    expect(pickRandom(items, undefined, () => 0)?.id).toBe('a');
    expect(pickRandom(items, undefined, () => 0.5)?.id).toBe('b');
    expect(pickRandom(items, undefined, () => 0.99)?.id).toBe('c');
  });

  it('직전 결과는 빼고 고른다', () => {
    expect(pickRandom(items, 'a', () => 0)?.id).toBe('b');
    expect(pickRandom(items, 'a', () => 0.99)?.id).toBe('c');
  });

  it('후보가 하나면 직전 결과여도 그 하나를 돌려준다', () => {
    expect(pickRandom([{ id: 'a' }], 'a', () => 0)?.id).toBe('a');
  });
});
