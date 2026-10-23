import type { Ingredient } from '../types';
import { normalizeIngredients, squashSpaces } from './normalizeIngredients';

const DIGIT = /[0-9½¼¾⅓⅔]/;
const AMOUNT_WORD = /^(약간|적당량|적당히|조금|소량|넉넉히|한\S*|반\S*)$/;
const GROUP_HEADER = /^\s*\[(.*)\]\s*$/;

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

export function isGroupHeaderLine(line: string): boolean {
  return GROUP_HEADER.test(line);
}

export interface IngredientGroup {
  group: string;
  items: Ingredient[];
}

// 대괄호로 감싼 줄(`[분류 이름]`)은 제목 줄이다. 그 아래 재료는 다음 제목 줄이 나올 때까지
// 그 분류에 속한다. `[]`처럼 이름이 비면 "분류 없음"으로 되돌아간다.
export function parseIngredients(text: string): Ingredient[] {
  const items: Ingredient[] = [];
  let currentGroup = '';
  for (const piece of splitPieces(text)) {
    const header = piece.match(GROUP_HEADER);
    if (header) {
      currentGroup = squashSpaces(header[1]);
      continue;
    }
    const parsed = parsePiece(piece);
    items.push(currentGroup === '' ? parsed : { ...parsed, group: currentGroup });
  }
  return normalizeIngredients(items);
}

// 분류 없음이 먼저, 나머지는 처음 나온 순서다. 재료가 하나도 없는 분류(분류 없음 포함)는 뺀다.
export function groupIngredients(items: Ingredient[]): IngredientGroup[] {
  const noGroup: Ingredient[] = [];
  const order: string[] = [];
  const byGroup = new Map<string, Ingredient[]>();
  for (const item of items) {
    const group = item.group ?? '';
    if (group === '') {
      noGroup.push(item);
      continue;
    }
    if (!byGroup.has(group)) {
      byGroup.set(group, []);
      order.push(group);
    }
    byGroup.get(group)?.push(item);
  }
  const result: IngredientGroup[] = [];
  if (noGroup.length > 0) {
    result.push({ group: '', items: noGroup });
  }
  for (const group of order) {
    result.push({ group, items: byGroup.get(group) ?? [] });
  }
  return result;
}

export function formatIngredients(items: Ingredient[]): string {
  const lines: string[] = [];
  for (const { group, items: groupItems } of groupIngredients(items)) {
    if (group !== '') {
      lines.push(`[${group}]`);
    }
    for (const item of groupItems) {
      lines.push(item.amount ? `${item.name} ${item.amount}` : item.name);
    }
  }
  return lines.join('\n');
}
