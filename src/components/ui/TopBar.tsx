import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { IconButton } from './IconButton';

interface TopBarProps {
  title?: string;
  back?: boolean;
  right?: ReactNode;
}

export function TopBar({ title, back = false, right }: TopBarProps) {
  const navigate = useNavigate();
  return (
    <header
      className="sticky top-0 z-20 flex h-14 items-center gap-1 bg-canvas px-2"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {back && (
        <IconButton label="뒤로 가기" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} strokeWidth={2} />
        </IconButton>
      )}
      <h1 className="flex-1 truncate px-2 text-title-md text-ink">{title}</h1>
      {right}
    </header>
  );
}
