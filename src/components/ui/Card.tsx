import type { HTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  pressable?: boolean;
}

export function Card({ pressable = false, className, ...rest }: CardProps) {
  return (
    <div
      className={cx(
        'bg-surface-card rounded-card shadow-card p-4',
        pressable && 'cursor-pointer transition-transform duration-[120ms] active:scale-[0.98]',
        className,
      )}
      {...rest}
    />
  );
}
