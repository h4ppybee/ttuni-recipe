import type { ReactNode } from 'react';

export interface SwipeAction {
  key: string;
  label: string;
  icon: ReactNode;
  tone: 'danger' | 'neutral';
  onPress: () => void;
}

/**
 * 가로 이동이 threshold(px)를 넘고, 세로 이동보다 크면 가로 스와이프로 본다.
 * 세로 스크롤 제스처와 구분하기 위한 판정이며 방향(좌/우)은 가리지 않는다.
 */
export function isHorizontalSwipe(dx: number, dy: number, threshold = 8): boolean {
  return Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy);
}

/** 카드 이동 거리를 [-actionsWidth, 0] 범위로 자른다. 오른쪽으로 미는 것은 허용하지 않는다. */
export function clampOffset(dx: number, actionsWidth: number): number {
  return Math.min(0, Math.max(-actionsWidth, dx));
}

/** 손을 뗐을 때, 버튼 너비의 절반을 넘게 밀었으면 연 채로, 아니면 닫힌 채로 멈춘다. */
export function resolveSwipe(offset: number, actionsWidth: number): 'open' | 'closed' {
  return offset <= -actionsWidth / 2 ? 'open' : 'closed';
}
