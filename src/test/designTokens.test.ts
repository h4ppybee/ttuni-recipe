import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = join(__dirname, '..');
const files = readdirSync(SRC, { recursive: true, encoding: 'utf8' })
  .filter((f) => (f.endsWith('.tsx') && !f.endsWith('.test.tsx')) || (f.endsWith('.ts') && !f.endsWith('.test.ts')))
  .map((f) => join(SRC, f));

const FORBIDDEN: [RegExp, string][] = [
  [/rounded-\[/, '임의 radius'],
  [/\brounded(-(t|b|l|r|tl|tr|bl|br))?-(none|xs|sm|md|lg|xl|2xl|3xl|4xl|full)\b/, 'Tailwind 기본 radius'],
  [/\brounded\b(?!-)/, 'Tailwind 기본 rounded'],
  [/shadow-\[/, '임의 그림자'],
  [/\bshadow-(2xs|xs|sm|md|lg|xl|2xl|inner|none)\b/, 'Tailwind 기본 그림자'],
  [/\bshadow\b(?!-)/, 'Tailwind 기본 shadow'],
  [/#[0-9a-fA-F]{3,8}\b/, '직접 쓴 색'],
  [/\b(bg|text|border|fill|stroke)-\[(#|rgb|hsl)/, '임의 색'],
];

describe('디자인 토큰 규칙 (DESIGN.md 2절)', () => {
  it.each(files.map((f) => [relative(SRC, f), f]))('%s', (_name, file) => {
    const source = readFileSync(file, 'utf8');
    for (const [pattern, label] of FORBIDDEN) {
      expect(pattern.test(source), `${label}: ${pattern}`).toBe(false);
    }
  });

  it('shadow-card는 Card.tsx에만 있다', () => {
    const offenders = files
      .filter((f) => !f.endsWith(join('components', 'ui', 'Card.tsx')))
      .filter((f) => readFileSync(f, 'utf8').includes('shadow-card'));
    expect(offenders.map((f) => relative(SRC, f))).toEqual([]);
  });
});
