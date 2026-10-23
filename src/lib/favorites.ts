import type { Recipe } from '../types';

/** 목록을 즐겨찾기와 나머지로 나눈다. 각 묶음 안의 순서는 입력 순서 그대로다. */
export function splitFavorites(recipes: Recipe[]): { favorites: Recipe[]; others: Recipe[] } {
  const favorites: Recipe[] = [];
  const others: Recipe[] = [];
  for (const recipe of recipes) {
    if (recipe.favorite) {
      favorites.push(recipe);
    } else {
      others.push(recipe);
    }
  }
  return { favorites, others };
}
