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
 * 끌린 행의 가운데가 다른 행의 가운데에 닿거나 넘어가면 그 행과 자리를 바꾼다.
 * (끝까지 끌면 clampDy로 가운데끼리 딱 맞닿으므로 닿기만 해도 바꿔야 끝자리로 갈 수 있다.)
 * rows는 드래그를 시작할 때 잰 각 행의 위치(화면 기준)다.
 */
export function dropIndex(rows: RowBox[], from: number, dy: number): number {
  const center = rows[from].top + rows[from].height / 2 + dy;
  const mid = (i: number) => rows[i].top + rows[i].height / 2;
  let to = from;
  for (let i = from + 1; i < rows.length; i++) {
    if (center >= mid(i)) {
      to = i;
    }
  }
  if (to !== from) {
    return to;
  }
  for (let i = from - 1; i >= 0; i--) {
    if (center <= mid(i)) {
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

/**
 * 드래그 중 손가락(pointerY)이 보이는 영역(top~bottom)의 가장자리 edge 안에 있으면
 * 이번 프레임에 스크롤할 거리(px). 가장자리에 가까울수록 빨라져 max까지, 위쪽은 음수.
 */
export function autoScrollStep(pointerY: number, top: number, bottom: number, edge = 72, max = 16): number {
  if (pointerY < top + edge) {
    return -Math.round(max * Math.min(1, (top + edge - pointerY) / edge));
  }
  if (pointerY > bottom - edge) {
    return Math.round(max * Math.min(1, (pointerY - (bottom - edge)) / edge));
  }
  return 0;
}

/** 끄는 행이 첫 행 위, 마지막 행 아래로 벗어나지 않게 dy를 자른다. */
export function clampDy(rows: RowBox[], from: number, dy: number): number {
  const first = rows[0];
  const last = rows[rows.length - 1];
  const min = first.top - rows[from].top;
  const max = last.top + last.height - (rows[from].top + rows[from].height);
  return Math.min(max, Math.max(min, dy));
}
