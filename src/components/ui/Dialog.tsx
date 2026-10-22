import { useEffect, useId, useRef } from 'react';
import { Button } from './Button';

interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function Dialog({ open, title, description, confirmLabel, onConfirm, onClose }: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }
    confirmRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay px-4" onClick={onClose}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="w-full max-w-[400px] rounded-card bg-surface-card p-6 shadow-floating"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-title-md text-ink">
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className="mt-2 text-body-md text-body-soft">
            {description}
          </p>
        )}
        <div className="mt-6 flex gap-2">
          <Button variant="weak" block onClick={onClose}>
            닫기
          </Button>
          <Button ref={confirmRef} block onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
