import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ToastContext } from './toastContext';

interface ToastProviderProps {
  withTabBar: boolean;
  children: ReactNode;
}

export function ToastProvider({ withTabBar, children }: ToastProviderProps) {
  const [message, setMessage] = useState<string>();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = useCallback((next: string) => {
    clearTimeout(timer.current);
    setMessage(next);
    timer.current = setTimeout(() => setMessage(undefined), 2500);
  }, []);

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  // 탭 바가 있는 화면: FAB(탭 바 위 16px, 56px 높이) 위에 16px 간격을 두고 뜬다.
  // 탭 바가 없는 화면(편집 화면): 하단 고정 저장 버튼(52px + 위 12px + 아래 12px 패딩) 위에 16px 간격을 두고 뜬다.
  const bottom = withTabBar
    ? 'calc(56px + env(safe-area-inset-bottom) + 88px)'
    : 'calc(env(safe-area-inset-bottom) + 92px)';

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4"
        style={{ bottom }}
      >
        {message && (
          <div className="rounded-control bg-ink px-4 py-3 text-body-md text-white shadow-floating">{message}</div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
