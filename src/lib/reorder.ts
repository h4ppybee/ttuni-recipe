export interface RowBox {
  top: number;
  height: number;
}

/** from 위치의 항목을 to 위치로 옮긴 새 배열. 원본은 바꾸지 않는다. */
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/**
 * 끌고 있는 행(from)을 dy만큼 옮겼을 때 들어갈 자리.
 * 끌린 행의 가운데가 다른 행의 가운데를 넘어가면 그 행과 자리를 바꾼다.
 * rows는 드래그를 시작할 때 잰 각 행의 위치(화면 기준)다.
 */
export function dropIndex(rows: RowBox[], from: number, dy: number): number {
  const center = rows[from].top + rows[from].height / 2 + dy;
  const mid = (i: number) => rows[i].top + rows[i].height / 2;
  let to = from;
  for (let i = from + 1; i < rows.length; i++) {
    if (center > mid(i)) {
      to = i;
    }
  }
  if (to !== from) {
    return to;
  }
  for (let i = from - 1; i >= 0; i--) {
    if (center < mid(i)) {
      to = i;
    }
  }
  return to;
}

/** 끌린 행이 to 자리에 들어갈 때, 다른 행 i가 비켜야 할 거리(px). span은 끌린 행 높이 + 행 간격. */
export function shiftFor(i: number, from: number, to: number, span: number): number {
  if (from < to && i > from && i <= to) {
    return -span;
  }
  if (to < from && i >= to && i < from) {
    return span;
  }
  return 0;
}

/** 끌린 행이 to 자리에 들어갈 때 행 i가 놓일 자리. */
export function positionAfterDrop(i: number, from: number, to: number): number {
  if (i === from) {
    return to;
  }
  return i + Math.sign(shiftFor(i, from, to, 1));
}
