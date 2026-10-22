import { describe, expect, it } from 'vitest';
import { makeRecipe } from '../test/fixtures';
import { searchRecipes } from './search';

const pasta = makeRecipe({ id: 'pasta', name: '토마토 Pasta', ingredientText: '토마토 2개, 면 100g', updatedAt: 10 });
const egg = makeRecipe({ id: 'egg', name: '토마토 달걀볶음', ingredientText: '토마토 1개, 계란 2개', updatedAt: 30 });
const soup = makeRecipe({ id: 'soup', name: '계란국', ingredientText: '계란 2개, 대파 1대, 물 500ml', updatedAt: 20 });
const all = [pasta, egg, soup];

describe('searchRecipes', () => {
  it('검색어가 비면 전체를 최근 수정 순으로 돌려준다', () => {
    expect(searchRecipes(all, '  ').map((r) => r.id)).toEqual(['egg', 'soup', 'pasta']);
  });

  it('이름 일치를 먼저, 재료만 일치를 뒤에 두고 각각 최근 수정 순으로 정렬한다', () => {
    expect(searchRecipes(all, '계란').map((r) => r.id)).toEqual(['soup', 'egg']);
  });

  it('영문은 대소문자를 구분하지 않는다', () => {
    expect(searchRecipes(all, 'pasta').map((r) => r.id)).toEqual(['pasta']);
  });

  it('양으로는 검색되지 않는다', () => {
    expect(searchRecipes(all, '500ml')).toEqual([]);
  });

  it('단계와 메모는 보지 않는다', () => {
    const memoOnly = makeRecipe({ id: 'memo', name: '비빔밥', memo: '계란 올리면 맛있음', steps: ['계란 프라이'] });
    expect(searchRecipes([memoOnly], '계란')).toEqual([]);
  });
});
