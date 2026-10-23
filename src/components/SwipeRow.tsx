import { useCallback, useLayoutEffect, useRef, type MouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { cx } from '../lib/cx';
import { clampOffset, isHorizontalSwipe, resolveSwipe, type SwipeAction } from '../lib/swipe';

interface SwipeRowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: SwipeAction[];
  children: ReactNode;
}

// 버튼 하나가 차지하는 칸. 48px 동그라미를 가운데 두어 카드와 12px 떨어지게 한다.
const ACTION_WIDTH = 72;

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
  lastOffset: number;
}

const EASE = '200ms ease-out';

/**
 * 레시피 카드를 왼쪽으로 밀면 오른쪽 밖에서 동작 버튼이 따라 들어오는 스와이프 행.
 * 판정 로직(가로/세로 구분, 오프셋 clamp, 열림/닫힘 판정)은 lib/swipe.ts의 순수 함수에 맡긴다.
 *
 * 부드러움을 위해 드래그 중에는 React 상태를 바꾸지 않는다. 위치는 ref로 DOM 스타일에 직접 쓰고
 * (requestAnimationFrame으로 프레임당 한 번), 움직이는 동안만 will-change로 합성 레이어에 올린다.
 * React에는 손을 뗄 때 열림/닫힘만 onOpenChange로 알린다.
 */
export function SwipeRow({ open, onOpenChange, actions, children }: SwipeRowProps) {
  const actionsWidth = actions.length * ACTION_WIDTH;
  const contentRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<DragStart | null>(null);
  // 지금 화면에 그려져 있는(또는 전환으로 향하고 있는) 위치.
  const offsetRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const suppressNextClickRef = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const setLayerActive = useCallback((active: boolean) => {
    const value = active ? 'transform' : 'auto';
    if (contentRef.current) {
      contentRef.current.style.willChange = value;
    }
    if (actionsRef.current) {
      actionsRef.current.style.willChange = active ? 'transform, opacity' : 'auto';
    }
  }, []);

  const paint = useCallback(
    (x: number, animate: boolean) => {
      offsetRef.current = x;
      const transition = animate && !prefersReducedMotion ? EASE : null;
      const content = contentRef.current;
      if (content) {
        content.style.transition = transition ? `transform ${transition}` : 'none';
        content.style.transform = `translate3d(${x}px, 0, 0)`;
      }
      const layer = actionsRef.current;
      if (!layer) {
        return;
      }
      layer.style.transition = transition ? `transform ${transition}, opacity ${transition}` : 'none';
      // 카드가 밀린 만큼 화면 오른쪽 밖에서 따라 들어온다(닫혀 있으면 오른쪽 밖, 투명).
      layer.style.transform = `translate3d(${actionsWidth + x}px, 0, 0)`;
      layer.style.opacity = String(Math.min(1, -x / actionsWidth));
      if (x !== 0) {
        layer.style.visibility = 'visible';
        return;
      }
      if (!transition) {
        // 닫혀 있으면 숨겨 둔다. 카드를 누르기만 할 때(드래그 전, 길게 누름) 비치지 않게 한다.
        layer.style.visibility = 'hidden';
        setLayerActive(false);
      }
      // 닫히는 전환 중이면 transitionend에서 숨긴다.
    },
    [actionsWidth, prefersReducedMotion, setLayerActive],
  );

  // 처음 그릴 때와, 밖에서 open이 바뀌었을 때(스크롤로 닫힘, 다른 카드 탭으로 닫힘 등) 제자리로 보낸다.
  useLayoutEffect(() => {
    const target = open ? -actionsWidth : 0;
    if (offsetRef.current === target) {
      return;
    }
    const isFirstPaint = offsetRef.current === null;
    if (!isFirstPaint) {
      setLayerActive(true);
    }
    paint(target, !isFirstPaint);
  }, [open, actionsWidth, paint, setLayerActive]);

  useLayoutEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const cancelFrame = () => {
    if (frameRef.current === null) {
      return;
    }
    cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  };

  const settle = (target: number) => {
    cancelFrame();
    setLayerActive(true);
    paint(target, true);
  };

  const markDragEnded = () => {
    suppressNextClickRef.current = true;
    // 모바일에서는 움직인 터치 뒤에 click이 오지 않는 경우가 많아, 다음 틱에 스스로 풀어 둔다.
    setTimeout(() => {
      suppressNextClickRef.current = false;
    }, 0);
  };

  const finishDrag = (start: DragStart) => {
    dragStartRef.current = null;
    if (start.axis !== 'horizontal') {
      return;
    }
    markDragEnded();
    const resolved = resolveSwipe(start.lastOffset, actionsWidth);
    settle(resolved === 'open' ? -actionsWidth : 0);
    if ((resolved === 'open') !== open) {
      onOpenChange(resolved === 'open');
    }
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) {
      return;
    }
    // 새 제스처가 시작되면 이전 드래그가 남긴 클릭 억제 플래그를 무조건 리셋한다.
    suppressNextClickRef.current = false;
    const restingOffset = open ? -actionsWidth : 0;
    dragStartRef.current = {
      pointerId: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      axis: null,
      wasOpen: open,
      lastOffset: restingOffset,
    };
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    if (!start || start.pointerId !== e.pointerId) {
      return;
    }
    if (e.pointerType === 'mouse' && e.buttons === 0) {
      // 데스크톱에서 pointerup을 놓친 채 남은 드래그는 끝낸다.
      finishDrag(start);
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
      setLayerActive(true);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // 캡처는 손가락이 카드 밖으로 나가도 추적하기 위한 보조 장치다.
        // 포인터가 이미 비활성이면 NotFoundError가 나므로 무시하고 드래그는 계속한다.
      }
    }
    if (start.axis !== 'horizontal') {
      return;
    }
    e.preventDefault();
    const restingOffset = start.wasOpen ? -actionsWidth : 0;
    start.lastOffset = clampOffset(restingOffset + dx, actionsWidth);
    if (frameRef.current !== null) {
      return;
    }
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const current = dragStartRef.current;
      if (!current) {
        return;
      }
      paint(current.lastOffset, false);
    });
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    if (!start || start.pointerId !== e.pointerId) {
      return;
    }
    finishDrag(start);
  };

  const handlePointerCancel = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    if (!start || start.pointerId !== e.pointerId) {
      return;
    }
    dragStartRef.current = null;
    if (start.axis !== 'horizontal') {
      return;
    }
    // 제스처가 중간에 끊기면 드래그 시작 전 상태로 되돌린다(의도치 않은 닫힘/열림 방지).
    settle(start.wasOpen ? -actionsWidth : 0);
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
        <div ref={actionsRef} className="absolute inset-y-0 right-0 flex" style={{ width: actionsWidth }}>
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
              aria-label={action.label}
              className="flex h-full w-[72px] items-center justify-center"
            >
              <span
                className={cx(
                  'flex h-12 w-12 items-center justify-center rounded-pill transition-transform duration-150 active:scale-95',
                  TONE_CLASS[action.tone],
                )}
              >
                {action.icon}
              </span>
            </button>
          ))}
        </div>
      )}
      <div
        ref={contentRef}
        className="relative touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClickCapture={handleContentClickCapture}
        onTransitionEnd={(e) => {
          if (e.propertyName !== 'transform' || e.target !== e.currentTarget) {
            return;
          }
          if (offsetRef.current === 0 && actionsRef.current) {
            actionsRef.current.style.visibility = 'hidden';
          }
          setLayerActive(false);
        }}
      >
        {children}
      </div>
    </div>
  );
}
