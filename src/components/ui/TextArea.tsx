import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cx } from '../../lib/cx';
import { FieldError, FieldLabel, fieldClass } from './TextField';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, error, className, rows = 3, ...rest },
  ref,
) {
  return (
    <label className="block">
      {label && <FieldLabel>{label}</FieldLabel>}
      <textarea ref={ref} rows={rows} className={cx(fieldClass, 'resize-none', className)} {...rest} />
      <FieldError message={error} />
    </label>
  );
});
