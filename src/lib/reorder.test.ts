import { describe, expect, it } from 'vitest';
import { dropIndex, moveItem, positionAfterDrop, shiftFor } from './reorder';

// 높이 80, 간격 12인 행 세 개: top 0, 92, 184
const rows = [
  { top: 0, height: 80 },
  { top: 92, height: 80 },
  { top: 184, height: 80 },
];

describe('moveItem', () => {
  it('앞에서 뒤로, 뒤에서 앞으로 옮긴다', () => {
    expect(moveItem(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
    expect(moveItem(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
  });

  it('같은 자리면 순서가 그대로이고 원본은 바꾸지 않는다', () => {
    const items = ['a', 'b'];
    expect(moveItem(items, 1, 1)).toEqual(['a', 'b']);
    expect(moveItem(items, 0, 1)).not.toBe(items);
    expect(items).toEqual(['a', 'b']);
  });
});

describe('dropIndex', () => {
  it('조금 움직이면 제자리다', () => {
    expect(dropIndex(rows, 1, 30)).toBe(1);
    expect(dropIndex(rows, 1, -30)).toBe(1);
  });

  it('다음 행의 가운데를 넘으면 그 자리로 간다', () => {
    expect(dropIndex(rows, 0, 93)).toBe(1);
    expect(dropIndex(rows, 0, 185)).toBe(2);
  });

  it('위로 끌어 앞 행의 가운데를 넘으면 그 자리로 간다', () => {
    expect(dropIndex(rows, 2, -93)).toBe(1);
    expect(dropIndex(rows, 2, -185)).toBe(0);
  });

  it('목록 밖으로 끌어도 처음·끝에 머문다', () => {
    expect(dropIndex(rows, 0, 1000)).toBe(2);
    expect(dropIndex(rows, 2, -1000)).toBe(0);
  });
});

describe('shiftFor', () => {
  it('아래로 끌면 사이 행이 위로 비킨다', () => {
    expect([0, 1, 2].map((i) => shiftFor(i, 0, 2, 92))).toEqual([0, -92, -92]);
  });

  it('위로 끌면 사이 행이 아래로 비킨다', () => {
    expect([0, 1, 2].map((i) => shiftFor(i, 2, 1, 92))).toEqual([0, 92, 0]);
  });

  it('제자리면 아무도 움직이지 않는다', () => {
    expect([0, 1, 2].map((i) => shiftFor(i, 1, 1, 92))).toEqual([0, 0, 0]);
  });
});

describe('positionAfterDrop', () => {
  it('moveItem 결과와 같은 자리를 돌려준다', () => {
    const items = ['a', 'b', 'c', 'd'];
    for (const [from, to] of [[0, 2], [3, 1], [1, 1], [0, 3]]) {
      const moved = moveItem(items, from, to);
      items.forEach((item, i) => {
        expect(moved[positionAfterDrop(i, from, to)]).toBe(item);
      });
    }
  });
});
