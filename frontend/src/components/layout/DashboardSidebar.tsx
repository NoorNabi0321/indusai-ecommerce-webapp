import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/lib/nav';
import { Logo } from './Logo';

interface DashboardSidebarProps {
  items: NavItem[];
  bottomItems: NavItem[];
  badge: 'Admin' | 'Owner';
  onNavigate?: () => void;
}

/** Shared sidebar body for Admin & Owner dashboards. */
export function DashboardSidebar({
  items,
  bottomItems,
  badge,
  onNavigate,
}: DashboardSidebarProps) {
  return (
    <div className="flex h-full flex-col bg-bg-surface">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Logo to={badge === 'Owner' ? '/owner/dashboard' : '/admin/dashboard'} badge={badge} />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => (
          <SidebarLink key={item.label} item={item} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="space-y-1 border-t border-border p-3">
        {bottomItems.map((item) => (
          <SidebarLink key={item.label} item={item} onNavigate={onNavigate} />
        ))}
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <LogOut className="size-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

function SidebarLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const { icon: Icon, label, to, exclusive } = item;
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-bg-elevated text-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Active indicator — gold left border */}
          <span
            className={cn(
              'absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-gold-base transition-opacity',
              isActive ? 'opacity-100' : 'opacity-0',
            )}
          />
          <Icon className={cn('size-4 shrink-0', exclusive && !isActive && 'text-gold-dim')} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}
