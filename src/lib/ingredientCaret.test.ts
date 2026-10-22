import { describe, expect, it } from 'vitest';
import { pieceAt, replacePieceName, suggestIngredientNames } from './ingredientCaret';

describe('pieceAt', () => {
  it('커서가 있는 쉼표 사이 조각을 돌려준다', () => {
    const text = '대파 1대, 양';
    expect(pieceAt(text, text.length)).toEqual({ start: 6, end: 8, piece: ' 양' });
  });

  it('줄바꿈도 조각 경계로 본다', () => {
    expect(pieceAt('대파\n양파', 4)).toEqual({ start: 3, end: 5, piece: '양파' });
  });
});

describe('suggestIngredientNames', () => {
  const names = ['양파', '양배추', '대파', '쪽파', '파프리카'];

  it('앞부분이 같은 재료명을 먼저, 포함하는 재료명을 그 뒤에 보여준다', () => {
    expect(suggestIngredientNames(names, '파')).toEqual(['파프리카', '양파', '대파', '쪽파']);
  });

  it('입력과 똑같은 이름과 빈 입력은 제안하지 않는다', () => {
    expect(suggestIngredientNames(names, '양파')).toEqual([]);
    expect(suggestIngredientNames(names, ' ')).toEqual([]);
  });

  it('최대 8개까지만 돌려준다', () => {
    const many = Array.from({ length: 12 }, (_, i) => `소스${i}`);
    expect(suggestIngredientNames(many, '소스')).toHaveLength(8);
  });
});

describe('replacePieceName', () => {
  it('커서 조각의 재료명만 바꾸고 양은 남긴다', () => {
    const text = '대파 1대, 양 2개';
    const result = replacePieceName(text, 8, '양파');
    expect(result.text).toBe('대파 1대, 양파 2개');
    expect(result.caret).toBe('대파 1대, 양파 2개'.length);
  });

  it('양이 없으면 재료명만 넣는다', () => {
    expect(replacePieceName('대', 1, '대파')).toEqual({ text: '대파', caret: 2 });
  });
});
