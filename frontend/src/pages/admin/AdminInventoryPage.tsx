import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Papa from 'papaparse';
import {
  Search, Upload, Boxes, AlertTriangle, AlertCircle, TrendingDown, ImageOff, Check, Loader2, Download,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import {
  listInventory, updateVariantStock, bulkUpdateStock,
  type AlertLevel, type InventoryRow,
} from '@/lib/api/inventory.api';
import { toast } from '@/lib/toast';
import { getApiError } from '@/lib/apiError';
import { Button } from '@/components/ui/button';

const TABS: { key: string; label: string; level?: AlertLevel; includeHealthy?: boolean }[] = [
  { key: 'alerts', label: 'All Alerts' },
  { key: 'critical', label: 'Critical', level: 'critical' },
  { key: 'low', label: 'Low', level: 'low' },
  { key: 'moderate', label: 'Moderate', level: 'moderate' },
  { key: 'all', label: 'All Products', includeHealthy: true },
];

const LEVEL_BADGE: Record<AlertLevel, string> = {
  critical: 'bg-error/15 text-error',
  low: 'bg-warning/15 text-warning',
  moderate: 'bg-info/15 text-info',
  healthy: 'bg-success/15 text-success',
};

const SUMMARY = [
  { key: 'critical', label: 'Critical', icon: AlertCircle, color: 'text-error' },
  { key: 'low', label: 'Low', icon: AlertTriangle, color: 'text-warning' },
  { key: 'moderate', label: 'Moderate', icon: TrendingDown, color: 'text-info' },
] as const;

export default function AdminInventoryPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('alerts');
  const [search, setSearch] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    document.title = `Inventory · ${APP_NAME} Admin`;
  }, []);

  const active = TABS.find((t) => t.key === tab)!;
  const { data, isLoading } = useQuery({
    queryKey: ['admin-inventory', tab, search],
    queryFn: () => listInventory({
      level: active.level,
      includeHealthy: active.includeHealthy,
      search: search || undefined,
      limit: 100,
    }),
  });

  const bulkMut = useMutation({
    mutationFn: (updates: { sku: string; stock: number }[]) => bulkUpdateStock(updates),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: ['admin-inventory'] });
      toast.success(`Updated ${res.updated} variant(s).${res.notFound.length ? ` ${res.notFound.length} SKU(s) not found.` : ''}`);
    },
    onError: (e) => toast.error(getApiError(e).message),
  });

  function onCsvSelected(file: File) {
    setImporting(true);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setImporting(false);
        const fields = (result.meta.fields ?? []).map((f) => f.toLowerCase().trim());
        if (!fields.includes('sku') || !fields.includes('stock')) {
          toast.error('CSV must have "sku" and "stock" column headers.');
          return;
        }
        const updates: { sku: string; stock: number }[] = [];
        for (const row of result.data) {
          const entries = Object.fromEntries(Object.entries(row).map(([k, v]) => [k.toLowerCase().trim(), v]));
          const sku = String(entries.sku ?? '').trim();
          const stock = Number(entries.stock);
          if (sku && Number.isInteger(stock) && stock >= 0) updates.push({ sku, stock });
        }
        if (updates.length === 0) {
          toast.error('No valid rows found in CSV.');
          return;
        }
        bulkMut.mutate(updates);
      },
      error: () => {
        setImporting(false);
        toast.error('Failed to parse CSV file.');
      },
    });
  }

  function downloadTemplate() {
    const rows = (data?.items ?? []).slice(0, 50).map((r) => ({ sku: r.sku, stock: r.stock }));
    const csv = Papa.unparse(rows.length ? rows : [{ sku: 'EXAMPLE-SKU-1', stock: 0 }]);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const rows = data?.items ?? [];
  const summary = data?.summary;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Boxes className="size-5 text-gold-base" />
          <h1 className="font-display text-xl font-bold text-foreground">Inventory Alerts</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={downloadTemplate}><Download className="size-4" /> Template</Button>
          <Button size="sm" disabled={importing || bulkMut.isPending} onClick={() => fileRef.current?.click()}>
            {importing || bulkMut.isPending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Import CSV
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onCsvSelected(f);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      {/* Summary strip */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {SUMMARY.map((s) => (
          <button
            key={s.key}
            onClick={() => setTab(s.key)}
            className={cn(
              'rounded-xl border bg-bg-surface p-4 text-left transition-colors',
              tab === s.key ? 'border-gold-dim' : 'border-border hover:border-bg-overlay',
            )}
          >
            <div className="flex items-center justify-between">
              <span className={cn('grid size-9 place-items-center rounded-md bg-bg-elevated', s.color)}>
                <s.icon className="size-4" />
              </span>
              <span className="font-display text-2xl font-bold text-foreground tabular-nums">{summary?.[s.key] ?? 0}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{s.label} stock</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                tab === t.key ? 'bg-gold-base text-bg-base' : 'border border-border text-muted-foreground hover:text-foreground',
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
            placeholder="Product or SKU…"
            className="h-9 w-52 rounded-md border border-input bg-bg-surface pl-8 pr-3 text-sm text-foreground outline-none focus:border-gold-dim"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Product</th>
              <th className="p-3 font-medium">Variant</th>
              <th className="p-3 font-medium">SKU</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium">Stock</th>
              <th className="p-3 font-medium">Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">
                {search ? 'No matching variants.' : 'No stock alerts — everything is well stocked. 🎉'}
              </td></tr>
            ) : (
              rows.map((r) => <InventoryRowItem key={r.variantId} row={r} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InventoryRowItem({ row }: { row: InventoryRow }) {
  const qc = useQueryClient();
  const [value, setValue] = useState(String(row.stock));
  const dirty = value !== '' && Number(value) !== row.stock;

  const mut = useMutation({
    mutationFn: (stock: number) => updateVariantStock(row.variantId, stock),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-inventory'] });
      toast.success('Stock updated.');
    },
    onError: (e) => {
      setValue(String(row.stock));
      toast.error(getApiError(e).message);
    },
  });

  function save() {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0 || n === row.stock) return;
    mut.mutate(n);
  }

  const variantLabel = [row.size, row.color].filter(Boolean).join(' · ') || '—';

  return (
    <tr className={cn('hover:bg-bg-elevated/50', !row.isActive && 'opacity-50')}>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-md bg-bg-elevated text-muted-foreground">
            {row.image ? <img src={row.image} alt="" className="size-full object-cover" /> : <ImageOff className="size-4" />}
          </span>
          <Link to={`/admin/products/${row.productId}/edit`} className="font-medium text-foreground hover:text-gold-base">
            {row.productName}
          </Link>
          {!row.isActive && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">Inactive</span>}
        </div>
      </td>
      <td className="p-3 text-muted-foreground">{variantLabel}</td>
      <td className="p-3 font-mono text-xs text-muted-foreground">{row.sku}</td>
      <td className="p-3 tabular-nums text-muted-foreground">{row.price != null ? formatPrice(row.price) : '—'}</td>
      <td className="p-3">
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
            className="h-8 w-20 rounded-md border border-input bg-bg-base px-2 text-sm tabular-nums text-foreground outline-none focus:border-gold-dim"
          />
          {dirty && (
            <button
              onClick={save}
              disabled={mut.isPending}
              className="grid size-8 place-items-center rounded-md bg-gold-base text-bg-base hover:bg-gold-dim disabled:opacity-50"
              title="Save"
            >
              {mut.isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            </button>
          )}
        </div>
      </td>
      <td className="p-3">
        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', LEVEL_BADGE[row.level])}>
          {row.level}
        </span>
      </td>
    </tr>
  );
}
