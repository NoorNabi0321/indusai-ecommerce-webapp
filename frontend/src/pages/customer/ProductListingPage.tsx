import { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SlidersHorizontal, LayoutGrid, List, PackageOpen, X, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn, formatPrice } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import type { ProductFilters } from '@/types/product.types';
import { useInfiniteProducts, useProductFacets } from '@/hooks/useProducts';
import { FilterSidebar, type FilterState } from '@/components/product/FilterSidebar';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SortDropdown } from '@/components/product/SortDropdown';
import { AppliedFilters, type FilterChip } from '@/components/product/AppliedFilters';
import { Button } from '@/components/ui/button';

function csv(value: string | null): string[] {
  return value ? value.split(',').filter(Boolean) : [];
}
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function ProductListingPage() {
  const { category } = useParams();
  const [sp, setSp] = useSearchParams();
  const search = sp.get('q') ?? undefined;
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const title = search ? `Results for “${search}”` : category ? capitalize(category) : 'Shop';

  useEffect(() => {
    document.title = `${title} · ${APP_NAME}`;
  }, [title]);

  const { data: facets } = useProductFacets({ category, search });

  const state: FilterState = {
    size: csv(sp.get('size')),
    color: csv(sp.get('color')),
    brand: csv(sp.get('brand')),
    rating: sp.get('rating') ? Number(sp.get('rating')) : undefined,
    inStock: sp.get('inStock') === 'true' || undefined,
    priceLo: sp.get('minPrice') ? Number(sp.get('minPrice')) : undefined,
    priceHi: sp.get('maxPrice') ? Number(sp.get('maxPrice')) : undefined,
  };
  const sortBy = sp.get('sortBy') ?? 'relevance';

  const filters: ProductFilters = {
    category,
    search,
    size: state.size.length ? state.size : undefined,
    color: state.color.length ? state.color : undefined,
    brand: state.brand.length ? state.brand : undefined,
    rating: state.rating,
    inStock: state.inStock,
    minPrice: state.priceLo,
    maxPrice: state.priceHi,
    sortBy: sortBy === 'relevance' ? undefined : sortBy,
  };

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteProducts(filters);
  const products = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.pagination.total ?? 0;

  // ── URL mutators ──
  function update(mutator: (p: URLSearchParams) => void) {
    const next = new URLSearchParams(sp);
    mutator(next);
    setSp(next, { replace: true });
  }
  const onToggle = (key: 'size' | 'color' | 'brand', value: string) =>
    update((p) => {
      const cur = csv(p.get(key));
      const set = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      if (set.length) p.set(key, set.join(','));
      else p.delete(key);
    });
  const onRating = (n?: number) => update((p) => (n ? p.set('rating', String(n)) : p.delete('rating')));
  const onInStock = (b: boolean) => update((p) => (b ? p.set('inStock', 'true') : p.delete('inStock')));
  const onPrice = (lo: number, hi: number) =>
    update((p) => {
      p.set('minPrice', String(lo));
      p.set('maxPrice', String(hi));
    });
  const onSort = (v: string) => update((p) => (v === 'relevance' ? p.delete('sortBy') : p.set('sortBy', v)));
  const onClear = () =>
    setSp(search ? new URLSearchParams({ q: search }) : new URLSearchParams(), { replace: true });

  // ── Applied-filter chips ──
  const lo = state.priceLo ?? facets?.minPrice ?? 0;
  const hi = state.priceHi ?? facets?.maxPrice ?? 0;
  const chips: FilterChip[] = [
    ...state.brand.map((b) => ({ id: `brand:${b}`, label: b })),
    ...state.size.map((s) => ({ id: `size:${s}`, label: `Size ${s}` })),
    ...state.color.map((c) => ({ id: `color:${c}`, label: c })),
    ...(state.rating ? [{ id: 'rating', label: `${state.rating}★ & up` }] : []),
    ...(state.inStock ? [{ id: 'inStock', label: 'In stock' }] : []),
    ...(state.priceLo != null || state.priceHi != null
      ? [{ id: 'price', label: `${formatPrice(lo)} – ${formatPrice(hi)}` }]
      : []),
  ];
  function removeChip(id: string) {
    if (id === 'rating') onRating(undefined);
    else if (id === 'inStock') onInStock(false);
    else if (id === 'price') update((p) => { p.delete('minPrice'); p.delete('maxPrice'); });
    else {
      const [key, val] = id.split(':');
      onToggle(key as 'size' | 'color' | 'brand', val);
    }
  }

  const sidebar = (
    <FilterSidebar
      facets={facets}
      state={state}
      onToggle={onToggle}
      onRating={onRating}
      onInStock={onInStock}
      onPrice={onPrice}
      onClear={onClear}
    />
  );

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{title}</span>
      </nav>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{total} products</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-3 text-sm text-foreground lg:hidden"
          >
            <SlidersHorizontal className="size-4" /> Filters
          </button>
          <SortDropdown value={sortBy} onChange={onSort} />
          <div className="hidden items-center rounded-md border border-border sm:flex">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={cn('grid size-10 place-items-center', view === 'grid' ? 'text-gold-base' : 'text-muted-foreground')}
              aria-label="Grid view"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={cn('grid size-10 place-items-center', view === 'list' ? 'text-gold-base' : 'text-muted-foreground')}
              aria-label="List view"
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">{sidebar}</div>
        </aside>

        {/* Main */}
        <div>
          <AppliedFilters chips={chips} onRemove={removeChip} onClear={onClear} />

          {isError ? (
            <div className="py-20 text-center text-muted-foreground">
              Something went wrong loading products. Please try again.
            </div>
          ) : !isLoading && products.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <PackageOpen className="size-12 text-muted-foreground" />
              <h2 className="font-display text-lg font-semibold text-foreground">No products found</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Try removing some filters or browsing a different category.
              </p>
              {chips.length > 0 && (
                <Button variant="outline" onClick={onClear}>Clear filters</Button>
              )}
            </div>
          ) : (
            <>
              <ProductGrid products={products} layout={view} loading={isLoading} />
              {hasNextPage && (
                <div className="mt-8 flex justify-center">
                  <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                    {isFetchingNextPage ? 'Loading…' : 'Load more'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
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
              className="fixed inset-y-0 right-0 z-50 w-[85%] max-w-sm overflow-y-auto bg-bg-surface p-5 lg:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-display text-md font-semibold text-foreground">Filters</h2>
                <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close">
                  <X className="size-5 text-muted-foreground" />
                </button>
              </div>
              {sidebar}
              <Button className="mt-4 w-full" onClick={() => setDrawerOpen(false)}>
                Show {total} results
              </Button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
