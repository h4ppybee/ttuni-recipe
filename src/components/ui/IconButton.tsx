import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
}

export function IconButton({ label, className, children, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cx(
        'inline-flex h-11 w-11 items-center justify-center rounded-pill text-muted transition-colors duration-150 hover:bg-surface-soft active:bg-surface-soft disabled:opacity-40',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
