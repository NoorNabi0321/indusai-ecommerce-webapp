import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft, Mail, Phone, Calendar, MapPin, ShoppingBag, Wallet,
  ShieldCheck, ShieldOff, BadgeCheck, Ban,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { getCustomer, setCustomerStatus } from '@/lib/api/customer.api';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import { getApiError } from '@/lib/apiError';
import type { OrderStatus } from '@/types/order.types';

export default function AdminCustomerDetailPage() {
  const { customerId } = useParams();
  const qc = useQueryClient();

  const { data: customer, isLoading, isError } = useQuery({
    queryKey: ['admin-customer', customerId],
    queryFn: () => getCustomer(customerId!),
    enabled: Boolean(customerId),
  });

  useEffect(() => {
    document.title = `${customer?.name ?? 'Customer'} · ${APP_NAME} Admin`;
  }, [customer?.name]);

  const statusMut = useMutation({
    mutationFn: (isActive: boolean) => setCustomerStatus(customerId!, isActive),
    onSuccess: (_data, isActive) => {
      void qc.invalidateQueries({ queryKey: ['admin-customer', customerId] });
      void qc.invalidateQueries({ queryKey: ['admin-customers'] });
      toast.success(isActive ? 'Customer activated.' : 'Customer suspended.');
    },
    onError: (e) => toast.error(getApiError(e).message),
  });

  return (
    <div>
      <Link to="/admin/customers" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold-base">
        <ChevronLeft className="size-4" /> Back to customers
      </Link>

      {isLoading ? (
        <p className="p-8 text-center text-muted-foreground">Loading…</p>
      ) : isError || !customer ? (
        <p className="p-8 text-center text-error">Customer not found.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Main column */}
          <div className="space-y-6">
            {/* Header card */}
            <section className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-bg-surface p-5">
              <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-bg-elevated text-lg font-bold text-gold-base">
                {customer.avatar ? <img src={customer.avatar} alt="" className="size-full object-cover" /> : initials(customer.name)}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-xl font-bold text-foreground">{customer.name}</h1>
                  {customer.isActive ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs text-success"><BadgeCheck className="size-3" /> Active</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-error/15 px-2 py-0.5 text-xs text-error"><Ban className="size-3" /> Suspended</span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><Mail className="size-3.5" /> {customer.email}</span>
                  {customer.phone && <span className="inline-flex items-center gap-1.5"><Phone className="size-3.5" /> {customer.phone}</span>}
                  <span className="inline-flex items-center gap-1.5"><Calendar className="size-3.5" /> Joined {formatDate(customer.createdAt)}</span>
                  {customer.isVerified && <span className="inline-flex items-center gap-1.5 text-success"><BadgeCheck className="size-3.5" /> Verified</span>}
                </div>
              </div>
            </section>

            {/* Order history */}
            <section className="rounded-xl border border-border bg-bg-surface">
              <h2 className="border-b border-border p-4 font-display text-md font-semibold text-foreground">
                Order History <span className="text-muted-foreground">({customer.orders.length})</span>
              </h2>
              {customer.orders.length === 0 ? (
                <p className="p-8 text-center text-sm text-muted-foreground">No orders yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2 font-medium">Order</th>
                        <th className="px-4 py-2 font-medium">Date</th>
                        <th className="px-4 py-2 font-medium">Items</th>
                        <th className="px-4 py-2 font-medium">Payment</th>
                        <th className="px-4 py-2 font-medium">Total</th>
                        <th className="px-4 py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {customer.orders.map((o) => (
                        <tr key={o.id} className="hover:bg-bg-elevated/50">
                          <td className="px-4 py-2.5">
                            <Link to={`/admin/orders/${o.id}`} className="font-medium text-gold-base hover:underline">{o.orderNumber}</Link>
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">{formatDate(o.createdAt)}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{o.itemCount}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{o.paymentMethod ?? '—'}</td>
                          <td className="px-4 py-2.5 tabular-nums text-foreground">{formatPrice(o.total)}</td>
                          <td className="px-4 py-2.5"><StatusBadge status={o.status as OrderStatus} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Stats */}
            <section className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-bg-surface p-4">
                <ShoppingBag className="size-4 text-muted-foreground" />
                <p className="mt-2 font-display text-2xl font-bold text-foreground tabular-nums">{customer.stats.totalOrders}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
              <div className="rounded-xl border border-border bg-bg-surface p-4">
                <Wallet className="size-4 text-muted-foreground" />
                <p className="mt-2 font-display text-lg font-bold text-foreground tabular-nums">{formatPrice(customer.stats.totalSpent)}</p>
                <p className="text-xs text-muted-foreground">Total Spent</p>
              </div>
            </section>

            {/* Account actions */}
            <section className="space-y-3 rounded-xl border border-border bg-bg-surface p-5">
              <h2 className="font-display text-md font-semibold text-foreground">Account</h2>
              <p className="text-sm text-muted-foreground">
                {customer.isActive
                  ? 'Suspending blocks login and signs the customer out everywhere.'
                  : 'This account is suspended. Reactivate to restore access.'}
              </p>
              {customer.isActive ? (
                <Button variant="destructive" className="w-full" disabled={statusMut.isPending} onClick={() => statusMut.mutate(false)}>
                  <ShieldOff className="size-4" /> {statusMut.isPending ? 'Suspending…' : 'Suspend Account'}
                </Button>
              ) : (
                <Button className="w-full" disabled={statusMut.isPending} onClick={() => statusMut.mutate(true)}>
                  <ShieldCheck className="size-4" /> {statusMut.isPending ? 'Activating…' : 'Reactivate Account'}
                </Button>
              )}
            </section>

            {/* Addresses */}
            <section className="rounded-xl border border-border bg-bg-surface p-5">
              <h2 className="mb-3 flex items-center gap-1.5 font-display text-md font-semibold text-foreground">
                <MapPin className="size-4" /> Addresses <span className="text-muted-foreground">({customer.addresses.length})</span>
              </h2>
              {customer.addresses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No saved addresses.</p>
              ) : (
                <ul className="space-y-3">
                  {customer.addresses.map((a) => (
                    <li key={a.id} className="rounded-lg border border-border bg-bg-base p-3 text-sm">
                      <div className="mb-0.5 flex items-center gap-2">
                        <span className="font-medium text-foreground">{a.label ?? a.fullName}</span>
                        {a.isDefault && <span className="rounded bg-gold-base/15 px-1.5 py-0.5 text-[10px] font-semibold text-gold-base">Default</span>}
                      </div>
                      <p className="text-muted-foreground">
                        {a.street}, {a.city}, {a.province} {a.postalCode}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.fullName} · {a.phone}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
