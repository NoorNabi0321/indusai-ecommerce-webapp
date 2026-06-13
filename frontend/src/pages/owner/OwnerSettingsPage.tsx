import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import {
  User, Mail, Phone, Lock, Camera, ShieldCheck, ShieldOff, Smartphone, Activity, LogIn, Copy, Check,
} from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { getInitials, formatDateTime } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { updateProfile, changePassword, uploadAvatar } from '@/lib/api/account.api';
import { getMyActivity } from '@/lib/api/admin-settings.api';
import { setup2FA, enable2FA, disable2FA } from '@/lib/api/twofactor.api';
import { toast } from '@/lib/toast';
import { getApiError } from '@/lib/apiError';
import { FormInput } from '@/components/auth/FormInput';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { Button } from '@/components/ui/button';

const profileSchema = z.object({
  name: z.string().min(2, 'Enter your name'),
  phone: z.string().min(7, 'Enter a valid phone number'),
});
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(8, 'At least 8 characters').regex(/[A-Za-z]/, 'Add a letter').regex(/[0-9]/, 'Add a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

const ACTION_LABELS: Record<string, string> = {
  LOGIN: 'Signed in', CONFIG_UPDATE: 'Updated settings', ADMIN_CREATE: 'Created an admin',
  PRODUCT_DELETE_APPROVE: 'Approved a deletion', '2FA_ENABLE': 'Enabled 2FA', '2FA_DISABLE': 'Disabled 2FA',
};
const actionLabel = (a: string) => ACTION_LABELS[a] ?? a.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export default function OwnerSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    document.title = `Settings · ${APP_NAME} Owner`;
  }, []);

  const profileForm = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), values: { name: user?.name ?? '', phone: user?.phone ?? '' } });
  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });
  const newPassword = passwordForm.watch('newPassword', '');

  const { data: activity } = useQuery({ queryKey: ['owner-activity'], queryFn: () => getMyActivity(15) });

  async function onSaveProfile(values: ProfileValues) {
    try { setUser(await updateProfile(values)); toast.success('Profile updated.'); }
    catch (e) { toast.error(getApiError(e).message); }
  }
  async function onChangePassword(values: PasswordValues) {
    try { await changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword }); toast.success('Password updated.'); passwordForm.reset(); }
    catch (e) { toast.error(getApiError(e).message); }
  }
  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { setUser(await uploadAvatar(file)); toast.success('Avatar updated.'); }
    catch (err) { toast.error(getApiError(err).message); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  return (
    <div>
      <h1 className="mb-5 font-display text-xl font-bold text-foreground">Account Settings</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile */}
        <section className="rounded-xl border border-border bg-bg-surface p-6">
          <h2 className="mb-5 font-display text-md font-semibold text-foreground">Profile</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="grid size-20 place-items-center overflow-hidden rounded-full bg-bg-elevated text-xl font-semibold text-gold-base">
                {user?.avatar ? <img src={user.avatar} alt="" className="size-full object-cover" /> : getInitials(user?.name ?? 'U')}
              </div>
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full bg-gold-base text-bg-base" aria-label="Change avatar">
                <Camera className="size-4" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onAvatarChange} />
            </div>
            <p className="flex items-center gap-1.5 text-sm font-medium text-foreground"><ShieldCheck className="size-4 text-gold-base" /> Owner</p>
          </div>
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="mt-6 grid gap-4">
            <FormInput label="Full Name" icon={User} error={profileForm.formState.errors.name?.message} {...profileForm.register('name')} />
            <FormInput label="Phone Number" icon={Phone} error={profileForm.formState.errors.phone?.message} {...profileForm.register('phone')} />
            <FormInput label="Email (read-only)" icon={Mail} value={user?.email ?? ''} readOnly disabled />
            <Button type="submit" disabled={profileForm.formState.isSubmitting}>{profileForm.formState.isSubmitting ? 'Saving…' : 'Save Changes'}</Button>
          </form>
        </section>

        {/* Password */}
        <section className="rounded-xl border border-border bg-bg-surface p-6">
          <h2 className="mb-5 font-display text-md font-semibold text-foreground">Change Password</h2>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="grid gap-4">
            <FormInput label="Current Password" icon={Lock} type="password" error={passwordForm.formState.errors.currentPassword?.message} {...passwordForm.register('currentPassword')} />
            <div>
              <FormInput label="New Password" icon={Lock} type="password" error={passwordForm.formState.errors.newPassword?.message} {...passwordForm.register('newPassword')} />
              <div className="mt-2"><PasswordStrength password={newPassword} /></div>
            </div>
            <FormInput label="Confirm New Password" icon={Lock} type="password" error={passwordForm.formState.errors.confirmPassword?.message} {...passwordForm.register('confirmPassword')} />
            <Button type="submit" disabled={passwordForm.formState.isSubmitting}>{passwordForm.formState.isSubmitting ? 'Updating…' : 'Update Password'}</Button>
          </form>
        </section>

        {/* 2FA */}
        <section className="rounded-xl border border-border bg-bg-surface p-6 lg:col-span-2">
          <TwoFactorSection
            enabled={Boolean(user?.twoFactorEnabled)}
            onChange={(enabled) => { if (user) setUser({ ...user, twoFactorEnabled: enabled }); }}
          />
        </section>

        {/* Activity */}
        <section className="rounded-xl border border-border bg-bg-surface p-6 lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-1.5 font-display text-md font-semibold text-foreground"><Activity className="size-4 text-gold-base" /> Recent Activity</h2>
          {!activity || activity.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No recent activity recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr><th className="py-2 pr-3 font-medium">Action</th><th className="py-2 pr-3 font-medium">Target</th><th className="py-2 pr-3 font-medium">IP</th><th className="py-2 font-medium">When</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activity.map((a) => (
                    <tr key={a.id}>
                      <td className="py-2.5 pr-3"><span className="inline-flex items-center gap-1.5 font-medium text-foreground">{a.action === 'LOGIN' && <LogIn className="size-3.5 text-success" />}{actionLabel(a.action)}</span></td>
                      <td className="py-2.5 pr-3 text-muted-foreground">{a.target ?? '—'}</td>
                      <td className="py-2.5 pr-3 font-mono text-xs text-muted-foreground">{a.ipAddress ?? '—'}</td>
                      <td className="py-2.5 text-muted-foreground">{formatDateTime(a.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function TwoFactorSection({ enabled, onChange }: { enabled: boolean; onChange: (enabled: boolean) => void }) {
  const [setup, setSetup] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [copied, setCopied] = useState(false);

  async function startSetup() {
    setBusy(true);
    try { setSetup(await setup2FA()); }
    catch (e) { toast.error(getApiError(e).message); }
    finally { setBusy(false); }
  }
  async function confirmEnable() {
    setBusy(true);
    try { await enable2FA(code); toast.success('Two-factor authentication enabled.'); setSetup(null); setCode(''); onChange(true); }
    catch (e) { toast.error(getApiError(e).message); }
    finally { setBusy(false); }
  }
  async function confirmDisable() {
    setBusy(true);
    try { await disable2FA(code); toast.success('Two-factor authentication disabled.'); setDisabling(false); setCode(''); onChange(false); }
    catch (e) { toast.error(getApiError(e).message); }
    finally { setBusy(false); }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-md font-semibold text-foreground"><Smartphone className="size-4 text-gold-base" /> Two-Factor Authentication</h2>
        {enabled
          ? <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs text-success"><ShieldCheck className="size-3" /> Enabled</span>
          : <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"><ShieldOff className="size-3" /> Disabled</span>}
      </div>
      <p className="mb-4 text-sm text-muted-foreground">Protect your account with a time-based one-time code from an authenticator app (Google Authenticator, Authy, etc.).</p>

      {enabled ? (
        disabling ? (
          <div className="max-w-xs space-y-3">
            <p className="text-sm text-muted-foreground">Enter a current code to turn off 2FA:</p>
            <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="123456" className="input" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setDisabling(false); setCode(''); }}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDisable} disabled={busy || code.length !== 6}>{busy ? 'Disabling…' : 'Disable 2FA'}</Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setDisabling(true)}><ShieldOff className="size-4" /> Disable 2FA</Button>
        )
      ) : setup ? (
        <div className="grid gap-5 sm:grid-cols-[auto_1fr]">
          <div className="rounded-lg bg-white p-3"><QRCodeSVG value={setup.otpauthUrl} size={144} /></div>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">1. Scan the QR code, or enter this key manually:</p>
            <div className="flex max-w-xs items-center gap-2 rounded-lg border border-border bg-bg-base p-2">
              <code className="flex-1 break-all font-mono text-xs text-foreground">{setup.secret}</code>
              <button onClick={() => { navigator.clipboard.writeText(setup.secret); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:text-foreground">
                {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
              </button>
            </div>
            <p className="text-sm text-muted-foreground">2. Enter the 6-digit code to confirm:</p>
            <div className="flex max-w-xs gap-2">
              <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="123456" className="input" />
              <Button onClick={confirmEnable} disabled={busy || code.length !== 6}>{busy ? 'Verifying…' : 'Enable'}</Button>
            </div>
            <button onClick={() => { setSetup(null); setCode(''); }} className="text-xs text-muted-foreground hover:text-gold-base">Cancel</button>
          </div>
        </div>
      ) : (
        <Button onClick={startSetup} disabled={busy}><ShieldCheck className="size-4" /> {busy ? 'Starting…' : 'Enable 2FA'}</Button>
      )}
    </div>
  );
}
