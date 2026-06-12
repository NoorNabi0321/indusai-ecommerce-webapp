import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldAlert, ImageOff, Check, X, AlertTriangle, Clock, CheckCircle2, XCircle, History,
} from 'lucide-react';
import { cn, formatPrice, formatDateTime } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import {
  listDeletions, approveDeletion, rejectDeletion, type DeletionRequestRow,
} from '@/lib/api/user-management.api';
import { toast } from '@/lib/toast';
import { getApiError } from '@/lib/apiError';
import { Button } from '@/components/ui/button';

export default function OwnerDeletionApprovalsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'pending' | 'all'>('pending');
  const [approveFor, setApproveFor] = useState<DeletionRequestRow | null>(null);

  useEffect(() => {
    document.title = `Deletion Approvals · ${APP_NAME}`;
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['owner-deletions', tab],
    queryFn: () => listDeletions(tab),
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['owner-deletions'] });
    void qc.invalidateQueries({ queryKey: ['admin-products'] });
  };
  const rejectMut = useMutation({
    mutationFn: (productId: string) => rejectDeletion(productId),
    onSuccess: () => { invalidate(); toast.success('Request rejected. Product kept.'); },
    onError: (e) => toast.error(getApiError(e).message),
  });

  const rows = data ?? [];

  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <ShieldAlert className="size-5 text-gold-base" />
        <h1 className="font-display text-xl font-bold text-foreground">Deletion Approvals</h1>
      </div>

      <div className="mb-4 flex gap-1.5">
        {(['pending', 'all'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              tab === t ? 'bg-gold-base text-bg-base' : 'border border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {t === 'pending' ? <Clock className="size-4" /> : <History className="size-4" />}
            {t === 'pending' ? 'Pending' : 'History'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton h-40 rounded-xl" />)}</div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-bg-surface py-20 text-center">
          <CheckCircle2 className="size-12 text-success" />
          <p className="text-sm text-muted-foreground">{tab === 'pending' ? 'No pending deletion requests.' : 'No deletion requests yet.'}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map((r) => (
            <article key={r.id} className="rounded-xl border border-border bg-bg-surface p-4">
              <div className="flex gap-3">
                <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-bg-elevated text-muted-foreground">
                  {r.product.image ? <img src={r.product.image} alt="" className="size-full object-cover" /> : <ImageOff className="size-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{r.product.name}</p>
                      <p className="text-xs text-muted-foreground">{r.product.category} · {formatPrice(r.product.basePrice)}</p>
                    </div>
                    <StatusPill status={r.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{r.product.orderCount} order item{r.product.orderCount === 1 ? '' : 's'} reference this product</p>
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-border bg-bg-base p-3">
                <p className="text-xs text-muted-foreground">Reason from <span className="text-foreground">{r.requestedBy}</span>:</p>
                <p className="mt-0.5 text-sm text-foreground">{r.reason}</p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {r.status === 'PENDING'
                    ? `Requested ${formatDateTime(r.createdAt)}`
                    : `${r.status === 'APPROVED' ? 'Approved' : 'Rejected'} by ${r.reviewedBy ?? '—'} · ${r.reviewedAt ? formatDateTime(r.reviewedAt) : ''}`}
                </p>
                {r.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => rejectMut.mutate(r.product.id)} disabled={rejectMut.isPending}><X className="size-4" /> Reject</Button>
                    <Button size="sm" variant="destructive" onClick={() => setApproveFor(r)}><Check className="size-4" /> Approve</Button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {approveFor && <ApproveModal request={approveFor} onClose={() => setApproveFor(null)} onDone={() => { setApproveFor(null); void qc.invalidateQueries({ queryKey: ['owner-deletions'] }); void qc.invalidateQueries({ queryKey: ['admin-products'] }); }} />}
    </div>
  );
}

function StatusPill({ status }: { status: DeletionRequestRow['status'] }) {
  if (status === 'PENDING') return <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-xs text-warning"><Clock className="size-3" /> Pending</span>;
  if (status === 'APPROVED') return <span className="inline-flex items-center gap-1 rounded-full bg-error/15 px-2 py-0.5 text-xs text-error"><CheckCircle2 className="size-3" /> Approved</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"><XCircle className="size-3" /> Rejected</span>;
}

function ApproveModal({ request, onClose, onDone }: { request: DeletionRequestRow; onClose: () => void; onDone: () => void }) {
  const [confirmText, setConfirmText] = useState('');
  const matches = confirmText.trim() === request.product.name;
  const mut = useMutation({
    mutationFn: () => approveDeletion(request.product.id),
    onSuccess: () => { toast.success('Product archived (deletion approved).'); onDone(); },
    onError: (e) => toast.error(getApiError(e).message),
  });

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border border-border bg-bg-elevated p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-md font-semibold text-foreground">Approve deletion</h2>
          <button onClick={onClose}><X className="size-5 text-muted-foreground" /></button>
        </div>

        <div className="mb-3 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>The product is archived (deactivated), not erased — order history is preserved. This action is logged.</span>
        </div>

        <p className="mb-2 text-sm text-muted-foreground">Type the product name <span className="font-medium text-foreground">{request.product.name}</span> to confirm:</p>
        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={request.product.name}
          className="input"
          autoFocus
        />

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={() => mut.mutate()} disabled={!matches || mut.isPending}>
            {mut.isPending ? 'Approving…' : 'Approve deletion'}
          </Button>
        </div>
      </div>
    </div>
  );
}
