import { useRef, useState, type MouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { cx } from '../lib/cx';
import { clampOffset, isHorizontalSwipe, resolveSwipe, type SwipeAction } from '../lib/swipe';

interface SwipeRowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: SwipeAction[];
  children: ReactNode;
}

const ACTION_WIDTH = 80;

const TONE_CLASS: Record<SwipeAction['tone'], string> = {
  danger: 'bg-primary text-on-primary',
  neutral: 'bg-surface-strong text-body',
};

type Axis = 'horizontal' | 'vertical';

interface DragStart {
  pointerId: number;
  x: number;
  y: number;
  axis: Axis | null;
  wasOpen: boolean;
}

/**
 * 레시피 카드를 왼쪽으로 밀면 오른쪽에 동작 버튼이 드러나는 스와이프 행.
 * 판정 로직(가로/세로 구분, 오프셋 clamp, 열림/닫힘 판정)은 lib/swipe.ts의
 * 순수 함수에 맡기고 이 컴포넌트는 제스처 배선과 렌더링만 담당한다.
 */
export function SwipeRow({ open, onOpenChange, actions, children }: SwipeRowProps) {
  const actionsWidth = actions.length * ACTION_WIDTH;
  const restingOffset = open ? -actionsWidth : 0;
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const dragStartRef = useRef<DragStart | null>(null);
  const suppressNextClickRef = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const offset = dragOffset ?? restingOffset;
  const isDragging = dragOffset !== null;

  const endDrag = (resolved?: 'open' | 'closed') => {
    if (dragStartRef.current?.axis === 'horizontal') {
      suppressNextClickRef.current = true;
    }
    dragStartRef.current = null;
    setDragOffset(null);
    if (resolved) {
      onOpenChange(resolved === 'open');
    }
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) {
      return;
    }
    dragStartRef.current = { pointerId: e.pointerId, x: e.clientX, y: e.clientY, axis: null, wasOpen: open };
    setDragOffset(restingOffset);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    if (!start || start.pointerId !== e.pointerId) {
      return;
    }
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (start.axis === null) {
      if (!isHorizontalSwipe(dx, dy)) {
        // 세로 이동이 뚜렷해지면 이후 move는 무시해 페이지 스크롤에 맡긴다(touch-action: pan-y).
        if (Math.abs(dy) > 8 && Math.abs(dy) >= Math.abs(dx)) {
          start.axis = 'vertical';
        }
        return;
      }
      start.axis = 'horizontal';
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (start.axis !== 'horizontal') {
      return;
    }
    e.preventDefault();
    setDragOffset(clampOffset(restingOffset + dx, actionsWidth));
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    if (!start || start.pointerId !== e.pointerId) {
      return;
    }
    if (start.axis !== 'horizontal') {
      endDrag();
      return;
    }
    endDrag(resolveSwipe(offset, actionsWidth));
  };

  const handlePointerCancel = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    if (!start || start.pointerId !== e.pointerId) {
      return;
    }
    // 제스처가 중간에 끊기면 드래그 시작 전 상태로 되돌린다(의도치 않은 닫힘/열림 방지).
    endDrag(start.wasOpen ? 'open' : 'closed');
  };

  const handleContentClickCapture = (e: MouseEvent<HTMLDivElement>) => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (open) {
      e.preventDefault();
      e.stopPropagation();
      onOpenChange(false);
    }
  };

  return (
    <div className="relative">
      {actionsWidth > 0 && (
        <div className="absolute inset-y-0 right-0 flex overflow-hidden rounded-r-card" style={{ width: actionsWidth }}>
          {actions.map((action) => (
            <button
              key={action.key}
              type="button"
              tabIndex={open ? 0 : -1}
              aria-hidden={!open}
              onClick={() => {
                onOpenChange(false);
                action.onPress();
              }}
              className={cx('flex h-full w-20 flex-col items-center justify-center gap-1', TONE_CLASS[action.tone])}
            >
              {action.icon}
              <span className="text-caption-strong">{action.label}</span>
            </button>
          ))}
        </div>
      )}
      <div
        className="relative touch-pan-y"
        style={{
          transform: `translateX(${offset}px)`,
          transition: !isDragging && !prefersReducedMotion ? 'transform 200ms ease-out' : 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClickCapture={handleContentClickCapture}
      >
        {children}
      </div>
    </div>
  );
}
