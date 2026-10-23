import type { Ingredient } from '../types';
import { normalizeIngredients, squashSpaces } from './normalizeIngredients';

const DIGIT = /[0-9½¼¾⅓⅔]/;
const AMOUNT_WORD = /^(약간|적당량|적당히|조금|소량|넉넉히|한\S*|반\S*)$/;

// 재료는 한 줄에 하나씩 적는다. 쉼표는 구분자가 아니라 그 줄의 내용이다(예: '물 1,000ml').
export function isSeparatorAt(text: string, index: number): boolean {
  return text[index] === '\n';
}

export function splitPieces(text: string): string[] {
  const pieces: string[] = [];
  let current = '';
  for (let i = 0; i < text.length; i += 1) {
    if (isSeparatorAt(text, i)) {
      pieces.push(current);
      current = '';
      continue;
    }
    current += text[i];
  }
  pieces.push(current);
  return pieces;
}

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
  return normalizeIngredients(splitPieces(text).map(parsePiece));
}

export function formatIngredients(items: Ingredient[]): string {
  return items.map((item) => (item.amount ? `${item.name} ${item.amount}` : item.name)).join('\n');
}
