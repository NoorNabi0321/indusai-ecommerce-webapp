import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CheckCircle2, Upload, X, ChevronLeft } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { getOrder } from '@/lib/api/order.api';
import { createReturn } from '@/lib/api/return.api';
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper';
import { toast } from '@/lib/toast';
import { getApiError } from '@/lib/apiError';
import { Button } from '@/components/ui/button';

const STEPS = ['Items', 'Reason', 'Refund'];
const REASONS = [
  { value: 'DEFECTIVE', label: 'Item is defective or damaged' },
  { value: 'WRONG_ITEM', label: 'Received the wrong item' },
  { value: 'NOT_AS_DESCRIBED', label: 'Not as described' },
  { value: 'SIZE_ISSUE', label: 'Size or fit issue' },
  { value: 'CHANGED_MIND', label: 'Changed my mind' },
  { value: 'OTHER', label: 'Other' },
];

export default function ReturnRequestPage() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId') ?? undefined;

  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [reason, setReason] = useState('DEFECTIVE');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [refundMethod, setRefundMethod] = useState<'ORIGINAL' | 'STORE_CREDIT'>('ORIGINAL');
  const [done, setDone] = useState<{ id: string; orderNumber: string } | null>(null);

  useEffect(() => {
    document.title = `Request a Return · ${APP_NAME}`;
  }, []);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId!),
    enabled: Boolean(orderId),
  });

  const selectedItems = useMemo(
    () => Object.entries(selected).filter(([, q]) => q > 0).map(([orderItemId, quantity]) => ({ orderItemId, quantity })),
    [selected],
  );

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('orderId', orderId!);
      fd.append('items', JSON.stringify(selectedItems));
      fd.append('reason', reason);
      if (description) fd.append('description', description);
      fd.append('refundMethod', refundMethod);
      photos.forEach((p) => fd.append('photos', p));
      return createReturn(fd);
    },
    onSuccess: (res) => setDone({ id: res.id, orderNumber: res.orderNumber }),
    onError: (e) => toast.error(getApiError(e).message),
  });

  if (!orderId) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">Request a Return</h1>
        <p className="mt-2 text-muted-foreground">Choose a delivered order to start a return.</p>
        <Button asChild className="mt-4"><Link to="/account/orders">Go to my orders</Link></Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="container flex flex-col items-center gap-4 py-20 text-center">
        <CheckCircle2 className="size-16 text-success" />
        <h1 className="font-display text-2xl font-bold text-foreground">Return request submitted</h1>
        <p className="max-w-md text-muted-foreground">
          Your return for <span className="text-foreground">{done.orderNumber}</span> is now pending review.
          We'll email you with next steps and the pickup details.
        </p>
        <p className="text-sm text-muted-foreground">Reference: <span className="font-mono text-gold-base">{done.id.slice(0, 8)}</span></p>
        <Button asChild className="mt-2"><Link to="/account/orders">Back to my orders</Link></Button>
      </div>
    );
  }

  if (isLoading) return <div className="container py-10"><div className="skeleton h-64 rounded-xl" /></div>;

  if (!order || order.status !== 'DELIVERED') {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">Return not available</h1>
        <p className="mt-2 text-muted-foreground">Only delivered orders are eligible for returns.</p>
        <Button asChild className="mt-4" variant="outline"><Link to={`/account/orders/${orderId}`}>Back to order</Link></Button>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <Link to={`/account/orders/${orderId}`} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold-base">
        <ChevronLeft className="size-4" /> Back to order
      </Link>
      <h1 className="mb-6 font-display text-2xl font-bold text-foreground">Request a Return — {order.orderNumber}</h1>

      <CheckoutStepper steps={STEPS} current={step} />

      {/* Step 1: Items */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Select the items you'd like to return.</p>
          <div className="divide-y divide-border rounded-xl border border-border bg-bg-surface">
            {order.items.map((it) => {
              const checked = (selected[it.id] ?? 0) > 0;
              return (
                <div key={it.id} className="flex items-center gap-3 p-4">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setSelected((s) => ({ ...s, [it.id]: e.target.checked ? it.quantity : 0 }))}
                    className="size-4 accent-gold-base"
                  />
                  <span className="size-12 shrink-0 overflow-hidden rounded-md bg-bg-elevated">
                    {it.product.image && <img src={it.product.image} alt="" className="size-full object-cover" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{it.product.name}</p>
                    <p className="text-xs text-muted-foreground">Ordered: {it.quantity}</p>
                  </div>
                  {checked && (
                    <select
                      value={selected[it.id]}
                      onChange={(e) => setSelected((s) => ({ ...s, [it.id]: Number(e.target.value) }))}
                      className="h-9 rounded-md border border-input bg-bg-base px-2 text-sm text-foreground"
                    >
                      {Array.from({ length: it.quantity }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-end">
            <Button disabled={selectedItems.length === 0} onClick={() => setStep(2)}>Continue</Button>
          </div>
        </div>
      )}

      {/* Step 2: Reason */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Reason for return</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="h-11 w-full rounded-md border border-input bg-bg-base px-3 text-sm text-foreground outline-none focus:border-gold-dim">
              {REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Description (optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Tell us more…" className="w-full rounded-md border border-input bg-bg-base px-3 py-2 text-sm text-foreground outline-none focus:border-gold-dim" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Photos (optional)</label>
            <div className="flex flex-wrap items-center gap-2">
              {photos.map((p, i) => (
                <span key={i} className="relative size-16 overflow-hidden rounded-md border border-border">
                  <img src={URL.createObjectURL(p)} alt="" className="size-full object-cover" />
                  <button type="button" onClick={() => setPhotos((ps) => ps.filter((_, idx) => idx !== i))} className="absolute right-0 top-0 bg-bg-base/80 p-0.5 text-error">
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              {photos.length < 5 && (
                <label className="grid size-16 cursor-pointer place-items-center rounded-md border border-dashed border-border text-muted-foreground hover:border-gold-dim">
                  <Upload className="size-5" />
                  <input type="file" accept="image/*" multiple hidden onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    setPhotos((ps) => [...ps, ...files].slice(0, 5));
                  }} />
                </label>
              )}
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)}>Continue</Button>
          </div>
        </div>
      )}

      {/* Step 3: Refund */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Refund method</label>
            <div className="space-y-2">
              {([
                { v: 'ORIGINAL', label: 'Original payment method', desc: 'Refunded the way you paid.' },
                { v: 'STORE_CREDIT', label: 'Store credit', desc: 'Faster — use it on your next order.' },
              ] as const).map((o) => (
                <button key={o.v} type="button" onClick={() => setRefundMethod(o.v)} className={cn('flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors', refundMethod === o.v ? 'border-gold-base bg-gold-base/5' : 'border-border hover:border-bg-overlay')}>
                  <span className={cn('size-4 rounded-full border', refundMethod === o.v ? 'border-4 border-gold-base' : 'border-border')} />
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-foreground">{o.label}</span>
                    <span className="text-xs text-muted-foreground">{o.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-bg-surface p-4 text-sm">
            <p className="font-medium text-foreground">Summary</p>
            <p className="mt-1 text-muted-foreground">{selectedItems.length} item(s) · {REASONS.find((r) => r.value === reason)?.label}</p>
            <p className="text-muted-foreground">Estimated refund value: {formatPrice(order.items.filter((it) => selected[it.id]).reduce((s, it) => s + it.price * (selected[it.id] ?? 0), 0))}</p>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)} disabled={mutation.isPending}>Back</Button>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {mutation.isPending ? 'Submitting…' : 'Submit Return Request'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
