import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Eye, ShoppingBag, Users } from 'lucide-react';
import { cn, formatPrice, formatDate } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { listCustomers } from '@/lib/api/customer.api';

const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'suspended', label: 'Suspended' },
];

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    document.title = `Customers · ${APP_NAME} Admin`;
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', search, status],
    queryFn: () => listCustomers({ search: search || undefined, status: status || undefined, limit: 50 }),
  });

  const customers = data?.items ?? [];

  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <Users className="size-5 text-gold-base" />
        <h1 className="font-display text-xl font-bold text-foreground">
          Customers <span className="text-muted-foreground">({data?.pagination.total ?? 0})</span>
        </h1>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setStatus(t.key)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                status === t.key ? 'bg-gold-base text-bg-base' : 'border border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name or email…"
            className="h-9 w-52 rounded-md border border-input bg-bg-surface pl-8 pr-3 text-sm text-foreground outline-none focus:border-gold-dim"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Customer</th>
              <th className="p-3 font-medium">Phone</th>
              <th className="p-3 font-medium">Joined</th>
              <th className="p-3 font-medium">Orders</th>
              <th className="p-3 font-medium">Total Spent</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No customers found.</td></tr>
            ) : (
              customers.map((c) => (
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
                  <td className="p-3 text-muted-foreground">{c.phone ?? '—'}</td>
                  <td className="p-3 text-muted-foreground">{formatDate(c.createdAt)}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-foreground">
                      <ShoppingBag className="size-3.5 text-muted-foreground" /> {c.orderCount}
                    </span>
                  </td>
                  <td className="p-3 tabular-nums text-foreground">{formatPrice(c.totalSpent)}</td>
                  <td className="p-3">
                    {c.isActive ? (
                      <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs text-success">Active</span>
                    ) : (
                      <span className="rounded-full bg-error/15 px-2 py-0.5 text-xs text-error">Suspended</span>
                    )}
                  </td>
                  <td className="p-3">
                    <Link to={`/admin/customers/${c.id}`} className="inline-flex items-center gap-1 text-gold-base hover:underline">
                      <Eye className="size-4" /> View
                    </Link>
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

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
