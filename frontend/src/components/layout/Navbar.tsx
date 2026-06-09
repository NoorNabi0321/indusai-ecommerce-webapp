import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Sparkles, Heart, ShoppingCart, User, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Logo } from './Logo';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  ...CATEGORIES.map((c) => ({ label: c.name, to: `/shop/${c.slug}` })),
  { label: 'About', to: '/about' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { count: cartCount } = useCart();

  // Glass-blur + border once scrolled past 80px (per design spec).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 h-16 w-full transition-all duration-300',
        scrolled ? 'glass border-b border-white/10' : 'border-b border-transparent',
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Left: mobile menu + logo */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="grid size-10 place-items-center rounded-md text-foreground hover:bg-accent lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <Logo />
        </div>

        {/* Centre: desktop nav links */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-gold-base'
                    : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: actions */}
        <div className="flex items-center gap-1">
          <IconButton label="Search" to="/search">
            <Search className="size-5" />
          </IconButton>
          <IconButton label="AI Assistant" to="/support" className="hidden sm:grid">
            <Sparkles className="size-5" />
          </IconButton>
          <IconButton label="Wishlist" to="/account/wishlist" badge={0}>
            <Heart className="size-5" />
          </IconButton>
          <IconButton label="Cart" to="/cart" badge={cartCount}>
            <ShoppingCart className="size-5" />
          </IconButton>

          {isAuthenticated ? (
            <IconButton label="Account" to="/account/profile">
              <User className="size-5" />
            </IconButton>
          ) : (
            <Button asChild size="sm" className="ml-1 hidden sm:inline-flex">
              <Link to="/auth/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-[80%] max-w-xs flex-col bg-bg-surface p-6 lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="mb-8 flex items-center justify-between">
                <Logo />
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="grid size-10 place-items-center rounded-md text-foreground hover:bg-accent"
                  aria-label="Close menu"
                >
                  <X className="size-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    onClick={() => setDrawerOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'rounded-md px-3 py-3 text-base font-medium transition-colors',
                        isActive
                          ? 'bg-accent text-gold-base'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>
              {!isAuthenticated && (
                <Button asChild className="mt-6">
                  <Link to="/auth/login" onClick={() => setDrawerOpen(false)}>
                    Sign in
                  </Link>
                </Button>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

interface IconButtonProps {
  label: string;
  to: string;
  children: React.ReactNode;
  badge?: number;
  className?: string;
}

function IconButton({ label, to, children, badge, className }: IconButtonProps) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={cn(
        'relative grid size-10 place-items-center rounded-md text-foreground transition-colors hover:bg-accent',
        className,
      )}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-gold-base px-1 text-[10px] font-bold text-bg-base">
          {badge}
        </span>
      )}
    </Link>
  );
}
