import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { User, Package, Heart, MapPin, Bell, LogOut } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const NAV = [
  { to: '/account/profile', label: 'Profile', icon: User },
  { to: '/account/orders', label: 'Orders', icon: Package },
  { to: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/account/addresses', label: 'Addresses', icon: MapPin },
  { to: '/account/notifications', label: 'Notifications', icon: Bell },
];

export function AccountLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="container py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-foreground">My Account</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside>
          <div className="rounded-xl border border-border bg-bg-surface p-4">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="grid size-11 place-items-center overflow-hidden rounded-full bg-bg-elevated text-sm font-semibold text-gold-base">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="size-full object-cover" />
                ) : (
                  getInitials(user?.name ?? 'U')
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <nav className="mt-3 space-y-1">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-bg-elevated text-gold-base'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    )
                  }
                  end
                >
                  <item.icon className="size-4" />
                  {item.label}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-error"
              >
                <LogOut className="size-4" /> Sign Out
              </button>
            </nav>
          </div>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
