import { isSeparatorAt, parsePiece } from './parseIngredients';

const MAX_SUGGESTIONS = 8;

export interface PieceRange {
  start: number;
  end: number;
  piece: string;
}

export function pieceAt(text: string, caret: number): PieceRange {
  let start = caret;
  while (start > 0 && !isSeparatorAt(text, start - 1)) {
    start -= 1;
  }
  let end = caret;
  while (end < text.length && !isSeparatorAt(text, end)) {
    end += 1;
  }
  return { start, end, piece: text.slice(start, end) };
}

export function suggestIngredientNames(names: string[], query: string): string[] {
  const q = query.trim();
  if (q === '') {
    return [];
  }
  const candidates = names.filter((name) => name !== q && name.includes(q));
  const prefixed = candidates.filter((name) => name.startsWith(q));
  const contained = candidates.filter((name) => !name.startsWith(q));
  return [...prefixed, ...contained].slice(0, MAX_SUGGESTIONS);
}

export function replacePieceName(text: string, caret: number, name: string): { text: string; caret: number } {
  const { start, end, piece } = pieceAt(text, caret);
  const leading = piece.match(/^\s*/)?.[0] ?? '';
  const { amount } = parsePiece(piece);
  const replaced = amount ? `${leading}${name} ${amount}` : `${leading}${name}`;
  return { text: text.slice(0, start) + replaced + text.slice(end), caret: start + replaced.length };
}
