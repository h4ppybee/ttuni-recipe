import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { hasInAppHistory } from '../../lib/history';
import { IconButton } from './IconButton';

interface TopBarProps {
  title?: string;
  back?: boolean;
  right?: ReactNode;
}

export function TopBar({ title, back = false, right }: TopBarProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    // 앱 안에서 쌓인 히스토리가 없으면(새로고침 진입 등) 뒤로 갈 곳이 없으므로 홈으로 보낸다.
    if (!hasInAppHistory()) {
      navigate('/', { replace: true });
      return;
    }
    navigate(-1);
  };

  return (
    <header className="sticky top-0 z-20 bg-canvas" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="flex h-14 items-center gap-1 px-2">
        {back && (
          <IconButton label="뒤로 가기" onClick={handleBack}>
            <ChevronLeft size={24} strokeWidth={2} />
          </IconButton>
        )}
        <h1 className="flex-1 truncate px-2 text-title-md text-ink">{title}</h1>
        {right}
      </div>
    </header>
  );
}
