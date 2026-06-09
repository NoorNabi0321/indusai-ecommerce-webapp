import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Expand, X, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductImage } from '@/types/product.types';

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const sorted = [...images].sort((a, b) => Number(b.isMain) - Number(a.isMain));
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');

  if (sorted.length === 0) {
    return (
      <div className="grid aspect-[4/5] place-items-center rounded-xl border border-border bg-bg-elevated text-muted-foreground">
        <ImageOff className="size-10" />
      </div>
    );
  }

  const current = sorted[active];

  return (
    <div className="flex flex-col gap-3">
      <div
        className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-border bg-bg-elevated"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
        }}
      >
        <img
          src={current.url}
          alt={name}
          className="size-full object-cover transition-transform duration-200 group-hover:scale-150"
          style={{ transformOrigin: origin }}
        />
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-bg-base/70 text-foreground backdrop-blur transition-colors hover:bg-bg-base"
          aria-label="Expand image"
        >
          <Expand className="size-4" />
        </button>
        <span className="absolute bottom-3 left-3 rounded-md bg-bg-base/70 px-2 py-0.5 text-xs text-foreground backdrop-blur">
          {active + 1} / {sorted.length}
        </span>
      </div>

      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                'size-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors',
                i === active ? 'border-gold-base' : 'border-transparent hover:border-border',
              )}
            >
              <img src={img.url} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[90] grid place-items-center bg-black/90 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
          >
            <button className="absolute right-5 top-5 text-white/80 hover:text-white" aria-label="Close">
              <X className="size-7" />
            </button>
            {sorted.length > 1 && (
              <>
                <button
                  className="absolute left-5 text-white/80 hover:text-white"
                  onClick={(e) => { e.stopPropagation(); setActive((a) => (a - 1 + sorted.length) % sorted.length); }}
                  aria-label="Previous"
                >
                  <ChevronLeft className="size-8" />
                </button>
                <button
                  className="absolute right-5 bottom-1/2 text-white/80 hover:text-white"
                  onClick={(e) => { e.stopPropagation(); setActive((a) => (a + 1) % sorted.length); }}
                  aria-label="Next"
                >
                  <ChevronRight className="size-8" />
                </button>
              </>
            )}
            <img
              src={current.url}
              alt={name}
              className="max-h-[85vh] max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
