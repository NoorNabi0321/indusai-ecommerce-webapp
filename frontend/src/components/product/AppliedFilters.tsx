import { X } from 'lucide-react';

export interface FilterChip {
  id: string;
  label: string;
}

interface AppliedFiltersProps {
  chips: FilterChip[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function AppliedFilters({ chips, onRemove, onClear }: AppliedFiltersProps) {
  if (chips.length === 0) return null;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => onRemove(chip.id)}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-bg-elevated px-2.5 py-1 text-xs text-foreground transition-colors hover:border-gold-dim"
        >
          {chip.label}
          <X className="size-3" />
        </button>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="text-xs text-muted-foreground underline-offset-2 hover:text-gold-base hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
