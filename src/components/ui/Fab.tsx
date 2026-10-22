import { Plus } from 'lucide-react';

export function Fab({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="fixed right-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-pill bg-primary text-on-primary shadow-floating active:bg-primary-pressed"
      style={{ bottom: 'calc(56px + env(safe-area-inset-bottom) + 16px)' }}
    >
      <Plus size={28} strokeWidth={2} />
    </button>
  );
}
