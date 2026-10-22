import { AlertCircle } from 'lucide-react';
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../lib/cx';

export const fieldClass =
  'w-full rounded-control border border-hairline bg-surface-soft px-4 py-[14px] text-body-lg text-ink placeholder:text-muted outline-none transition-colors duration-150 focus:border-primary focus:bg-surface-card focus:ring-[0.5px] focus:ring-primary';

export function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p className="mt-2 flex items-center gap-1 text-caption text-body-soft" role="alert">
      <AlertCircle size={16} strokeWidth={2} className="text-primary" />
      {message}
    </p>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="mb-2 block text-body-strong text-ink">{children}</span>;
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, className, ...rest },
  ref,
) {
  return (
    <label className="block">
      {label && <FieldLabel>{label}</FieldLabel>}
      <input ref={ref} aria-invalid={error ? true : undefined} className={cx(fieldClass, className)} {...rest} />
      <FieldError message={error} />
    </label>
  );
});
