// react-router의 history state에 앱 안에서 쌓인 idx가 있는지 확인한다.
// react-router가 window.history.state에 { idx, ... } 형태로 상태를 넣어 둔다는
// 내부 구현에 의존하므로, react-router 업그레이드 시 이 형태가 유지되는지 확인해야 한다.
export function hasInAppHistory(): boolean {
  const idx = (window.history.state as { idx?: number } | null)?.idx;
  return typeof idx === 'number' && idx > 0;
}
