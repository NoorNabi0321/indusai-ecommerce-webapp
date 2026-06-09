import { useEffect, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Plus, Star, Pencil, Trash2 } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import type { Address } from '@/types/user.types';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  type AddressPayload,
} from '@/lib/api/account.api';
import { toast } from '@/lib/toast';
import { getApiError } from '@/lib/apiError';
import { FormInput } from '@/components/auth/FormInput';
import { Button } from '@/components/ui/button';

const schema = z.object({
  label: z.string().optional(),
  fullName: z.string().min(2, 'Required'),
  phone: z.string().min(7, 'Required'),
  street: z.string().min(3, 'Required'),
  city: z.string().min(2, 'Required'),
  province: z.string().min(2, 'Required'),
  postalCode: z.string().min(3, 'Required'),
});
type FormValues = z.infer<typeof schema>;

export default function AddressesPage() {
  const qc = useQueryClient();
  const { data: addresses, isLoading } = useQuery({ queryKey: ['addresses'], queryFn: getAddresses });
  const [editing, setEditing] = useState<Address | 'new' | null>(null);

  useEffect(() => {
    document.title = `Addresses · ${APP_NAME}`;
  }, []);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['addresses'] });

  const removeMut = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => { invalidate(); toast.success('Address removed.'); },
    onError: (e) => toast.error(getApiError(e).message),
  });
  const defaultMut = useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: () => { invalidate(); toast.success('Default address updated.'); },
    onError: (e) => toast.error(getApiError(e).message),
  });

  if (isLoading) return <div className="skeleton h-40 rounded-xl" />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-foreground">Saved Addresses</h2>
        {editing === null && (
          <Button size="sm" onClick={() => setEditing('new')}><Plus className="size-4" /> Add address</Button>
        )}
      </div>

      {editing !== null && (
        <AddressForm
          initial={editing === 'new' ? undefined : editing}
          onCancel={() => setEditing(null)}
          onSaved={() => { setEditing(null); invalidate(); }}
        />
      )}

      {(!addresses || addresses.length === 0) && editing === null ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <MapPin className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No saved addresses yet.</p>
          <Button onClick={() => setEditing('new')}><Plus className="size-4" /> Add your first address</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses?.map((addr) => (
            <div key={addr.id} className="relative rounded-xl border border-border bg-bg-surface p-4">
              {addr.isDefault && (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-gold-base/10 px-2 py-0.5 text-xs text-gold-base">
                  <Star className="size-3 fill-gold-base" /> Default
                </span>
              )}
              <p className="text-sm font-medium text-foreground">{addr.fullName}</p>
              {addr.label && <p className="text-xs uppercase tracking-wide text-muted-foreground">{addr.label}</p>}
              <p className="mt-2 text-sm text-muted-foreground">
                {addr.street}, {addr.city}, {addr.province} {addr.postalCode}
              </p>
              <p className="text-sm text-muted-foreground">{addr.phone}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {!addr.isDefault && (
                  <Button size="sm" variant="ghost" onClick={() => defaultMut.mutate(addr.id)}>Set default</Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => setEditing(addr)}><Pencil className="size-4" /> Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => removeMut.mutate(addr.id)}><Trash2 className="size-4" /> Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddressForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial?: Address;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          label: initial.label ?? '',
          fullName: initial.fullName,
          phone: initial.phone,
          street: initial.street,
          city: initial.city,
          province: initial.province,
          postalCode: initial.postalCode,
        }
      : undefined,
  });

  async function onSubmit(values: FormValues) {
    try {
      const payload = values as AddressPayload;
      if (initial) await updateAddress(initial.id, payload);
      else await createAddress(payload);
      toast.success(initial ? 'Address updated.' : 'Address added.');
      onSaved();
    } catch (e) {
      toast.error(getApiError(e).message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-6 grid gap-4 rounded-xl border border-border bg-bg-surface p-5 sm:grid-cols-2">
      <FormInput label="Label (e.g. Home)" error={errors.label?.message} {...register('label')} />
      <FormInput label="Full Name" error={errors.fullName?.message} {...register('fullName')} />
      <FormInput label="Phone" error={errors.phone?.message} {...register('phone')} />
      <FormInput label="Postal Code" error={errors.postalCode?.message} {...register('postalCode')} />
      <div className="sm:col-span-2">
        <FormInput label="Street Address" error={errors.street?.message} {...register('street')} />
      </div>
      <FormInput label="City" error={errors.city?.message} {...register('city')} />
      <FormInput label="Province" error={errors.province?.message} {...register('province')} />
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save address'}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
