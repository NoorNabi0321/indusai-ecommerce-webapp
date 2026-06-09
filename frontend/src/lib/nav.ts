import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  Boxes,
  Bell,
  Settings,
  Wallet,
  LineChart,
  ShieldCheck,
  UserCog,
  ScrollText,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/types/user.types';

/** Landing route for a role after login. */
export function dashboardPathForRole(role: UserRole): string {
  if (role === 'OWNER') return '/owner/dashboard';
  if (role === 'ADMINISTRATOR') return '/admin/dashboard';
  return '/';
}

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Owner-exclusive item (highlighted differently in the Owner sidebar). */
  exclusive?: boolean;
}

/** Admin sidebar — primary navigation. */
export const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingBag },
  { label: 'Customers', to: '/admin/customers', icon: Users },
  { label: 'Inventory', to: '/admin/inventory', icon: Boxes },
  { label: 'Reports', to: '/admin/reports', icon: BarChart3 },
  { label: 'Notifications', to: '/admin/notifications', icon: Bell },
];

/** Admin sidebar — bottom-pinned. */
export const ADMIN_NAV_BOTTOM: NavItem[] = [
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

/** Owner sidebar — Owner dashboard + shared management + owner-exclusive sections. */
export const OWNER_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/owner/dashboard', icon: LayoutDashboard },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingBag },
  { label: 'Customers', to: '/admin/customers', icon: Users },
  { label: 'Inventory', to: '/admin/inventory', icon: Boxes },
  { label: 'Financial Stats', to: '/owner/financials', icon: Wallet, exclusive: true },
  { label: 'Sales Analytics', to: '/owner/analytics', icon: LineChart, exclusive: true },
  { label: 'Deletion Approvals', to: '/owner/deletions', icon: ShieldCheck, exclusive: true },
  { label: 'User Management', to: '/owner/users', icon: UserCog, exclusive: true },
  { label: 'Reports', to: '/owner/reports', icon: BarChart3 },
  { label: 'Audit Log', to: '/owner/audit', icon: ScrollText, exclusive: true },
];

export const OWNER_NAV_BOTTOM: NavItem[] = [
  { label: 'System Config', to: '/owner/config', icon: Settings, exclusive: true },
  { label: 'Settings', to: '/owner/settings', icon: Settings },
];

/** Customer footer link groups. */
export const FOOTER_LINKS = {
  shop: [
    { label: 'Shirts', to: '/shop/shirts' },
    { label: 'Shoes', to: '/shop/shoes' },
    { label: 'Jewellery', to: '/shop/jewellery' },
    { label: 'Electronics', to: '/shop/electronics' },
  ],
  company: [
    { label: 'About Us', to: '/about' },
    { label: 'FAQ', to: '/faq' },
    { label: 'Returns', to: '/account/returns/new' },
    { label: 'Support', to: '/support' },
  ],
} as const;
