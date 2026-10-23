import { describe, expect, it } from 'vitest';
import { PULL_MAX, PULL_THRESHOLD, isPullReady, pullDistance } from './pull';

describe('pullDistance', () => {
  it('위로 미는 방향(음수)과 0은 당긴 거리 0', () => {
    expect(pullDistance(-30)).toBe(0);
    expect(pullDistance(0)).toBe(0);
  });

  it('손가락 이동의 절반만 당겨지고(저항감) 최대값을 넘지 않는다', () => {
    expect(pullDistance(100)).toBe(50);
    expect(pullDistance(1000)).toBe(PULL_MAX);
  });
});

describe('isPullReady', () => {
  it('기준 거리 이상 당기면 초기화할 준비가 된다', () => {
    expect(isPullReady(PULL_THRESHOLD - 1)).toBe(false);
    expect(isPullReady(PULL_THRESHOLD)).toBe(true);
  });
});
