import { cn, cssColor } from '@/lib/utils';

interface VariantSelectorProps {
  colors: string[];
  sizes: string[];
  selectedColor: string | null;
  selectedSize: string | null;
  onColor: (c: string) => void;
  onSize: (s: string) => void;
  isSizeAvailable: (size: string) => boolean;
}

export function VariantSelector({
  colors,
  sizes,
  selectedColor,
  selectedSize,
  onColor,
  onSize,
  isSizeAvailable,
}: VariantSelectorProps) {
  return (
    <div className="space-y-5">
      {colors.length > 0 && (
        <div>
          <div className="mb-2 text-sm font-medium text-foreground">
            Colour: <span className="text-muted-foreground">{selectedColor}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onColor(color)}
                title={color}
                className={cn(
                  'size-8 rounded-full border transition-all',
                  selectedColor === color
                    ? 'ring-2 ring-gold-base ring-offset-2 ring-offset-bg-base'
                    : 'border-white/20 hover:scale-110',
                )}
                style={{ backgroundColor: cssColor(color) }}
                aria-label={color}
              />
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Size: <span className="text-muted-foreground">{selectedSize ?? '—'}</span>
            </span>
            <button type="button" className="text-xs text-muted-foreground hover:text-gold-base">
              Size guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const available = isSizeAvailable(size);
              return (
                <button
                  key={size}
                  type="button"
                  disabled={!available}
                  onClick={() => onSize(size)}
                  className={cn(
                    'min-w-11 rounded-md border px-3 py-2 text-sm transition-colors',
                    selectedSize === size
                      ? 'border-gold-base bg-gold-base/10 text-gold-base'
                      : 'border-border text-foreground hover:border-bg-overlay',
                    !available && 'cursor-not-allowed text-muted-foreground line-through opacity-50',
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
