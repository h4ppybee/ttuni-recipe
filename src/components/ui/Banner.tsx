import type { ReactNode } from 'react';

export function Banner({ children }: { children: ReactNode }) {
  return <div className="rounded-control bg-warning-surface px-4 py-[14px] text-body-md text-warning-text">{children}</div>;
}
