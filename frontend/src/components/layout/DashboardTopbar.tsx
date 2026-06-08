import { useLocation } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';

/** Prettify the last path segment, e.g. "/admin/products" -> "Products". */
function titleFromPath(pathname: string): string {
  const segment = pathname.split('/').filter(Boolean).pop() ?? 'Dashboard';
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface DashboardTopbarProps {
  onMenuClick: () => void;
}

export function DashboardTopbar({ onMenuClick }: DashboardTopbarProps) {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);
  const title = titleFromPath(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-bg-base/80 px-4 backdrop-blur-glass lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="grid size-9 place-items-center rounded-md text-foreground hover:bg-accent lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
        <div>
          <h1 className="font-display text-md font-semibold capitalize text-foreground">
            {title}
          </h1>
          <nav className="hidden text-xs text-muted-foreground sm:block">
            {segments.map((seg, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-1">/</span>}
                <span className="capitalize">{seg.replace(/-/g, ' ')}</span>
              </span>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="relative grid size-9 place-items-center rounded-md text-foreground hover:bg-accent"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-gold-base" />
        </button>
        <div className="grid size-9 place-items-center rounded-full bg-bg-elevated text-sm font-semibold text-gold-base">
          IA
        </div>
      </div>
    </header>
  );
}
