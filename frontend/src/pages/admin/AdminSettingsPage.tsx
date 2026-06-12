import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { User, Mail, Phone, Lock, Camera, LogIn, Activity, ShieldCheck } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { getInitials, formatDateTime } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { updateProfile, changePassword, uploadAvatar } from '@/lib/api/account.api';
import { getMyActivity, type ActivityEntry } from '@/lib/api/admin-settings.api';
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
  LOGIN: 'Signed in',
  PRODUCT_CREATE: 'Created a product',
  PRODUCT_UPDATE: 'Updated a product',
  PRODUCT_STATUS: 'Changed product status',
  STOCK_UPDATE: 'Updated stock',
  STOCK_BULK_UPDATE: 'Bulk-updated stock',
  ORDER_STATUS_UPDATE: 'Updated an order',
  CUSTOMER_SUSPEND: 'Suspended a customer',
  CUSTOMER_ACTIVATE: 'Reactivated a customer',
  DELETION_REQUEST: 'Requested a deletion',
};

function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export default function AdminSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    document.title = `Settings · ${APP_NAME} Admin`;
  }, []);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: { name: user?.name ?? '', phone: user?.phone ?? '' },
  });
  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });
  const newPassword = passwordForm.watch('newPassword', '');

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['admin-activity'],
    queryFn: () => getMyActivity(20),
  });

  async function onSaveProfile(values: ProfileValues) {
    try {
      const updated = await updateProfile(values);
      setUser(updated);
      toast.success('Profile updated.');
    } catch (e) {
      toast.error(getApiError(e).message);
    }
  }

  async function onChangePassword(values: PasswordValues) {
    try {
      await changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      toast.success('Password updated.');
      passwordForm.reset();
    } catch (e) {
      toast.error(getApiError(e).message);
    }
  }

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const updated = await uploadAvatar(file);
      setUser(updated);
      toast.success('Avatar updated.');
    } catch (err) {
      toast.error(getApiError(err).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
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
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full bg-gold-base text-bg-base"
                aria-label="Change avatar"
              >
                <Camera className="size-4" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onAvatarChange} />
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <ShieldCheck className="size-4 text-gold-base" /> {user?.role === 'OWNER' ? 'Owner' : 'Administrator'}
              </p>
              <p className="text-sm text-muted-foreground">{uploading ? 'Uploading…' : 'JPG or PNG. Click the camera to change.'}</p>
            </div>
          </div>

          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="mt-6 grid gap-4">
            <FormInput label="Full Name" icon={User} error={profileForm.formState.errors.name?.message} {...profileForm.register('name')} />
            <FormInput label="Phone Number" icon={Phone} error={profileForm.formState.errors.phone?.message} {...profileForm.register('phone')} />
            <FormInput label="Email (read-only)" icon={Mail} value={user?.email ?? ''} readOnly disabled />
            <Button type="submit" disabled={profileForm.formState.isSubmitting}>
              {profileForm.formState.isSubmitting ? 'Saving…' : 'Save Changes'}
            </Button>
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
            <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
              {passwordForm.formState.isSubmitting ? 'Updating…' : 'Update Password'}
            </Button>
          </form>
        </section>

        {/* Activity log */}
        <section className="rounded-xl border border-border bg-bg-surface p-6 lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-1.5 font-display text-md font-semibold text-foreground">
            <Activity className="size-4 text-gold-base" /> Recent Activity
          </h2>
          {activityLoading ? (
            <div className="skeleton h-32 rounded-lg" />
          ) : !activity || activity.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No recent activity recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-3 font-medium">Action</th>
                    <th className="py-2 pr-3 font-medium">Target</th>
                    <th className="py-2 pr-3 font-medium">IP Address</th>
                    <th className="py-2 font-medium">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activity.map((a: ActivityEntry) => (
                    <tr key={a.id}>
                      <td className="py-2.5 pr-3">
                        <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                          {a.action === 'LOGIN' && <LogIn className="size-3.5 text-success" />}
                          {actionLabel(a.action)}
                        </span>
                      </td>
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
