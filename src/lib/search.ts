import type { Recipe } from '../types';

const byRecent = (a: Recipe, b: Recipe) => b.updatedAt - a.updatedAt;

export function searchRecipes(recipes: Recipe[], query: string): Recipe[] {
  const q = query.trim().toLowerCase();
  if (q === '') {
    return [...recipes].sort(byRecent);
  }
  const nameHits: Recipe[] = [];
  const ingredientHits: Recipe[] = [];
  for (const recipe of recipes) {
    if (recipe.name.toLowerCase().includes(q)) {
      nameHits.push(recipe);
      continue;
    }
    if (recipe.ingredientNames.some((name) => name.toLowerCase().includes(q))) {
      ingredientHits.push(recipe);
    }
  }
  return [...nameHits.sort(byRecent), ...ingredientHits.sort(byRecent)];
}
