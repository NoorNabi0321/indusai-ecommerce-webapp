import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { CartDrawer } from '@/components/cart/CartDrawer';

/** Customer-facing shell: sticky navbar + content + footer. */
export function CustomerLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-base">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <GlobalSearch />
      <CartDrawer />
    </div>
  );
}
