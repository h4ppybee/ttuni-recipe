import { describe, expect, it } from 'vitest';
import { linkify } from './linkify';

describe('linkify', () => {
  it('링크가 없으면 텍스트 조각 하나', () => {
    expect(linkify('그냥 메모')).toEqual([{ type: 'text', value: '그냥 메모' }]);
  });

  it('http·https 주소를 링크 조각으로 나눈다', () => {
    expect(linkify('출처 https://a.com/x?y=1 참고')).toEqual([
      { type: 'text', value: '출처 ' },
      { type: 'link', value: 'https://a.com/x?y=1', href: 'https://a.com/x?y=1' },
      { type: 'text', value: ' 참고' },
    ]);
  });

  it('문장 끝 마침표와 쉼표는 링크에서 뺀다', () => {
    expect(linkify('여기 http://a.com.')).toEqual([
      { type: 'text', value: '여기 ' },
      { type: 'link', value: 'http://a.com', href: 'http://a.com' },
      { type: 'text', value: '.' },
    ]);
  });

  it('괄호로 감싼 링크의 닫는 괄호는 빼고, 주소 안의 짝 맞는 괄호는 남긴다', () => {
    expect(linkify('(https://a.com)')).toEqual([
      { type: 'text', value: '(' },
      { type: 'link', value: 'https://a.com', href: 'https://a.com' },
      { type: 'text', value: ')' },
    ]);
    expect(linkify('https://w.org/A_(b)')).toEqual([
      { type: 'link', value: 'https://w.org/A_(b)', href: 'https://w.org/A_(b)' },
    ]);
  });

  it('javascript: 같은 다른 스킴은 링크로 만들지 않는다', () => {
    expect(linkify('javascript:alert(1)')).toEqual([{ type: 'text', value: 'javascript:alert(1)' }]);
  });
});
