import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Clock, ArrowRight, Sparkles, ImageOff } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';
import { getProducts } from '@/lib/api/product.api';
import { useUIStore } from '@/stores/uiStore';
import { getRecentSearches, addRecentSearch, clearRecentSearches } from '@/lib/recentSearches';

export function GlobalSearch() {
  const open = useUIStore((s) => s.searchOpen);
  const setOpen = useUIStore((s) => s.setSearchOpen);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const [sel, setSel] = useState(0);

  // Global open shortcut (Cmd/Ctrl+K)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setOpen]);

  // On open: reset + focus + load recents
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setDebounced('');
    setSel(0);
    setRecent(getRecentSearches());
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      document.body.style.overflow = '';
    };
  }, [open]);

  // Debounce query (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const active = debounced.length >= 2;
  const { data, isFetching } = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => getProducts({ search: debounced, limit: 6 }),
    enabled: active,
  });
  const results = data?.items ?? [];

  // Keyboard-navigable rows when searching: [search-for-query, ...products]
  const rowCount = active ? 1 + results.length : 0;
  useEffect(() => setSel(0), [debounced]);

  function close() {
    setOpen(false);
  }
  function goSearch(q: string) {
    const term = q.trim();
    if (!term) return;
    addRecentSearch(term);
    close();
    navigate(`/search?q=${encodeURIComponent(term)}`);
  }
  function goProduct(slug: string) {
    close();
    navigate(`/product/${slug}`);
  }
  function goCategory(slug: string) {
    close();
    navigate(`/shop/${slug}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') return close();
    if (!active) {
      if (e.key === 'Enter') goSearch(query);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSel((s) => Math.min(s + 1, rowCount - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSel((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter') {
      if (sel === 0) goSearch(query);
      else goProduct(results[sel - 1].slug);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            className="mx-auto mt-[10vh] w-full max-w-2xl px-4"
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input */}
            <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-elevated px-4 shadow-elev-4">
              <Search className="size-5 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search products, brands, categories…"
                className="h-14 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button onClick={close} aria-label="Close" className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            {/* Panel */}
            <div className="mt-2 overflow-hidden rounded-xl border border-border bg-bg-elevated shadow-elev-4">
              {active ? (
                <div className="max-h-[60vh] overflow-y-auto p-2">
                  {/* Search-for row */}
                  <button
                    onClick={() => goSearch(query)}
                    onMouseEnter={() => setSel(0)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm',
                      sel === 0 ? 'bg-bg-overlay' : 'hover:bg-bg-overlay/60',
                    )}
                  >
                    <Search className="size-4 text-gold-base" />
                    Search for “<span className="font-medium text-foreground">{debounced}</span>”
                  </button>

                  {results.length > 0 && (
                    <div className="mt-1 px-3 pb-1 pt-2 text-xs uppercase tracking-wide text-muted-foreground">
                      Products
                    </div>
                  )}
                  {results.map((p, i) => (
                    <button
                      key={p.id}
                      onClick={() => goProduct(p.slug)}
                      onMouseEnter={() => setSel(i + 1)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg p-2 text-left',
                        sel === i + 1 ? 'bg-bg-overlay' : 'hover:bg-bg-overlay/60',
                      )}
                    >
                      <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md bg-bg-surface">
                        {p.images?.[0]?.url ? (
                          <img src={p.images[0].url} alt="" className="size-full object-cover" />
                        ) : (
                          <ImageOff className="size-4 text-muted-foreground" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-foreground">{p.name}</span>
                        <span className="text-xs text-muted-foreground">{p.brand}</span>
                      </span>
                      <span className="font-display text-sm font-semibold text-gold-base">
                        {formatPrice(p.basePrice)}
                      </span>
                    </button>
                  ))}

                  {!isFetching && results.length === 0 && (
                    <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                      No products match “{debounced}”. Press Enter to search anyway.
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3">
                  {recent.length > 0 && (
                    <div className="mb-4">
                      <div className="mb-2 flex items-center justify-between px-1">
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Recent</span>
                        <button
                          onClick={() => {
                            clearRecentSearches();
                            setRecent([]);
                          }}
                          className="text-xs text-muted-foreground hover:text-gold-base"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recent.map((r) => (
                          <button
                            key={r}
                            onClick={() => goSearch(r)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-surface px-3 py-1.5 text-sm text-foreground hover:border-gold-dim"
                          >
                            <Clock className="size-3.5 text-muted-foreground" />
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-1 px-1 text-xs uppercase tracking-wide text-muted-foreground">
                    Browse categories
                  </div>
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.slug}
                      onClick={() => goCategory(c.slug)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-bg-overlay/60"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="size-4 text-gold-base" /> {c.name}
                      </span>
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
