import { useEffect, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ScrollText, Download, LogIn, Filter } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { listAuditLogs, getAuditFilters } from '@/lib/api/audit.api';
import { Button } from '@/components/ui/button';

const ACTION_LABELS: Record<string, string> = {
  LOGIN: 'Signed in',
  PRODUCT_CREATE: 'Created product',
  PRODUCT_UPDATE: 'Updated product',
  STOCK_UPDATE: 'Updated stock',
  STOCK_BULK_UPDATE: 'Bulk stock update',
  ORDER_STATUS_UPDATE: 'Updated order',
  CUSTOMER_SUSPEND: 'Suspended customer',
  CUSTOMER_ACTIVATE: 'Reactivated customer',
  ADMIN_CREATE: 'Created admin',
  ADMIN_SUSPEND: 'Suspended admin',
  ADMIN_ACTIVATE: 'Reactivated admin',
  ADMIN_DELETE: 'Deleted admin',
  PRODUCT_DELETE_REQUEST: 'Requested deletion',
  PRODUCT_DELETE_APPROVE: 'Approved deletion',
  PRODUCT_DELETE_REJECT: 'Rejected deletion',
  CONFIG_UPDATE: 'Updated settings',
  '2FA_ENABLE': 'Enabled 2FA',
  '2FA_DISABLE': 'Disabled 2FA',
};
const actionLabel = (a: string) => ACTION_LABELS[a] ?? a.replace(/_/g, ' ').toLowerCase();

function downloadCsv(rows: Record<string, string | number>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function OwnerAuditLogPage() {
  const [actorId, setActorId] = useState('');
  const [action, setAction] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    document.title = `Audit Log · ${APP_NAME}`;
  }, []);

  const { data: filters } = useQuery({ queryKey: ['audit-filters'], queryFn: getAuditFilters });
  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', actorId, action, from, to, page],
    queryFn: () => listAuditLogs({ actorId: actorId || undefined, action: action || undefined, from: from || undefined, to: to || undefined, page, limit: 30 }),
    placeholderData: keepPreviousData,
  });

  const rows = data?.items ?? [];
  const total = data?.pagination.total ?? 0;
  const totalPages = data?.pagination.totalPages ?? 1;

  function resetPage<T>(setter: (v: T) => void) {
    return (v: T) => { setter(v); setPage(1); };
  }

  function exportCsv() {
    downloadCsv(rows.map((r) => ({
      time: formatDateTime(r.createdAt), actor: r.actorName, role: r.actorRole,
      action: actionLabel(r.action), target: r.target ?? '', ip: r.ipAddress ?? '',
    })));
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ScrollText className="size-5 text-gold-base" />
          <h1 className="font-display text-xl font-bold text-foreground">Audit Log <span className="text-muted-foreground">({total})</span></h1>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={rows.length === 0}><Download className="size-4" /> Export CSV</Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-bg-surface p-4">
        <Filter className="mb-2 size-4 text-muted-foreground" />
        <label className="text-xs text-muted-foreground">
          Actor
          <select value={actorId} onChange={(e) => resetPage(setActorId)(e.target.value)} className="mt-1 block h-9 w-44 rounded-md border border-input bg-bg-base px-2 text-sm text-foreground outline-none focus:border-gold-dim">
            <option value="">All actors</option>
            {filters?.actors.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.role.toLowerCase()})</option>)}
          </select>
        </label>
        <label className="text-xs text-muted-foreground">
          Action
          <select value={action} onChange={(e) => resetPage(setAction)(e.target.value)} className="mt-1 block h-9 w-44 rounded-md border border-input bg-bg-base px-2 text-sm text-foreground outline-none focus:border-gold-dim">
            <option value="">All actions</option>
            {filters?.actions.map((a) => <option key={a} value={a}>{actionLabel(a)}</option>)}
          </select>
        </label>
        <label className="text-xs text-muted-foreground">
          From
          <input type="date" value={from} max={to || undefined} onChange={(e) => resetPage(setFrom)(e.target.value)} className="mt-1 block h-9 rounded-md border border-input bg-bg-base px-2 text-sm text-foreground outline-none focus:border-gold-dim" />
        </label>
        <label className="text-xs text-muted-foreground">
          To
          <input type="date" value={to} min={from || undefined} onChange={(e) => resetPage(setTo)(e.target.value)} className="mt-1 block h-9 rounded-md border border-input bg-bg-base px-2 text-sm text-foreground outline-none focus:border-gold-dim" />
        </label>
        {(actorId || action || from || to) && (
          <button onClick={() => { setActorId(''); setAction(''); setFrom(''); setTo(''); setPage(1); }} className="mb-0.5 text-xs text-gold-base hover:underline">Clear</button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">When</th>
              <th className="p-3 font-medium">Actor</th>
              <th className="p-3 font-medium">Action</th>
              <th className="p-3 font-medium">Target</th>
              <th className="p-3 font-medium">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No audit entries match these filters.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-bg-elevated/50">
                  <td className="p-3 text-muted-foreground">{formatDateTime(r.createdAt)}</td>
                  <td className="p-3">
                    <span className="font-medium text-foreground">{r.actorName}</span>
                    <span className="ml-1.5 rounded bg-bg-elevated px-1.5 py-0.5 text-[10px] text-muted-foreground">{r.actorRole}</span>
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1.5 text-foreground">
                      {r.action === 'LOGIN' && <LogIn className="size-3.5 text-success" />}
                      {actionLabel(r.action)}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">{r.target ?? '—'}</td>
                  <td className="p-3 font-mono text-xs text-muted-foreground">{r.ipAddress ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
