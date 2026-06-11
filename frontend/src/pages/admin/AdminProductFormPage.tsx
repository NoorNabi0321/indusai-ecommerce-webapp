import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Plus, Trash2, Upload, Star, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import type { ProductImage } from '@/types/product.types';
import { useCategories } from '@/hooks/useProducts';
import {
  getAdminProduct,
  createProduct,
  updateProduct,
  uploadProductImages,
  deleteProductImage,
  type VariantPayload,
} from '@/lib/api/admin-product.api';
import { toast } from '@/lib/toast';
import { getApiError } from '@/lib/apiError';
import { Button } from '@/components/ui/button';

const schema = z.object({
  name: z.string().min(2, 'Required'),
  description: z.string().min(1, 'Required'),
  categoryId: z.string().min(1, 'Select a category'),
  brand: z.string().optional(),
  tags: z.string().optional(),
  basePrice: z.coerce.number().positive('Enter a price'),
  comparePrice: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});
type FormValues = z.infer<typeof schema>;

type VariantRow = VariantPayload & { _key: string };
const blankVariant = (): VariantRow => ({ _key: crypto.randomUUID(), size: '', color: '', stock: 0 });

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: categories } = useCategories();
  const [variants, setVariants] = useState<VariantRow[]>([blankVariant()]);

  useEffect(() => {
    document.title = `${isEdit ? 'Edit' : 'New'} Product · ${APP_NAME} Admin`;
  }, [isEdit]);

  const { data: product } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => getAdminProduct(id!),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true, isFeatured: false },
  });

  useEffect(() => {
    if (!product) return;
    reset({
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      brand: product.brand ?? '',
      tags: (product.tags ?? []).join(', '),
      basePrice: product.basePrice,
      comparePrice: product.comparePrice != null ? String(product.comparePrice) : '',
      isFeatured: product.isFeatured,
      isActive: product.isActive,
    });
    if (product.variants && product.variants.length > 0) {
      setVariants(product.variants.map((v) => ({
        _key: v.id, id: v.id, size: v.size ?? '', color: v.color ?? '', sku: v.sku,
        stock: v.stock, price: v.price ?? undefined,
      })));
    }
  }, [product, reset]);

  async function onSubmit(values: FormValues) {
    const comparePrice = values.comparePrice ? Number(values.comparePrice) : undefined;
    if (comparePrice != null && comparePrice <= values.basePrice) {
      return toast.error('Compare-at price must be greater than the price.');
    }
    const payload = {
      name: values.name,
      description: values.description,
      categoryId: values.categoryId,
      brand: values.brand || undefined,
      tags: (values.tags ?? '').split(',').map((t) => t.trim()).filter(Boolean),
      basePrice: values.basePrice,
      comparePrice,
      isFeatured: values.isFeatured,
      isActive: values.isActive,
      variants: variants.map((v) => ({
        id: v.id,
        size: v.size || undefined,
        color: v.color || undefined,
        sku: v.sku || undefined,
        stock: Number(v.stock) || 0,
        price: v.price ? Number(v.price) : undefined,
      })),
    };

    try {
      if (isEdit) {
        await updateProduct(id!, payload);
        void qc.invalidateQueries({ queryKey: ['admin-product', id] });
        void qc.invalidateQueries({ queryKey: ['admin-products'] });
        toast.success('Product updated.');
      } else {
        const created = await createProduct(payload);
        toast.success('Product created. Add images below.');
        navigate(`/admin/products/${created.id}/edit`, { replace: true });
      }
    } catch (e) {
      toast.error(getApiError(e).message);
    }
  }

  return (
    <div>
      <Link to="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold-base">
        <ChevronLeft className="size-4" /> Back to products
      </Link>
      <h1 className="mb-6 font-display text-xl font-bold text-foreground">{isEdit ? 'Edit Product' : 'Add Product'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main column */}
        <div className="space-y-5">
          <section className="space-y-4 rounded-xl border border-border bg-bg-surface p-5">
            <Field label="Product Name" error={errors.name?.message}>
              <input {...register('name')} className="input" placeholder="Classic Oxford Shirt" />
            </Field>
            <Field label="Description" error={errors.description?.message}>
              <textarea {...register('description')} rows={4} className="input !h-auto min-h-24 py-2" placeholder="Describe the product…" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" error={errors.categoryId?.message}>
                <select {...register('categoryId')} className="input">
                  <option value="">Select…</option>
                  {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Brand">
                <input {...register('brand')} className="input" placeholder="Indus Basics" />
              </Field>
            </div>
            <Field label="Tags (comma-separated)">
              <input {...register('tags')} className="input" placeholder="shirts, casual" />
            </Field>
          </section>

          {/* Variants */}
          <section className="rounded-xl border border-border bg-bg-surface p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-md font-semibold text-foreground">Variants</h2>
              <Button type="button" size="sm" variant="outline" onClick={() => setVariants((vs) => [...vs, blankVariant()])}><Plus className="size-4" /> Add</Button>
            </div>
            <div className="space-y-2">
              {variants.map((v, i) => (
                <div key={v._key} className="grid grid-cols-[1fr_1fr_80px_90px_auto] items-center gap-2">
                  <input value={v.size ?? ''} onChange={(e) => updateVariant(setVariants, i, { size: e.target.value })} className="input h-9" placeholder="Size" />
                  <input value={v.color ?? ''} onChange={(e) => updateVariant(setVariants, i, { color: e.target.value })} className="input h-9" placeholder="Colour" />
                  <input type="number" value={v.stock} onChange={(e) => updateVariant(setVariants, i, { stock: Number(e.target.value) })} className="input h-9" placeholder="Stock" />
                  <input type="number" value={v.price ?? ''} onChange={(e) => updateVariant(setVariants, i, { price: e.target.value ? Number(e.target.value) : undefined })} className="input h-9" placeholder="Price" />
                  {!v.id ? (
                    <button type="button" onClick={() => setVariants((vs) => vs.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-error"><Trash2 className="size-4" /></button>
                  ) : <span className="w-4" />}
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Existing variants can't be removed (order history). Leave size/colour blank for single-variant products.</p>
          </section>

          {/* Images (edit only) */}
          {isEdit && product && <ImageManager productId={product.id} images={product.images ?? []} onChange={() => qc.invalidateQueries({ queryKey: ['admin-product', id] })} />}
          {!isEdit && <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">Save the product first, then you can upload images.</p>}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <section className="space-y-4 rounded-xl border border-border bg-bg-surface p-5">
            <Field label="Price (PKR)" error={errors.basePrice?.message}>
              <input type="number" step="0.01" {...register('basePrice')} className="input" placeholder="2499" />
            </Field>
            <Field label="Compare-at Price (optional)">
              <input type="number" step="0.01" {...register('comparePrice')} className="input" placeholder="3499" />
            </Field>
            <label className="flex items-center justify-between text-sm text-foreground">
              Featured <input type="checkbox" {...register('isFeatured')} className="size-4 accent-gold-base" />
            </label>
            <label className="flex items-center justify-between text-sm text-foreground">
              Active <input type="checkbox" {...register('isActive')} className="size-4 accent-gold-base" />
            </label>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
            </Button>
          </section>
        </aside>
      </form>
    </div>
  );
}

function updateVariant(setter: React.Dispatch<React.SetStateAction<VariantRow[]>>, index: number, patch: Partial<VariantRow>) {
  setter((vs) => vs.map((v, i) => (i === index ? { ...v, ...patch } : v)));
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-secondary-foreground">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}

function ImageManager({ productId, images, onChange }: { productId: string; images: ProductImage[]; onChange: () => void }) {
  const [uploading, setUploading] = useState(false);

  async function onUpload(files: File[]) {
    if (files.length === 0) return;
    setUploading(true);
    try {
      await uploadProductImages(productId, files);
      onChange();
      toast.success('Images uploaded.');
    } catch (e) {
      toast.error(getApiError(e).message);
    } finally {
      setUploading(false);
    }
  }

  async function onRemove(imageId: string) {
    try {
      await deleteProductImage(productId, imageId);
      onChange();
    } catch (e) {
      toast.error(getApiError(e).message);
    }
  }

  return (
    <section className="rounded-xl border border-border bg-bg-surface p-5">
      <h2 className="mb-3 font-display text-md font-semibold text-foreground">Images</h2>
      <div className="flex flex-wrap gap-3">
        {images.map((img) => (
          <div key={img.id} className="relative size-24 overflow-hidden rounded-lg border border-border">
            <img src={img.url} alt="" className="size-full object-cover" />
            {img.isMain && <span className="absolute left-1 top-1 rounded bg-gold-base px-1 text-[10px] font-bold text-bg-base"><Star className="inline size-2.5" /></span>}
            <button type="button" onClick={() => onRemove(img.id)} className="absolute right-1 top-1 grid size-5 place-items-center rounded bg-bg-base/80 text-error"><Trash2 className="size-3" /></button>
          </div>
        ))}
        <label className={cn('grid size-24 cursor-pointer place-items-center rounded-lg border border-dashed border-border text-muted-foreground hover:border-gold-dim', uploading && 'opacity-50')}>
          {uploading ? <span className="text-xs">Uploading…</span> : (images.length === 0 ? <ImageOff className="size-6" /> : <Upload className="size-6" />)}
          <input type="file" accept="image/*" multiple hidden disabled={uploading} onChange={(e) => onUpload(Array.from(e.target.files ?? []))} />
        </label>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">First image becomes the main image. Auto-normalised to 800×800 WebP.</p>
    </section>
  );
}
