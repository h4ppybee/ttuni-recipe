// 화면 맨 위에서 아래로 당겨 초기화하는 제스처의 거리 계산.
export const PULL_THRESHOLD = 72;
export const PULL_MAX = 108;

export function pullDistance(dy: number): number {
  if (dy <= 0) {
    return 0;
  }
  return Math.min(dy * 0.5, PULL_MAX);
}

export function isPullReady(distance: number): boolean {
  return distance >= PULL_THRESHOLD;
}
