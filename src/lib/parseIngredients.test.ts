import { describe, expect, it } from 'vitest';
import { formatIngredients, isSeparatorAt, parseIngredients, parsePiece } from './parseIngredients';

describe('parsePiece', () => {
  it.each([
    ['대파 1대', { name: '대파', amount: '1대' }],
    ['양파1개', { name: '양파', amount: '1개' }],
    ['물200ml', { name: '물', amount: '200ml' }],
    ['계란 2~3개', { name: '계란', amount: '2~3개' }],
    ['3분카레 1개', { name: '3분카레', amount: '1개' }],
    ['3분카레', { name: '3분카레', amount: '' }],
    ['버터 ½큰술', { name: '버터', amount: '½큰술' }],
    ['소금 약간', { name: '소금', amount: '약간' }],
    ['청양고추 반개', { name: '청양고추', amount: '반개' }],
    ['대파 한대', { name: '대파', amount: '한대' }],
    ['참기름', { name: '참기름', amount: '' }],
    ['돼지고기 앞다리살', { name: '돼지고기 앞다리살', amount: '' }],
  ])('%s', (piece, expected) => {
    expect(parsePiece(piece)).toEqual(expected);
  });
});

describe('parseIngredients', () => {
  it('줄바꿈으로 나누고 각 줄을 파싱한다', () => {
    expect(parseIngredients('대파 1대\n양파1개\n간장 200ml\n물200ml')).toEqual([
      { name: '대파', amount: '1대' },
      { name: '양파', amount: '1개' },
      { name: '간장', amount: '200ml' },
      { name: '물', amount: '200ml' },
    ]);
  });

  it('쉼표는 구분자가 아니라 그 줄의 내용으로 남는다', () => {
    expect(parseIngredients('물 1,000ml\n소금, 후추 약간')).toEqual([
      { name: '물', amount: '1,000ml' },
      { name: '소금, 후추', amount: '약간' },
    ]);
  });

  it('윈도 줄바꿈(\\r\\n)도 처리한다', () => {
    expect(parseIngredients('대파 1대\r\n양파 1개')).toEqual([
      { name: '대파', amount: '1대' },
      { name: '양파', amount: '1개' },
    ]);
  });

  it('빈 줄과 공백만 있는 줄은 무시한다', () => {
    expect(parseIngredients('\n 대파\n\n  \n양파 \n')).toEqual([
      { name: '대파', amount: '' },
      { name: '양파', amount: '' },
    ]);
  });
});

describe('isSeparatorAt', () => {
  it('줄바꿈만 구분자다', () => {
    expect(isSeparatorAt('a\nb', 1)).toBe(true);
    expect(isSeparatorAt('a,b', 1)).toBe(false);
    expect(isSeparatorAt('a，b', 1)).toBe(false);
  });
});

describe('formatIngredients', () => {
  it('재료명과 양을 공백으로 잇고 줄바꿈으로 연결한다', () => {
    expect(
      formatIngredients([
        { name: '대파', amount: '1대' },
        { name: '참기름', amount: '' },
      ]),
    ).toBe('대파 1대\n참기름');
  });

  it('parse → format → parse 왕복 결과가 같다', () => {
    const items = parseIngredients('대파 1대\n물200ml\n소금 약간\n참기름\n물 1,000ml');
    expect(parseIngredients(formatIngredients(items))).toEqual(items);
  });
});
