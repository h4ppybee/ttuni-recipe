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
  it('쉼표로 나누고 각 조각을 파싱한다', () => {
    expect(parseIngredients('대파 1대, 양파1개, 간장 200ml, 물200ml')).toEqual([
      { name: '대파', amount: '1대' },
      { name: '양파', amount: '1개' },
      { name: '간장', amount: '200ml' },
      { name: '물', amount: '200ml' },
    ]);
  });

  it('줄바꿈과 전각 쉼표도 구분자로 친다', () => {
    expect(parseIngredients('대파 1대\n양파 1개，소금 약간')).toEqual([
      { name: '대파', amount: '1대' },
      { name: '양파', amount: '1개' },
      { name: '소금', amount: '약간' },
    ]);
  });

  it('숫자 사이의 쉼표는 자르지 않는다', () => {
    expect(parseIngredients('물 1,000ml, 소금 약간')).toEqual([
      { name: '물', amount: '1,000ml' },
      { name: '소금', amount: '약간' },
    ]);
  });

  it('빈 조각과 연속 쉼표는 무시한다', () => {
    expect(parseIngredients(' , 대파,, ,양파 ,')).toEqual([
      { name: '대파', amount: '' },
      { name: '양파', amount: '' },
    ]);
  });
});

describe('isSeparatorAt', () => {
  it('숫자 사이의 쉼표는 구분자가 아니다', () => {
    expect(isSeparatorAt('1,000', 1)).toBe(false);
  });

  it('앞이 숫자가 아니면 구분자다', () => {
    expect(isSeparatorAt('a,b', 1)).toBe(true);
  });

  it('뒤가 숫자가 아니면 구분자다', () => {
    expect(isSeparatorAt('1,a', 1)).toBe(true);
  });

  it('앞이 숫자가 아니고 뒤가 숫자면 구분자다', () => {
    expect(isSeparatorAt('a,1', 1)).toBe(true);
  });

  it('줄바꿈은 항상 구분자다', () => {
    expect(isSeparatorAt('a\nb', 1)).toBe(true);
  });

  it('전각 쉼표는 항상 구분자다', () => {
    expect(isSeparatorAt('a，b', 1)).toBe(true);
  });
});

describe('formatIngredients', () => {
  it('재료명과 양을 공백으로 잇고 쉼표로 연결한다', () => {
    expect(
      formatIngredients([
        { name: '대파', amount: '1대' },
        { name: '참기름', amount: '' },
      ]),
    ).toBe('대파 1대, 참기름');
  });

  it('parse → format → parse 왕복 결과가 같다', () => {
    const items = parseIngredients('대파 1대, 물200ml, 소금 약간, 참기름, 물 1,000ml');
    expect(parseIngredients(formatIngredients(items))).toEqual(items);
  });
});
