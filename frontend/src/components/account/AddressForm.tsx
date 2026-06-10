import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Address } from '@/types/user.types';
import { createAddress, updateAddress, type AddressPayload } from '@/lib/api/account.api';
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

interface AddressFormProps {
  initial?: Address;
  onCancel: () => void;
  onSaved: (address: Address) => void;
}

/** Shared create/edit address form (used by the account page and checkout). */
export function AddressForm({ initial, onCancel, onSaved }: AddressFormProps) {
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
      const saved = initial ? await updateAddress(initial.id, payload) : await createAddress(payload);
      toast.success(initial ? 'Address updated.' : 'Address added.');
      onSaved(saved);
    } catch (e) {
      toast.error(getApiError(e).message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 rounded-xl border border-border bg-bg-surface p-5 sm:grid-cols-2">
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
