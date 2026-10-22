import type { Ingredient } from '../types';
import { normalizeIngredients, squashSpaces } from './normalizeIngredients';

const DIGIT = /[0-9½¼¾⅓⅔]/;
const PLAIN_DIGIT = /[0-9]/;
const AMOUNT_WORD = /^(약간|적당량|적당히|조금|소량|넉넉히|한\S*|반\S*)$/;

// 쉼표는 양쪽이 모두 숫자일 때(1,000)만 구분자로 보지 않는다. 룩비하인드 없이
// 앞뒤 글자를 직접 비교해 iOS Safari < 16.4(룩비하인드 미지원)에서도 동작한다.
export function isSeparatorAt(text: string, index: number): boolean {
  const char = text[index];
  if (char === '\n' || char === '，') {
    return true;
  }
  if (char !== ',') {
    return false;
  }
  const prev = text[index - 1];
  const next = text[index + 1];
  if (prev !== undefined && PLAIN_DIGIT.test(prev) && next !== undefined && PLAIN_DIGIT.test(next)) {
    return false;
  }
  return true;
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
  return items.map((item) => (item.amount ? `${item.name} ${item.amount}` : item.name)).join(', ');
}
