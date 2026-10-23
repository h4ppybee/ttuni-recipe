import { GripVertical, X } from 'lucide-react';
import { useLayoutEffect, useRef, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';
import { flushSync } from 'react-dom';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { autoScrollStep, clampDy, dropIndex, moveItem, positionAfterDrop, shiftFor, type RowBox } from '../lib/reorder';
import { insertStepAfter, isAddStepShortcut, newStep, type StepItem } from '../lib/steps';
import { Button } from './ui/Button';
import { FieldError, FieldLabel } from './ui/TextField';
import { IconButton } from './ui/IconButton';
import { TextArea } from './ui/TextArea';

interface StepEditorProps {
  steps: StepItem[];
  onChange: (next: StepItem[]) => void;
  error?: string;
}

// 단계 사이 간격(gap-3). 끌린 행이 빠진 자리만큼 다른 행이 비키는 거리 계산에 쓴다.
const ROW_GAP = 12;
// 끌고 있는 행을 카드처럼 띄운다. Tailwind가 클래스를 찾을 수 있게 문자열로 둔다.
const LIFTED_CLASSES = ['relative', 'z-10', 'rounded-card', 'bg-surface-card', 'shadow-floating'];
const EASE = 'transform 200ms ease-out';

// 끄는 동안 번호 원도 지금 놓일 자리를 따라가게 DOM 글자만 바꾼다(손을 떼면 원래대로 되돌린다).
function setNumber(row: HTMLElement, n: number) {
  // textContent로 바꾸면 React가 가진 텍스트 노드가 갈려 나가므로, 그 노드의 값만 바꾼다.
  const text = row.querySelector('[data-step-number]')?.firstChild;
  if (text) {
    text.nodeValue = String(n);
  }
}

interface Drag {
  pointerId: number;
  from: number;
  // 위치는 모두 문서 좌표(화면 좌표 + 스크롤)다. 자동 스크롤 중에도 계산이 어긋나지 않게 한다.
  startY: number;
  pointerY: number;
  dy: number;
  rows: RowBox[];
  els: HTMLElement[];
}

// 상단 바 아래부터 하단 저장 바(또는 iOS 키보드) 위까지, 실제로 보이는 세로 범위.
function visibleBounds(): { top: number; bottom: number } {
  const top = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
  const viewport = window.visualViewport?.height ?? window.innerHeight;
  const bar = document.querySelector('[data-bottom-bar]')?.getBoundingClientRect().top ?? viewport;
  return { top, bottom: Math.min(viewport, bar) };
}

type RefMap<T> = Map<string, T>;

function bindRef<T>(map: RefObject<RefMap<T>>, key: string) {
  return (el: T | null) => {
    if (el) {
      map.current.set(key, el);
    } else {
      map.current.delete(key);
    }
  };
}

/**
 * 단계 목록 편집. 각 행의 손잡이를 끌어 순서를 바꾼다.
 * 끄는 동안에는 React 상태를 바꾸지 않고 ref로 transform만 쓴다(rAF로 프레임당 한 번).
 * 손가락이 보이는 영역의 위·아래 가장자리에 가까우면 그쪽으로 자동 스크롤한다.
 * 손을 뗄 때 스타일을 지우고 같은 틱에 바뀐 순서를 onChange로 알린다.
 */
export function StepEditor({ steps, onChange, error }: StepEditorProps) {
  const rows = useRef<RefMap<HTMLLIElement>>(new Map());
  const inputs = useRef<RefMap<HTMLTextAreaElement>>(new Map());
  const handles = useRef<RefMap<HTMLButtonElement>>(new Map());
  const dragRef = useRef<Drag | null>(null);
  const frameRef = useRef<number | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const update = (index: number, text: string) => onChange(steps.map((s, i) => (i === index ? { ...s, text } : s)));
  const remove = (index: number) => onChange(steps.filter((_, i) => i !== index));
  const addAfter = (index: number) => {
    const { steps: next, inserted } = insertStepAfter(steps, index);
    // 새 칸이 DOM에 생긴 뒤 같은 핸들러 안에서 바로 포커스한다(키보드 유지).
    flushSync(() => onChange(next));
    inputs.current.get(inserted.key)?.focus();
  };

  const paint = (drag: Drag) => {
    const to = dropIndex(drag.rows, drag.from, drag.dy);
    const span = drag.rows[drag.from].height + ROW_GAP;
    drag.els.forEach((el, i) => {
      setNumber(el, positionAfterDrop(i, drag.from, to) + 1);
      if (i === drag.from) {
        el.style.transition = 'none';
        el.style.transform = `translate3d(0, ${drag.dy}px, 0)`;
        return;
      }
      el.style.transition = prefersReducedMotion ? 'none' : EASE;
      el.style.transform = `translate3d(0, ${shiftFor(i, drag.from, to, span)}px, 0)`;
    });
  };

  const clearStyles = (drag: Drag) => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    drag.els.forEach((el, i) => {
      setNumber(el, i + 1);
      el.style.transition = 'none';
      el.style.transform = '';
      el.style.willChange = 'auto';
    });
    drag.els[drag.from].classList.remove(...LIFTED_CLASSES);
  };

  // 끄는 동안 매 프레임 돈다. 손가락이 가장자리에 머물러 있으면 move 이벤트가 없어도 계속 스크롤한다.
  const tick = () => {
    const drag = dragRef.current;
    if (!drag) {
      frameRef.current = null;
      return;
    }
    const { top, bottom } = visibleBounds();
    const step = autoScrollStep(drag.pointerY, top, bottom);
    if (step !== 0) {
      window.scrollBy(0, step);
    }
    drag.dy = clampDy(drag.rows, drag.from, drag.pointerY + window.scrollY - drag.startY);
    paint(drag);
    frameRef.current = requestAnimationFrame(tick);
  };

  const handlePointerDown = (index: number, e: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragRef.current || (e.pointerType === 'mouse' && e.button !== 0)) {
      return;
    }
    const els = steps.map((s) => rows.current.get(s.key)).filter((el): el is HTMLLIElement => !!el);
    if (els.length !== steps.length) {
      return;
    }
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // 손가락이 손잡이 밖으로 나가도 추적하기 위한 보조 장치다. 실패해도 드래그는 계속한다.
    }
    const drag: Drag = {
      pointerId: e.pointerId,
      from: index,
      startY: e.clientY + window.scrollY,
      pointerY: e.clientY,
      dy: 0,
      rows: els.map((el) => {
        const rect = el.getBoundingClientRect();
        return { top: rect.top + window.scrollY, height: rect.height };
      }),
      els,
    };
    els.forEach((el) => {
      el.style.willChange = 'transform';
    });
    els[index].classList.add(...LIFTED_CLASSES);
    dragRef.current = drag;
    frameRef.current = requestAnimationFrame(tick);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) {
      return;
    }
    e.preventDefault();
    // 실제 그리기와 스크롤은 tick이 다음 프레임에 한다.
    drag.pointerY = e.clientY;
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) {
      return;
    }
    dragRef.current = null;
    drag.dy = clampDy(drag.rows, drag.from, e.clientY + window.scrollY - drag.startY);
    const to = dropIndex(drag.rows, drag.from, drag.dy);
    clearStyles(drag);
    if (to === drag.from) {
      return;
    }
    // 스타일을 지운 것과 순서 반영이 같은 프레임에 그려지도록 동기로 렌더한다.
    flushSync(() => onChange(moveItem(steps, drag.from, to)));
  };

  const handlePointerCancel = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) {
      return;
    }
    dragRef.current = null;
    clearStyles(drag);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLButtonElement>) => {
    const delta = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
    const target = index + delta;
    if (delta === 0 || target < 0 || target >= steps.length) {
      return;
    }
    e.preventDefault();
    const key = steps[index].key;
    flushSync(() => onChange(moveItem(steps, index, target)));
    handles.current.get(key)?.focus();
  };

  return (
    <div>
      <FieldLabel>만드는 방법</FieldLabel>
      <ol className="flex flex-col gap-3">
        {steps.map((step, index) => (
          <li key={step.key} ref={bindRef(rows, step.key)} className="flex gap-2">
            <span
              data-step-number
              className="mt-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-pill bg-primary-surface text-caption-strong text-primary-text">
              {index + 1}
            </span>
            <div className="flex-1">
              <TextArea
                ref={bindRef(inputs, step.key)}
                rows={2}
                value={step.text}
                aria-label={`${index + 1}단계`}
                onChange={(e) => update(index, e.target.value)}
                onKeyDown={(e) => {
                  if (!isAddStepShortcut({ ...e, isComposing: e.nativeEvent.isComposing })) {
                    return;
                  }
                  e.preventDefault();
                  addAfter(index);
                }}
              />
            </div>
            <div className="flex flex-col">
              <IconButton
                ref={bindRef(handles, step.key)}
                label={`${index + 1}단계 순서 바꾸기`}
                className="cursor-grab touch-none active:cursor-grabbing"
                disabled={steps.length === 1}
                onPointerDown={(e) => handlePointerDown(index, e)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onKeyDown={(e) => handleKeyDown(index, e)}
              >
                <GripVertical size={20} strokeWidth={2} />
              </IconButton>
              <IconButton label="단계 지우기" disabled={steps.length === 1} onClick={() => remove(index)}>
                <X size={20} strokeWidth={2} />
              </IconButton>
            </div>
          </li>
        ))}
      </ol>
      <FieldError message={error} />
      <Button variant="secondary" block className="mt-3" onClick={() => onChange([...steps, newStep()])}>
        단계 추가하기
      </Button>
    </div>
  );
}
