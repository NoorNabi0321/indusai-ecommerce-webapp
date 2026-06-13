import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings, Store, CreditCard, Wrench, AlertTriangle, Save, FlaskConical, Radio,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import {
  getOwnerConfig, updateOwnerConfig, type SystemConfig, type ConfigPatch,
} from '@/lib/api/config.api';
import { toast } from '@/lib/toast';
import { getApiError } from '@/lib/apiError';
import { Button } from '@/components/ui/button';

const PAYMENTS: { key: keyof SystemConfig; label: string; desc: string }[] = [
  { key: 'codEnabled', label: 'Cash on Delivery', desc: 'Pay in cash when the order arrives' },
  { key: 'stripeEnabled', label: 'Card (Stripe)', desc: 'International card payments' },
  { key: 'jazzcashEnabled', label: 'JazzCash', desc: 'JazzCash mobile wallet' },
  { key: 'easypaisaEnabled', label: 'Easypaisa', desc: 'Easypaisa mobile wallet' },
];

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={cn('relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-50', checked ? 'bg-gold-base' : 'bg-bg-overlay')}
    >
      <span className={cn('absolute top-0.5 size-4 rounded-full bg-white transition-transform', checked ? 'translate-x-4' : 'translate-x-0.5')} />
    </button>
  );
}

export default function OwnerSystemConfigPage() {
  const qc = useQueryClient();
  const { data: config, isLoading } = useQuery({ queryKey: ['owner-config'], queryFn: getOwnerConfig });

  const [storeName, setStoreName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [maintMsg, setMaintMsg] = useState('');

  useEffect(() => {
    document.title = `System Configuration · ${APP_NAME}`;
  }, []);

  useEffect(() => {
    if (config) {
      setStoreName(config.storeName);
      setSupportEmail(config.supportEmail);
      setMaintMsg(config.maintenanceMessage);
    }
  }, [config]);

  const mut = useMutation({
    mutationFn: (patch: ConfigPatch) => updateOwnerConfig(patch),
    onSuccess: (data) => { qc.setQueryData(['owner-config'], data); void qc.invalidateQueries({ queryKey: ['public-config'] }); toast.success('Settings saved.'); },
    onError: (e) => toast.error(getApiError(e).message),
  });

  if (isLoading || !config) {
    return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-44 rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="size-5 text-gold-base" />
        <h1 className="font-display text-xl font-bold text-foreground">System Configuration</h1>
      </div>

      {/* Branding */}
      <section className="rounded-xl border border-border bg-bg-surface p-5">
        <h2 className="mb-4 flex items-center gap-2 font-display text-md font-semibold text-foreground"><Store className="size-4 text-gold-base" /> Store Branding</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-secondary-foreground">Store Name</label>
            <input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="input" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-secondary-foreground">Support Email</label>
            <input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className="input" />
          </div>
        </div>
        <div className="mt-4">
          <Button
            onClick={() => mut.mutate({ storeName, supportEmail })}
            disabled={mut.isPending || (storeName === config.storeName && supportEmail === config.supportEmail)}
          >
            <Save className="size-4" /> Save branding
          </Button>
        </div>
      </section>

      {/* Payments */}
      <section className="rounded-xl border border-border bg-bg-surface p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-display text-md font-semibold text-foreground"><CreditCard className="size-4 text-gold-base" /> Payment Methods</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Mode:</span>
            <div className="flex rounded-md border border-border text-xs">
              <button
                onClick={() => config.paymentMode !== 'sandbox' && mut.mutate({ paymentMode: 'sandbox' })}
                className={cn('flex items-center gap-1 px-2.5 py-1', config.paymentMode === 'sandbox' ? 'bg-warning/20 text-warning' : 'text-muted-foreground')}
              >
                <FlaskConical className="size-3.5" /> Sandbox
              </button>
              <button
                onClick={() => config.paymentMode !== 'live' && mut.mutate({ paymentMode: 'live' })}
                className={cn('flex items-center gap-1 px-2.5 py-1', config.paymentMode === 'live' ? 'bg-success/20 text-success' : 'text-muted-foreground')}
              >
                <Radio className="size-3.5" /> Live
              </button>
            </div>
          </div>
        </div>
        {config.paymentMode === 'live' && (
          <p className="mb-3 rounded-lg border border-warning/30 bg-warning/10 p-2.5 text-xs text-warning">
            Live mode indicator is set, but real gateway processing arrives in Phase 10. Orders still use the internal (sandbox) flow for now.
          </p>
        )}
        <ul className="divide-y divide-border">
          {PAYMENTS.map((p) => (
            <li key={p.key} className="flex items-center gap-3 py-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{p.label}</p>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
              </div>
              <Toggle
                checked={Boolean(config[p.key])}
                disabled={mut.isPending}
                onChange={() => mut.mutate({ [p.key]: !config[p.key] } as ConfigPatch)}
              />
            </li>
          ))}
        </ul>
      </section>

      {/* Maintenance */}
      <section className={cn('rounded-xl border bg-bg-surface p-5', config.maintenanceMode ? 'border-error/50' : 'border-border')}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-md font-semibold text-foreground"><Wrench className="size-4 text-gold-base" /> Maintenance Mode</h2>
          <Toggle checked={config.maintenanceMode} disabled={mut.isPending} onChange={() => mut.mutate({ maintenanceMode: !config.maintenanceMode })} />
        </div>
        {config.maintenanceMode && (
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-error/40 bg-error/10 p-3 text-sm text-error">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>Maintenance mode is <strong>ON</strong>. A banner is shown across the storefront to all visitors.</span>
          </div>
        )}
        <label className="mb-1 block text-sm font-medium text-secondary-foreground">Maintenance message</label>
        <textarea value={maintMsg} onChange={(e) => setMaintMsg(e.target.value)} rows={2} className="input !h-auto py-2" />
        <div className="mt-3">
          <Button variant="outline" onClick={() => mut.mutate({ maintenanceMessage: maintMsg })} disabled={mut.isPending || maintMsg === config.maintenanceMessage}>
            <Save className="size-4" /> Save message
          </Button>
        </div>
      </section>
    </div>
  );
}
