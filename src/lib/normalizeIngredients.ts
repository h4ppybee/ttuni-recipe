import type { Ingredient } from '../types';

export function squashSpaces(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function normalizeIngredients(items: Ingredient[]): Ingredient[] {
  return items
    .map((item) => {
      const name = squashSpaces(item.name);
      const amount = squashSpaces(item.amount);
      const group = item.group === undefined ? '' : squashSpaces(item.group);
      if (group === '') {
        return { name, amount };
      }
      return { name, amount, group };
    })
    .filter((item) => item.name !== '');
}

export function buildIngredientNames(items: Ingredient[]): string[] {
  return [...new Set(items.map((item) => item.name))];
}
