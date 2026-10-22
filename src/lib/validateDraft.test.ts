import { describe, expect, it } from 'vitest';
import { hasErrors, validateDraft } from './validateDraft';

const valid = { name: '계란국', ingredients: [{ name: '계란', amount: '2개' }], steps: ['끓인다'], memo: '' };

describe('validateDraft', () => {
  it('모두 채워지면 오류가 없다', () => {
    expect(hasErrors(validateDraft(valid))).toBe(false);
  });

  it('이름, 재료, 단계가 비면 각각 오류 문구를 준다', () => {
    const errors = validateDraft({
      name: '  ',
      ingredients: [{ name: ' ', amount: '1개' }],
      steps: ['', '  '],
      memo: '',
    });
    expect(errors).toEqual({
      name: '레시피 이름을 적어 주세요.',
      ingredients: '재료를 1개 이상 적어 주세요.',
      steps: '만드는 방법을 1단계 이상 적어 주세요.',
    });
    expect(hasErrors(errors)).toBe(true);
  });
});
