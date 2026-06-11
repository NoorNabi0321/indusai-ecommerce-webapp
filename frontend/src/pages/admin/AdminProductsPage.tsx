import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, ImageOff, X } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { useCategories } from '@/hooks/useProducts';
import {
  adminListProducts,
  toggleProductStatus,
  requestProductDeletion,
  type AdminProductRow,
} from '@/lib/api/admin-product.api';
import { toast } from '@/lib/toast';
import { getApiError } from '@/lib/apiError';
import { Button } from '@/components/ui/button';

const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
  { key: 'pending', label: 'Pending Deletion' },
];

function stockColor(stock: number): string {
  if (stock <= 1) return 'text-error';
  if (stock <= 10) return 'text-warning';
  return 'text-success';
}

export default function AdminProductsPage() {
  const qc = useQueryClient();
  const { data: categories } = useCategories();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('');
  const [deleteFor, setDeleteFor] = useState<AdminProductRow | null>(null);

  useEffect(() => {
    document.title = `Products · ${APP_NAME} Admin`;
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, categoryId, status],
    queryFn: () => adminListProducts({ search: search || undefined, categoryId: categoryId || undefined, status: status || undefined, limit: 50 }),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleProductStatus(id, isActive),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product updated.'); },
    onError: (e) => toast.error(getApiError(e).message),
  });

  const products = data?.items ?? [];

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-foreground">Products <span className="text-muted-foreground">({data?.pagination.total ?? 0})</span></h1>
        <Button asChild><Link to="/admin/products/new"><Plus className="size-4" /> Add Product</Link></Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_TABS.map((t) => (
            <button key={t.key} onClick={() => setStatus(t.key)} className={cn('rounded-full px-3 py-1.5 text-xs font-medium transition-colors', status === t.key ? 'bg-gold-base text-bg-base' : 'border border-border text-muted-foreground hover:text-foreground')}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="h-9 rounded-md border border-input bg-bg-surface px-2 text-sm text-foreground outline-none">
            <option value="">All categories</option>
            {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, brand or SKU…" className="h-9 w-52 rounded-md border border-input bg-bg-surface pl-8 pr-3 text-sm text-foreground outline-none focus:border-gold-dim" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Product</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">SKU</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium">Stock</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No products found.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-bg-elevated/50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-md bg-bg-elevated text-muted-foreground">
                        {p.image ? <img src={p.image} alt="" className="size-full object-cover" /> : <ImageOff className="size-4" />}
                      </span>
                      <span className="font-medium text-foreground">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{p.category}</td>
                  <td className="p-3 font-mono text-xs text-muted-foreground">{p.sku}</td>
                  <td className="p-3 tabular-nums text-foreground">{formatPrice(p.basePrice)}</td>
                  <td className={cn('p-3 font-medium tabular-nums', stockColor(p.totalStock))}>{p.totalStock}</td>
                  <td className="p-3">
                    {p.deletionStatus === 'PENDING' ? (
                      <span className="rounded-full bg-error/15 px-2 py-0.5 text-xs text-error">Pending Deletion</span>
                    ) : p.isActive ? (
                      <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs text-success">Active</span>
                    ) : (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Inactive</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Link to={`/admin/products/${p.id}/edit`} className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-bg-elevated hover:text-foreground" title="Edit"><Pencil className="size-4" /></Link>
                      <button onClick={() => toggleMut.mutate({ id: p.id, isActive: !p.isActive })} className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-bg-elevated hover:text-foreground" title={p.isActive ? 'Deactivate' : 'Activate'}>
                        {p.isActive ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                      <button onClick={() => setDeleteFor(p)} className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-bg-elevated hover:text-error" title="Request deletion"><Trash2 className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteFor && <DeleteModal product={deleteFor} onClose={() => setDeleteFor(null)} onDone={() => { setDeleteFor(null); void qc.invalidateQueries({ queryKey: ['admin-products'] }); }} />}
    </div>
  );
}

function DeleteModal({ product, onClose, onDone }: { product: AdminProductRow; onClose: () => void; onDone: () => void }) {
  const [reason, setReason] = useState('');
  const mut = useMutation({
    mutationFn: () => requestProductDeletion(product.id, reason),
    onSuccess: () => { toast.success('Deletion request sent to Owner.'); onDone(); },
    onError: (e) => toast.error(getApiError(e).message),
  });
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border border-border bg-bg-elevated p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-md font-semibold text-foreground">Request deletion</h2>
          <button onClick={onClose}><X className="size-5 text-muted-foreground" /></button>
        </div>
        <p className="mb-3 text-sm text-muted-foreground">Deleting “{product.name}” requires Owner approval. Provide a reason.</p>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Reason for deletion…" className="w-full rounded-md border border-input bg-bg-base px-3 py-2 text-sm text-foreground outline-none focus:border-gold-dim" />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={() => mut.mutate()} disabled={reason.trim().length < 5 || mut.isPending}>
            {mut.isPending ? 'Sending…' : 'Submit for Approval'}
          </Button>
        </div>
      </div>
    </div>
  );
}
