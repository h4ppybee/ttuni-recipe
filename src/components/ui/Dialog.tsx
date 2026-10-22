import { useEffect } from 'react';
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

  if (!open) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay px-4" onClick={onClose}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="w-full max-w-[400px] rounded-card bg-surface-card p-6 shadow-floating"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="dialog-title" className="text-title-md text-ink">
          {title}
        </h2>
        {description && <p className="mt-2 text-body-md text-body-soft">{description}</p>}
        <div className="mt-6 flex gap-2">
          <Button variant="weak" block onClick={onClose}>
            닫기
          </Button>
          <Button block onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
