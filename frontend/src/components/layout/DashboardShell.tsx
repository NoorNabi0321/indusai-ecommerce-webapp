import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { NavItem } from '@/lib/nav';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTopbar } from './DashboardTopbar';

interface DashboardShellProps {
  items: NavItem[];
  bottomItems: NavItem[];
  badge: 'Admin' | 'Owner';
}

/**
 * Responsive dashboard layout: fixed 240px sidebar ≥lg, overlay drawer <lg,
 * sticky topbar, and the routed content area.
 */
export function DashboardShell({ items, bottomItems, badge }: DashboardShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the mobile drawer on route change.
  useEffect(() => setDrawerOpen(false), [pathname]);

  return (
    <div className="min-h-screen bg-bg-base lg:grid lg:grid-cols-[240px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen border-r border-border lg:block">
        <DashboardSidebar items={items} bottomItems={bottomItems} badge={badge} />
      </aside>

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
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <DashboardSidebar
                items={items}
                bottomItems={bottomItems}
                badge={badge}
                onNavigate={() => setDrawerOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex min-h-screen flex-col">
        <DashboardTopbar onMenuClick={() => setDrawerOpen(true)} />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
