import { buildIngredientNames } from '../lib/normalizeIngredients';
import { parseIngredients } from '../lib/parseIngredients';
import type { Recipe } from '../types';

export function makeRecipe(overrides: Partial<Recipe> & { ingredientText?: string } = {}): Recipe {
  const { ingredientText = '대파 1대', ...rest } = overrides;
  const ingredients = rest.ingredients ?? parseIngredients(ingredientText);
  return {
    id: crypto.randomUUID(),
    name: '테스트 레시피',
    steps: ['굽는다'],
    memo: '',
    createdAt: 1,
    updatedAt: 1,
    ...rest,
    ingredients,
    ingredientNames: buildIngredientNames(ingredients),
  };
}
