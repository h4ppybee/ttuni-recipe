import { BookOpen, Settings, WandSparkles } from 'lucide-react';
import { NavLink } from 'react-router';
import { cx } from '../lib/cx';

const TABS = [
  { to: '/', label: '레시피', Icon: BookOpen, end: true },
  { to: '/pick', label: '메뉴추천', Icon: WandSparkles, end: false },
  { to: '/settings', label: '설정', Icon: Settings, end: false },
];

export function TabBar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface-card"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex h-14 max-w-[480px]">
        {TABS.map(({ to, label, Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink to={to} end={end} className="flex h-full flex-col items-center justify-center gap-1">
              {({ isActive }) => (
                <>
                  <Icon size={24} strokeWidth={2} className={isActive ? 'text-primary' : 'text-muted-soft'} />
                  <span className={cx('text-tab-label', isActive ? 'text-ink' : 'text-muted-soft')}>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
