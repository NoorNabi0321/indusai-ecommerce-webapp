import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { OwnerLayout } from '@/components/layout/OwnerLayout';
import { PlaceholderPage } from '@/components/common/PlaceholderPage';
import { GuestRoute, ProtectedRoute, RoleRoute } from './guards';
import RegisterPage from '@/pages/auth/RegisterPage';
import VerifyOtpPage from '@/pages/auth/VerifyOtpPage';
import LoginPage from '@/pages/auth/LoginPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import AdminLoginPage from '@/pages/auth/AdminLoginPage';
import HomePage from '@/pages/customer/HomePage';
import ProductListingPage from '@/pages/customer/ProductListingPage';
import ProductDetailPage from '@/pages/customer/ProductDetailPage';
import CartPage from '@/pages/customer/CartPage';
import CheckoutPage from '@/pages/customer/CheckoutPage';
import OrderConfirmationPage from '@/pages/customer/OrderConfirmationPage';
import AboutPage from '@/pages/customer/AboutPage';
import FaqPage from '@/pages/customer/FaqPage';
import NotFoundPage from '@/pages/customer/NotFoundPage';
import { AccountLayout } from '@/components/layout/AccountLayout';
import WishlistPage from '@/pages/customer/account/WishlistPage';
import ProfilePage from '@/pages/customer/account/ProfilePage';
import AddressesPage from '@/pages/customer/account/AddressesPage';
import NotificationsPage from '@/pages/customer/account/NotificationsPage';

/**
 * Phase 1.4 routing shell — all 47 pages from the design strategy.
 * Each route renders a styled placeholder via a small registry. As each real
 * page is built in later phases, swap its `element` here (adding React.lazy
 * once the page is heavy enough to warrant code-splitting).
 */
const ph = (code: string, title: string, phase: string, description?: string) => (
  <PlaceholderPage code={code} title={title} phase={phase} description={description} />
);

const routes: RouteObject[] = [
  // ─────────────────────────── Auth (6) ───────────────────────────
  {
    element: <GuestRoute />,
    children: [
      {
        path: '/auth',
        element: <AuthLayout />,
        children: [
          { path: 'register', element: <RegisterPage /> },
          { path: 'verify-otp', element: <VerifyOtpPage /> },
          { path: 'login', element: <LoginPage /> },
          { path: 'forgot-password', element: <ForgotPasswordPage /> },
          { path: 'reset-password', element: <ResetPasswordPage /> },
          { path: 'admin-login', element: <AdminLoginPage /> },
        ],
      },
    ],
  },

  // ───────────────────────── Customer (18) ────────────────────────
  {
    path: '/',
    element: <CustomerLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'shop/:category', element: <ProductListingPage /> },
      { path: 'search', element: <ProductListingPage /> },
      { path: 'product/:slug', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'support', element: ph('C-14', 'AI Support', 'Phase 9.3') },
      { path: 'about', element: <AboutPage /> },
      { path: 'faq', element: <FaqPage /> },

      // Authenticated customer area
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'checkout', element: <CheckoutPage /> },
          { path: 'order-confirmation/:orderId', element: <OrderConfirmationPage /> },
          { path: 'account/returns/new', element: ph('C-17', 'Request a Return', 'Phase 6.3') },

          // Account dashboard (sidebar layout)
          {
            element: <AccountLayout />,
            children: [
              { path: 'account/orders', element: ph('C-08', 'Order History', 'Phase 6.1') },
              {
                path: 'account/orders/:orderId',
                element: ph('C-09', 'Order Tracking', 'Phase 6.1'),
              },
              { path: 'account/wishlist', element: <WishlistPage /> },
              { path: 'account/profile', element: <ProfilePage /> },
              { path: 'account/addresses', element: <AddressesPage /> },
              { path: 'account/notifications', element: <NotificationsPage /> },
            ],
          },
        ],
      },

      // 404 catch-all (within customer chrome)
      { path: '*', element: <NotFoundPage /> },
    ],
  },

  // ─────────────────────────── Admin (13) ─────────────────────────
  {
    element: <RoleRoute roles={['ADMINISTRATOR', 'OWNER']} />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: ph('AD-01', 'Admin Dashboard', 'Phase 7.1') },
          { path: 'dashboard', element: ph('AD-01', 'Admin Dashboard', 'Phase 7.1') },
          { path: 'products', element: ph('AD-02', 'Product Management', 'Phase 7.2') },
          { path: 'products/new', element: ph('AD-03', 'Add Product', 'Phase 7.2') },
          { path: 'products/:id/edit', element: ph('AD-03', 'Edit Product', 'Phase 7.2') },
          {
            path: 'products/:id/request-delete',
            element: ph('AD-12', 'Request Deletion', 'Phase 7.2'),
          },
          { path: 'orders', element: ph('AD-04', 'Order Management', 'Phase 6.2') },
          { path: 'orders/:orderId', element: ph('AD-05', 'Order Detail', 'Phase 6.2') },
          { path: 'customers', element: ph('AD-06', 'Customer Management', 'Phase 7.3') },
          { path: 'customers/:customerId', element: ph('AD-07', 'Customer Profile', 'Phase 7.3') },
          { path: 'inventory', element: ph('AD-09', 'Inventory Alerts', 'Phase 7.4') },
          { path: 'reports', element: ph('AD-08', 'Reports', 'Phase 12') },
          { path: 'notifications', element: ph('AD-10', 'Notifications', 'Phase 7.5') },
          { path: 'settings', element: ph('AD-11', 'Account Settings', 'Phase 7.5') },
          { path: '403', element: ph('AD-13', 'Access Restricted', 'Phase 7') },
        ],
      },
    ],
  },

  // ─────────────────────────── Owner (10) ─────────────────────────
  {
    element: <RoleRoute roles={['OWNER']} />,
    children: [
      {
        path: '/owner',
        element: <OwnerLayout />,
        children: [
          { index: true, element: ph('OW-01', 'Owner Dashboard', 'Phase 8.1') },
          { path: 'dashboard', element: ph('OW-01', 'Owner Dashboard', 'Phase 8.1') },
          { path: 'financials', element: ph('OW-02', 'Financial Statistics', 'Phase 8.1') },
          { path: 'analytics', element: ph('OW-03', 'Sales Analytics', 'Phase 8.2') },
          { path: 'users', element: ph('OW-04', 'User Management', 'Phase 8.3') },
          { path: 'deletions', element: ph('OW-05', 'Deletion Approvals', 'Phase 8.3') },
          { path: 'config', element: ph('OW-06', 'System Configuration', 'Phase 8.4') },
          { path: 'reports', element: ph('OW-07', 'All Reports', 'Phase 12') },
          { path: 'audit', element: ph('OW-08', 'Platform Audit Log', 'Phase 8.4') },
          { path: 'settings', element: ph('OW-09', 'Account Settings', 'Phase 8.4') },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
