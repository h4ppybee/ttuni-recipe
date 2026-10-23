import { useEffect, useRef } from 'react';
import { PULL_THRESHOLD, isPullReady, pullDistance } from '../lib/pull';

const SETTLE = 'height 200ms ease-out, opacity 200ms ease-out';

/**
 * 화면 맨 위에서 아래로 당기면 리프레시 아이콘이 당긴 만큼 돌다가(기준 거리에서 한 바퀴),
 * 그 상태에서 손을 떼면 onReset을 부른다. 당기는 동안은 React 상태를 바꾸지 않고
 * ref로 표시 영역 높이와 아이콘 회전을 직접 그린다.
 */
export function usePullToReset(onReset: () => void, enabled: boolean) {
  const indicatorRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const onResetRef = useRef(onReset);

  useEffect(() => {
    onResetRef.current = onReset;
  }, [onReset]);

  // 이 화면에서는 iOS 기본 고무줄 바운스를 끈다. 바운스가 있으면 맨 위에서 당길 때
  // 고정된 제목까지 끌려 내려오기 때문이다. 당기는 터치 이벤트는 그대로 들어오므로
  // 제목은 제자리에 두고 그 아래 리프레시 아이콘만 내려오게 된다.
  useEffect(() => {
    const targets = [document.documentElement, document.body];
    const previous = targets.map((el) => el.style.overscrollBehaviorY);
    targets.forEach((el) => {
      el.style.overscrollBehaviorY = 'none';
    });
    return () => {
      targets.forEach((el, i) => {
        el.style.overscrollBehaviorY = previous[i];
      });
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    let startY: number | null = null;
    let distance = 0;

    const paint = (px: number, settle: boolean) => {
      const indicator = indicatorRef.current;
      if (indicator) {
        indicator.style.transition = settle ? SETTLE : 'none';
        indicator.style.height = `${px}px`;
        indicator.style.opacity = String(Math.min(1, px / PULL_THRESHOLD));
      }
      const icon = iconRef.current;
      if (icon) {
        icon.style.transform = `rotate(${Math.min(1, px / PULL_THRESHOLD) * 360}deg)`;
        // 한 바퀴를 다 채우면(손을 떼면 초기화되는 시점) 브랜드색으로 알려 준다.
        icon.style.color = isPullReady(px) ? 'var(--color-primary)' : '';
      }
    };

    const onStart = (e: TouchEvent) => {
      if (window.scrollY > 0 || e.touches.length !== 1) {
        startY = null;
        return;
      }
      startY = e.touches[0].clientY;
      distance = 0;
    };

    const onMove = (e: TouchEvent) => {
      if (startY === null) {
        return;
      }
      if (window.scrollY > 0) {
        startY = null;
        distance = 0;
        paint(0, true);
        return;
      }
      distance = pullDistance(e.touches[0].clientY - startY);
      paint(distance, false);
    };

    const onEnd = () => {
      if (startY === null) {
        return;
      }
      const ready = isPullReady(distance);
      startY = null;
      distance = 0;
      paint(0, true);
      if (ready) {
        onResetRef.current();
      }
    };

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
      paint(0, false);
    };
  }, [enabled]);

  return { indicatorRef, iconRef };
}
