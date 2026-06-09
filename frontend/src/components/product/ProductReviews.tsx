import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Star, Trash2 } from 'lucide-react';
import { cn, formatDate, getInitials } from '@/lib/utils';
import type { ReviewStats } from '@/types/product.types';
import { getReviews, createReview, deleteReview, type ReviewDTO } from '@/lib/api/review.api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/lib/toast';
import { getApiError } from '@/lib/apiError';
import { StarRating } from '@/components/common/StarRating';
import { Button } from '@/components/ui/button';

interface ProductReviewsProps {
  productId: string;
  slug: string;
  stats: ReviewStats;
}

export function ProductReviews({ productId, slug, stats }: ProductReviewsProps) {
  const { isAuthenticated, user } = useAuth();
  const qc = useQueryClient();
  const [star, setStar] = useState<number | undefined>();
  const [limit, setLimit] = useState(5);

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', productId, star, limit],
    queryFn: () => getReviews(productId, { star, limit, page: 1 }),
  });

  const reviews = data?.reviews ?? [];
  const total = data?.pagination.total ?? 0;

  function refresh() {
    void qc.invalidateQueries({ queryKey: ['reviews', productId] });
    void qc.invalidateQueries({ queryKey: ['product', slug] });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      {/* Summary */}
      <div>
        <div className="rounded-xl border border-border bg-bg-surface p-5 text-center">
          <div className="font-display text-4xl font-bold text-foreground">
            {stats.average.toFixed(1)}
          </div>
          <StarRating value={stats.average} className="mt-1 justify-center" size={16} />
          <p className="mt-1 text-sm text-muted-foreground">{stats.count} reviews</p>
        </div>

        <div className="mt-4 space-y-1.5">
          {[5, 4, 3, 2, 1].map((s) => {
            const n = stats.histogram[s - 1] ?? 0;
            const pct = stats.count ? (n / stats.count) * 100 : 0;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStar(star === s ? undefined : s)}
                className={cn(
                  'flex w-full items-center gap-2 text-sm',
                  star === s ? 'text-gold-base' : 'text-muted-foreground',
                )}
              >
                <span className="w-3">{s}</span>
                <Star className="size-3.5 fill-gold-base text-gold-base" />
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-overlay">
                  <span className="block h-full rounded-full bg-gold-base" style={{ width: `${pct}%` }} />
                </span>
                <span className="w-6 text-right tabular-nums">{n}</span>
              </button>
            );
          })}
        </div>
        {star && (
          <button onClick={() => setStar(undefined)} className="mt-2 text-xs text-muted-foreground hover:text-gold-base">
            Clear filter
          </button>
        )}
      </div>

      {/* List + form */}
      <div>
        {isAuthenticated && <WriteReviewForm productId={productId} onDone={refresh} />}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading reviews…</p>
        ) : reviews.length === 0 ? (
          <p className="py-8 text-sm text-muted-foreground">
            {star ? 'No reviews with this rating.' : 'No reviews yet — be the first to review this product.'}
          </p>
        ) : (
          <ul className="space-y-5">
            {reviews.map((r) => (
              <ReviewCard
                key={r.id}
                review={r}
                canDelete={isAuthenticated && (r.userId === user?.id || user?.role !== 'CUSTOMER')}
                onDelete={async () => {
                  try {
                    await deleteReview(r.id);
                    toast.success('Review deleted.');
                    refresh();
                  } catch (e) {
                    toast.error(getApiError(e).message);
                  }
                }}
              />
            ))}
          </ul>
        )}

        {!isLoading && reviews.length < total && (
          <div className="mt-6">
            <Button variant="outline" onClick={() => setLimit((l) => l + 5)}>
              Load more reviews
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  canDelete,
  onDelete,
}: {
  review: ReviewDTO;
  canDelete: boolean;
  onDelete: () => void;
}) {
  return (
    <li className="border-b border-border pb-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-full bg-bg-elevated text-sm font-semibold text-gold-base">
            {getInitials(review.user?.name ?? 'User')}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{review.user?.name ?? 'Customer'}</p>
            <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        {canDelete && (
          <button onClick={onDelete} className="text-muted-foreground hover:text-error" aria-label="Delete review">
            <Trash2 className="size-4" />
          </button>
        )}
      </div>
      <div className="mt-2">
        <StarRating value={review.rating} size={14} />
        {review.title && <p className="mt-1 text-sm font-medium text-foreground">{review.title}</p>}
        <p className="mt-1 text-sm text-muted-foreground">{review.body}</p>
      </div>
    </li>
  );
}

function WriteReviewForm({ productId, onDone }: { productId: string; onDone: () => void }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const mutation = useMutation({
    mutationFn: () => createReview(productId, { rating, title: title || undefined, body }),
    onSuccess: () => {
      toast.success('Thanks for your review!');
      setRating(0);
      setTitle('');
      setBody('');
      onDone();
    },
    onError: (e) => toast.error(getApiError(e).message),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (rating === 0) return toast.error('Please select a rating.');
        if (body.trim().length < 3) return toast.error('Please write a short review.');
        mutation.mutate();
      }}
      className="mb-8 rounded-xl border border-border bg-bg-surface p-5"
    >
      <h3 className="mb-3 font-display text-md font-semibold text-foreground">Write a review</h3>
      <div className="mb-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(i)}
            aria-label={`${i} stars`}
          >
            <Star className={cn('size-6', i <= (hover || rating) ? 'fill-gold-base text-gold-base' : 'text-bg-overlay')} />
          </button>
        ))}
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        className="mb-2 h-10 w-full rounded-md border border-input bg-bg-base px-3 text-sm text-foreground outline-none focus:border-gold-dim"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share your thoughts about this product…"
        rows={3}
        className="w-full rounded-md border border-input bg-bg-base px-3 py-2 text-sm text-foreground outline-none focus:border-gold-dim"
      />
      <div className="mt-3">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Posting…' : 'Submit Review'}
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          You can review products you've purchased and received.
        </p>
      </div>
    </form>
  );
}
