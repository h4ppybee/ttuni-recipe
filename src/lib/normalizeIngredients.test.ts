import { describe, expect, it } from 'vitest';
import { buildIngredientNames, normalizeIngredients } from './normalizeIngredients';

describe('normalizeIngredients', () => {
  it('재료명과 양의 앞뒤 공백을 지우고 연속 공백을 하나로 줄인다', () => {
    expect(normalizeIngredients([{ name: '  돼지고기   앞다리살 ', amount: ' 300 g ' }])).toEqual([
      { name: '돼지고기 앞다리살', amount: '300 g' },
    ]);
  });

  it('재료명이 빈 줄은 양이 있어도 뺀다', () => {
    expect(normalizeIngredients([{ name: ' ', amount: '1개' }, { name: '양파', amount: '' }])).toEqual([
      { name: '양파', amount: '' },
    ]);
  });

  it('같은 재료명이 두 줄이어도 그대로 둔다', () => {
    const items = [
      { name: '설탕', amount: '1큰술' },
      { name: '설탕', amount: '1작은술' },
    ];
    expect(normalizeIngredients(items)).toEqual(items);
  });
});

describe('buildIngredientNames', () => {
  it('재료명만 뽑아 처음 나온 순서로 중복을 지운다', () => {
    expect(
      buildIngredientNames([
        { name: '설탕', amount: '1큰술' },
        { name: '대파', amount: '' },
        { name: '설탕', amount: '1작은술' },
      ]),
    ).toEqual(['설탕', '대파']);
  });
});
