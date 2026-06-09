import { cn } from '@/lib/utils';

/** Product-card-shaped shimmer placeholder. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-lg border border-border bg-bg-surface', className)}>
      <div className="skeleton aspect-square w-full" />
      <div className="space-y-2 p-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-5 w-2/5 rounded" />
      </div>
    </div>
  );
}
