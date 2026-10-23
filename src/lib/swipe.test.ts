import { describe, expect, it } from 'vitest';
import { clampOffset, isHorizontalSwipe, resolveSwipe } from './swipe';

describe('isHorizontalSwipe', () => {
  it('가로 이동이 기준(8px)을 넘고 세로보다 크면 스와이프로 본다', () => {
    expect(isHorizontalSwipe(-20, 2)).toBe(true);
    expect(isHorizontalSwipe(20, -2)).toBe(true);
  });

  it('기준값과 정확히 같으면 스와이프가 아니다(초과만 인정)', () => {
    expect(isHorizontalSwipe(8, 0)).toBe(false);
    expect(isHorizontalSwipe(-8, 0)).toBe(false);
  });

  it('기준값을 1px만 넘으면 스와이프다', () => {
    expect(isHorizontalSwipe(9, 0)).toBe(true);
    expect(isHorizontalSwipe(-9, 0)).toBe(true);
  });

  it('세로 이동이 가로보다 크면 스와이프가 아니다', () => {
    expect(isHorizontalSwipe(10, 20)).toBe(false);
    expect(isHorizontalSwipe(-10, -20)).toBe(false);
  });

  it('오른쪽으로 미는 것도 기준을 넘으면 스와이프로 본다(방향은 가리지 않음)', () => {
    expect(isHorizontalSwipe(15, 3)).toBe(true);
  });

  it('threshold를 바꿀 수 있다', () => {
    expect(isHorizontalSwipe(5, 0, 4)).toBe(true);
    expect(isHorizontalSwipe(5, 0, 5)).toBe(false);
  });
});

describe('clampOffset', () => {
  it('왼쪽으로 민 값은 -actionsWidth까지만 허용한다', () => {
    expect(clampOffset(-50, 80)).toBe(-50);
    expect(clampOffset(-80, 80)).toBe(-80);
    expect(clampOffset(-120, 80)).toBe(-80);
  });

  it('오른쪽으로 미는 값(양수)은 0으로 막는다', () => {
    expect(clampOffset(10, 80)).toBe(0);
    expect(clampOffset(0, 80)).toBe(0);
  });
});

describe('resolveSwipe', () => {
  it('버튼 너비의 절반을 넘게 밀었으면 연다', () => {
    expect(resolveSwipe(-41, 80)).toBe('open');
    expect(resolveSwipe(-80, 80)).toBe('open');
  });

  it('정확히 절반이면 연다(경계값 포함)', () => {
    expect(resolveSwipe(-40, 80)).toBe('open');
  });

  it('절반에 못 미치면 닫는다', () => {
    expect(resolveSwipe(-39, 80)).toBe('closed');
    expect(resolveSwipe(0, 80)).toBe('closed');
  });
});
