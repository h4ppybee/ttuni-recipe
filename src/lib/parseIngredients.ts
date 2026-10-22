import type { Ingredient } from '../types';
import { normalizeIngredients, squashSpaces } from './normalizeIngredients';

const DIGIT = /[0-9½¼¾⅓⅔]/;
const AMOUNT_WORD = /^(약간|적당량|적당히|조금|소량|넉넉히|한\S*|반\S*)$/;
// 쉼표는 양쪽이 모두 숫자일 때(1,000)만 자르지 않는다.
const SEPARATOR = /,(?!\d)|(?<!\d),|，|\n/;

function findAmountStart(text: string): number {
  for (let i = 1; i < text.length; i += 1) {
    if (DIGIT.test(text[i])) {
      return i;
    }
  }
  return -1;
}

export function parsePiece(piece: string): Ingredient {
  const text = squashSpaces(piece);
  const amountStart = findAmountStart(text);
  if (amountStart > 0) {
    return { name: text.slice(0, amountStart).trim(), amount: text.slice(amountStart).trim() };
  }
  const words = text.split(' ');
  const lastWord = words[words.length - 1];
  if (words.length >= 2 && AMOUNT_WORD.test(lastWord)) {
    return { name: words.slice(0, -1).join(' '), amount: lastWord };
  }
  return { name: text, amount: '' };
}

export function parseIngredients(text: string): Ingredient[] {
  return normalizeIngredients(text.split(SEPARATOR).map(parsePiece));
}

export function formatIngredients(items: Ingredient[]): string {
  return items.map((item) => (item.amount ? `${item.name} ${item.amount}` : item.name)).join(', ');
}
