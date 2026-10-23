import { describe, expect, it } from 'vitest';
import { insertStepAfter, isAddStepShortcut, newStep } from './steps';

describe('insertStepAfter', () => {
  it('지정한 단계 바로 뒤에 빈 단계를 넣는다', () => {
    const steps = [newStep('a'), newStep('b'), newStep('c')];
    const { steps: next, inserted } = insertStepAfter(steps, 0);
    expect(next.map((s) => s.text)).toEqual(['a', '', 'b', 'c']);
    expect(next[1]).toBe(inserted);
    expect(steps).toHaveLength(3);
  });

  it('마지막 단계 뒤에 넣으면 끝에 붙는다', () => {
    const steps = [newStep('a'), newStep('b')];
    const { steps: next, inserted } = insertStepAfter(steps, 1);
    expect(next.map((s) => s.text)).toEqual(['a', 'b', '']);
    expect(next[2]).toBe(inserted);
  });
});

describe('isAddStepShortcut', () => {
  const key = (over: Partial<Parameters<typeof isAddStepShortcut>[0]>) => ({
    key: 'Enter',
    metaKey: false,
    ctrlKey: false,
    isComposing: false,
    ...over,
  });

  it('Cmd+Enter와 Ctrl+Enter는 단계 추가로 본다', () => {
    expect(isAddStepShortcut(key({ metaKey: true }))).toBe(true);
    expect(isAddStepShortcut(key({ ctrlKey: true }))).toBe(true);
  });

  it('Enter만 누르면 줄바꿈이라 단계 추가가 아니다', () => {
    expect(isAddStepShortcut(key({}))).toBe(false);
  });

  it('한글 조합 중에는 단계 추가로 보지 않는다', () => {
    expect(isAddStepShortcut(key({ metaKey: true, isComposing: true }))).toBe(false);
  });

  it('다른 키는 무시한다', () => {
    expect(isAddStepShortcut(key({ key: 'a', metaKey: true }))).toBe(false);
  });
});
