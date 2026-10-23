import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { ToastProvider } from './ui/Toast';
import { TabBar } from './TabBar';

const TAB_PATHS = ['/', '/pick', '/settings'];

export function AppShell() {
  const { pathname } = useLocation();
  const withTabBar = TAB_PATHS.includes(pathname);

  useEffect(() => {
    navigator.storage?.persist?.().catch(() => undefined);
  }, []);

  return (
    <ToastProvider withTabBar={withTabBar}>
      <div
        className="mx-auto min-h-dvh max-w-[480px] overflow-x-clip"
        style={{ paddingBottom: withTabBar ? 'calc(56px + env(safe-area-inset-bottom) + 16px)' : undefined }}
      >
        <Outlet />
      </div>
      {withTabBar && <TabBar />}
    </ToastProvider>
  );
}
