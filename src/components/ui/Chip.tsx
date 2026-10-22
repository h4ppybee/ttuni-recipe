import { cx } from '../../lib/cx';

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

export function Chip({ label, selected = false, onClick }: ChipProps) {
  const className = cx(
    'inline-flex shrink-0 items-center rounded-pill px-[14px] py-[6px] text-caption-strong transition-colors duration-150',
    selected ? 'bg-primary-surface text-primary-text' : 'bg-surface-strong text-body',
  );
  if (!onClick) {
    return <span className={className}>{label}</span>;
  }
  return (
    <button type="button" aria-pressed={selected} className={className} onClick={onClick}>
      {label}
    </button>
  );
}
