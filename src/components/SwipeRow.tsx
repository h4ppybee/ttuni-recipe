import { useEffect, useRef, useState, type MouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
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
  // 드래그 종료 직후 ~ CSS transition이 끝나기 전까지 true. 이 동안은 행이 완전히
  // 닫힌 상태(offset 0)라도 동작 레이어를 숨기지 않는다(닫히는 애니메이션 중에는 보여야 함).
  const [transitioning, setTransitioning] = useState(false);
  const dragStartRef = useRef<DragStart | null>(null);
  const suppressNextClickRef = useRef(false);
  const prevOffsetRef = useRef(restingOffset);
  const prefersReducedMotion = usePrefersReducedMotion();

  const offset = dragOffset ?? restingOffset;
  const isDragging = dragOffset !== null;
  // 완전히 닫혀 있고(offset 0) 드래그 중도 아니고 전환 중도 아닐 때만 동작 레이어를 숨긴다.
  // Card의 active:scale-[0.98]이나 모서리 안티앨리어싱으로 빨간 배경이 비치는 것을 막는다.
  const actionsHidden = offset === 0 && !isDragging && !transitioning;

  // 드래그 중이 아닐 때 보이는 offset이 실제로 바뀌면(스크롤로 닫힘, 다른 카드를 탭해 닫힘,
  // 드래그를 놓아 스냅되는 경우 등) CSS transition이 걸린다. 그 동안은 동작 레이어를 보여준다.
  // (드래그를 놓았는데 이미 목표 offset에 와 있어 실제로는 안 움직이는 경우는 여기서 걸러진다 —
  // 그런 경우 transitionend가 영영 안 와서 계속 보이는 상태로 고정되는 걸 막기 위함.)
  useEffect(() => {
    if (!isDragging && !prefersReducedMotion && prevOffsetRef.current !== offset) {
      setTransitioning(true);
    }
    prevOffsetRef.current = offset;
  }, [offset, isDragging, prefersReducedMotion]);

  const endDrag = (resolved?: 'open' | 'closed') => {
    if (dragStartRef.current?.axis === 'horizontal') {
      suppressNextClickRef.current = true;
      // 모바일에서는 드래그로 움직인 터치가 click을 아예 안 쏘는 경우가 대부분이라,
      // 이 플래그가 계속 true로 남아 다음 "진짜" 탭을 삼켜버릴 수 있다. click이 오지
      // 않아도 다음 틱에 스스로 풀어 둔다.
      setTimeout(() => {
        suppressNextClickRef.current = false;
      }, 0);
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
    // 새 제스처가 시작되면 이전 드래그가 남긴 클릭 억제 플래그를 무조건 리셋한다.
    // (예: 스와이프로 열고 → 탭으로 닫힌 뒤 → 바로 다음 탭을 또 눌렀을 때 오동작 방지)
    suppressNextClickRef.current = false;
    dragStartRef.current = { pointerId: e.pointerId, x: e.clientX, y: e.clientY, axis: null, wasOpen: open };
    setDragOffset(restingOffset);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    if (!start || start.pointerId !== e.pointerId) {
      return;
    }
    if (e.pointerType === 'mouse' && e.buttons === 0) {
      // 데스크톱에서 pointerup을 놓친(창 밖에서 버튼을 뗀 등) 상태로 남은 드래그.
      // 버튼이 눌려 있지 않은데 move가 오면 드래그를 끝낸다.
      endDrag(start.wasOpen ? 'open' : 'closed');
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
        <div
          className={cx('absolute inset-y-0 right-0 flex overflow-hidden rounded-r-card', actionsHidden && 'invisible')}
          style={{ width: actionsWidth }}
        >
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
        onTransitionEnd={(e) => {
          if (e.propertyName !== 'transform' || e.target !== e.currentTarget) {
            return;
          }
          setTransitioning(false);
        }}
      >
        {children}
      </div>
    </div>
  );
}
