import { describe, expect, it } from 'vitest';
import { makeRecipe } from '../test/fixtures';
import { splitFavorites } from './favorites';

describe('splitFavorites', () => {
  it('빈 목록이면 두 묶음 모두 비어 있다', () => {
    expect(splitFavorites([])).toEqual({ favorites: [], others: [] });
  });

  it('즐겨찾기가 없으면 모두 others다', () => {
    const recipes = [makeRecipe({ name: 'a' }), makeRecipe({ name: 'b' })];
    expect(splitFavorites(recipes)).toEqual({ favorites: [], others: recipes });
  });

  it('섞여 있으면 나누고 각 묶음 안의 순서는 그대로 둔다', () => {
    const a = makeRecipe({ name: 'a' });
    const b = makeRecipe({ name: 'b', favorite: true });
    const c = makeRecipe({ name: 'c' });
    const d = makeRecipe({ name: 'd', favorite: true });
    expect(splitFavorites([a, b, c, d])).toEqual({ favorites: [b, d], others: [a, c] });
  });
});
