import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, ShieldCheck, Plus, Search, Eye, ShieldOff, Trash2, X, Copy, Check, KeyRound, Mail,
} from 'lucide-react';
import { cn, formatPrice, formatDate } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { listCustomers } from '@/lib/api/customer.api';
import {
  listAdmins, createAdmin, setAdminStatus, deleteAdmin, type AdminRow,
} from '@/lib/api/user-management.api';
import { toast } from '@/lib/toast';
import { getApiError } from '@/lib/apiError';
import { Button } from '@/components/ui/button';

function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export default function OwnerUserManagementPage() {
  const [tab, setTab] = useState<'customers' | 'admins'>('admins');

  useEffect(() => {
    document.title = `User Management · ${APP_NAME}`;
  }, []);

  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <Users className="size-5 text-gold-base" />
        <h1 className="font-display text-xl font-bold text-foreground">User Management</h1>
      </div>

      <div className="mb-4 flex gap-1.5">
        {(['admins', 'customers'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              tab === t ? 'bg-gold-base text-bg-base' : 'border border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {t === 'admins' ? <ShieldCheck className="size-4" /> : <Users className="size-4" />}
            {t === 'admins' ? 'Administrators' : 'Customers'}
          </button>
        ))}
      </div>

      {tab === 'admins' ? <AdminsTab /> : <CustomersTab />}
    </div>
  );
}

// ──────────────────────────── Administrators ────────────────────────────

function AdminsTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [deleteFor, setDeleteFor] = useState<AdminRow | null>(null);

  const { data: admins, isLoading } = useQuery({
    queryKey: ['owner-admins', search],
    queryFn: () => listAdmins({ search: search || undefined }),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => setAdminStatus(id, isActive),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['owner-admins'] }); toast.success('Administrator updated.'); },
    onError: (e) => toast.error(getApiError(e).message),
  });

  const rows = admins ?? [];

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or email…" className="h-9 w-52 rounded-md border border-input bg-bg-surface pl-8 pr-3 text-sm text-foreground outline-none focus:border-gold-dim" />
        </div>
        <Button className="ml-auto" onClick={() => setShowAdd(true)}><Plus className="size-4" /> Add Administrator</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Administrator</th>
              <th className="p-3 font-medium">Phone</th>
              <th className="p-3 font-medium">Added</th>
              <th className="p-3 font-medium">Products</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No administrators yet. Add one to get started.</td></tr>
            ) : (
              rows.map((a) => (
                <tr key={a.id} className="hover:bg-bg-elevated/50">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-bg-elevated text-xs font-semibold text-gold-base">
                        {a.avatar ? <img src={a.avatar} alt="" className="size-full object-cover" /> : initials(a.name)}
                      </span>
                      <div>
                        <p className="font-medium text-foreground">{a.name}</p>
                        <p className="text-xs text-muted-foreground">{a.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{a.phone ?? '—'}</td>
                  <td className="p-3 text-muted-foreground">{formatDate(a.createdAt)}</td>
                  <td className="p-3 tabular-nums text-foreground">{a.productCount}</td>
                  <td className="p-3">
                    {a.isActive ? (
                      <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs text-success">Active</span>
                    ) : (
                      <span className="rounded-full bg-error/15 px-2 py-0.5 text-xs text-error">Suspended</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => statusMut.mutate({ id: a.id, isActive: !a.isActive })} disabled={statusMut.isPending} className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-bg-elevated hover:text-foreground" title={a.isActive ? 'Suspend' : 'Activate'}>
                        <ShieldOff className="size-4" />
                      </button>
                      <button onClick={() => setDeleteFor(a)} className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-bg-elevated hover:text-error" title="Delete"><Trash2 className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAdd && <AddAdminModal onClose={() => setShowAdd(false)} onCreated={() => qc.invalidateQueries({ queryKey: ['owner-admins'] })} />}
      {deleteFor && <DeleteAdminModal admin={deleteFor} onClose={() => setDeleteFor(null)} onDone={() => { setDeleteFor(null); void qc.invalidateQueries({ queryKey: ['owner-admins'] }); }} />}
    </div>
  );
}

const addSchema = z.object({
  name: z.string().min(2, 'Enter a name'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
});
type AddValues = z.infer<typeof addSchema>;

function AddAdminModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AddValues>({ resolver: zodResolver(addSchema) });

  async function onSubmit(values: AddValues) {
    try {
      const { tempPassword: pw } = await createAdmin({ name: values.name, email: values.email, phone: values.phone || undefined });
      setTempPassword(pw);
      onCreated();
      toast.success('Administrator created.');
    } catch (e) {
      toast.error(getApiError(e).message);
    }
  }

  function copyPw() {
    if (!tempPassword) return;
    navigator.clipboard.writeText(tempPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border border-border bg-bg-elevated p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-md font-semibold text-foreground"><ShieldCheck className="size-4 text-gold-base" /> Add Administrator</h2>
          <button onClick={onClose}><X className="size-5 text-muted-foreground" /></button>
        </div>

        {tempPassword ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
              <Mail className="mt-0.5 size-4 shrink-0" />
              <span>Account created and the invite was emailed. Share this one-time temporary password — it won't be shown again.</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-base p-3">
              <KeyRound className="size-4 text-gold-base" />
              <code className="flex-1 font-mono text-sm text-foreground">{tempPassword}</code>
              <button onClick={copyPw} className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-bg-elevated hover:text-foreground" title="Copy">
                {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
              </button>
            </div>
            <Button className="w-full" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-secondary-foreground">Full Name</label>
              <input {...register('name')} className="input" placeholder="Ayesha Khan" />
              {errors.name && <p className="mt-1 text-xs text-error">{errors.name.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-secondary-foreground">Email</label>
              <input {...register('email')} className="input" placeholder="admin@indusai.pk" />
              {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-secondary-foreground">Phone (optional)</label>
              <input {...register('phone')} className="input" placeholder="+92300…" />
            </div>
            <p className="text-xs text-muted-foreground">A temporary password is generated and emailed. The admin can sign in immediately and change it.</p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating…' : 'Create'}</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function DeleteAdminModal({ admin, onClose, onDone }: { admin: AdminRow; onClose: () => void; onDone: () => void }) {
  const mut = useMutation({
    mutationFn: () => deleteAdmin(admin.id),
    onSuccess: () => { toast.success('Administrator deleted.'); onDone(); },
    onError: (e) => toast.error(getApiError(e).message),
  });
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border border-border bg-bg-elevated p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-2 font-display text-md font-semibold text-foreground">Delete administrator</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Permanently delete <span className="text-foreground">{admin.name}</span>? Admins with product or activity history can't be deleted — suspend them instead.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={() => mut.mutate()} disabled={mut.isPending}>{mut.isPending ? 'Deleting…' : 'Delete'}</Button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────── Customers ──────────────────────────────

function CustomersTab() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['owner-customers', search],
    queryFn: () => listCustomers({ search: search || undefined, limit: 50 }),
  });
  const rows = data?.items ?? [];

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or email…" className="h-9 w-52 rounded-md border border-input bg-bg-surface pl-8 pr-3 text-sm text-foreground outline-none focus:border-gold-dim" />
        </div>
        <span className="ml-auto text-sm text-muted-foreground">{data?.pagination.total ?? 0} customers</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Customer</th>
              <th className="p-3 font-medium">Orders</th>
              <th className="p-3 font-medium">Total Spent</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No customers found.</td></tr>
            ) : (
              rows.map((c) => (
                <tr key={c.id} className="hover:bg-bg-elevated/50">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-bg-elevated text-xs font-semibold text-gold-base">
                        {c.avatar ? <img src={c.avatar} alt="" className="size-full object-cover" /> : initials(c.name)}
                      </span>
                      <div>
                        <p className="font-medium text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 tabular-nums text-foreground">{c.orderCount}</td>
                  <td className="p-3 tabular-nums text-foreground">{formatPrice(c.totalSpent)}</td>
                  <td className="p-3">
                    {c.isActive ? (
                      <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs text-success">Active</span>
                    ) : (
                      <span className="rounded-full bg-error/15 px-2 py-0.5 text-xs text-error">Suspended</span>
                    )}
                  </td>
                  <td className="p-3">
                    <Link to={`/admin/customers/${c.id}`} className="inline-flex items-center gap-1 text-gold-base hover:underline"><Eye className="size-4" /> View</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
