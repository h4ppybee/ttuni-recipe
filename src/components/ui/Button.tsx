import type { ButtonHTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

type Variant = 'primary' | 'secondary' | 'weak' | 'text';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary active:bg-primary-pressed disabled:bg-primary-disabled',
  secondary: 'bg-primary-surface text-primary-text active:brightness-95 disabled:opacity-40',
  weak: 'bg-surface-strong text-body active:brightness-95 disabled:opacity-40',
  text: 'bg-transparent text-primary-text disabled:opacity-40',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
}

export function Button({ variant = 'primary', block = false, className, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex h-[52px] items-center justify-center gap-2 rounded-control px-5 text-button transition-colors duration-150',
        VARIANT[variant],
        block && 'w-full',
        className,
      )}
      {...rest}
    />
  );
}
