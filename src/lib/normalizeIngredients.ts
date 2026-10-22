import type { Ingredient } from '../types';

export function squashSpaces(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function normalizeIngredients(items: Ingredient[]): Ingredient[] {
  return items
    .map((item) => ({ name: squashSpaces(item.name), amount: squashSpaces(item.amount) }))
    .filter((item) => item.name !== '');
}

export function buildIngredientNames(items: Ingredient[]): string[] {
  return [...new Set(items.map((item) => item.name))];
}
