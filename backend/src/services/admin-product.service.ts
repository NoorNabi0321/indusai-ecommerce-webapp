import crypto from 'node:crypto';
import type { UserRole } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { uploadImageBuffer, deleteImage, isCloudinaryConfigured } from '../config/cloudinary';
import { mapProduct, PRODUCT_INCLUDE } from './product.service';
import { writeAuditLog } from './audit.service';
import { notifyUser, notifyRole } from './notification.service';
import type { CreateProductInput, UpdateProductInput, VariantInput } from '../validation/admin-product.validation';

export interface Actor {
  id: string;
  role: UserRole;
  ip?: string;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || 'product';
  let slug = base;
  let n = 2;
  while (await prisma.product.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

function generateSku(slug: string, index: number): string {
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${slug.slice(0, 12).toUpperCase()}-${index + 1}-${rand}`;
}

async function fetchAndSerialize(id: string) {
  const product = await prisma.product.findUniqueOrThrow({
    where: { id },
    include: PRODUCT_INCLUDE,
  });
  return mapProduct(product);
}

// ──────────────────────────────── Create ────────────────────────────────

export async function createProduct(actor: Actor, input: CreateProductInput) {
  const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!category) throw AppError.badRequest('Category does not exist.');

  const slug = await uniqueSlug(input.name);

  const product = await prisma.product.create({
    data: {
      name: input.name,
      slug,
      description: input.description,
      categoryId: input.categoryId,
      brand: input.brand,
      tags: input.tags,
      basePrice: input.basePrice,
      comparePrice: input.comparePrice ?? null,
      isFeatured: input.isFeatured,
      isActive: input.isActive,
      createdById: actor.id,
      variants: {
        create: input.variants.map((v, i) => ({
          size: v.size ?? null,
          color: v.color ?? null,
          sku: v.sku ?? generateSku(slug, i),
          stock: v.stock,
          price: v.price ?? null,
        })),
      },
    },
    include: PRODUCT_INCLUDE,
  });

  await writeAuditLog({
    actorId: actor.id,
    actorRole: actor.role,
    action: 'PRODUCT_CREATE',
    target: 'Product',
    targetId: product.id,
    ipAddress: actor.ip,
  });

  return mapProduct(product);
}

// ──────────────────────────────── Update ────────────────────────────────

export async function updateProduct(actor: Actor, id: string, input: UpdateProductInput) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound('Product not found.');

  if (input.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!category) throw AppError.badRequest('Category does not exist.');
  }

  const { variants, ...scalars } = input;

  await prisma.product.update({
    where: { id },
    data: {
      ...scalars,
      comparePrice: scalars.comparePrice === undefined ? undefined : scalars.comparePrice,
    },
  });

  // Variant handling: update existing by id, create new ones. Deletion is not
  // supported here because variants may be referenced by historical orders.
  if (variants) {
    await applyVariantChanges(existing.slug, id, variants);
  }

  await writeAuditLog({
    actorId: actor.id,
    actorRole: actor.role,
    action: 'PRODUCT_UPDATE',
    target: 'Product',
    targetId: id,
    ipAddress: actor.ip,
  });

  return fetchAndSerialize(id);
}

async function applyVariantChanges(slug: string, productId: string, variants: VariantInput[]) {
  for (const [i, v] of variants.entries()) {
    if (v.id) {
      await prisma.productVariant.update({
        where: { id: v.id },
        data: {
          size: v.size ?? null,
          color: v.color ?? null,
          stock: v.stock,
          price: v.price ?? null,
        },
      });
    } else {
      await prisma.productVariant.create({
        data: {
          productId,
          size: v.size ?? null,
          color: v.color ?? null,
          sku: v.sku ?? generateSku(slug, i),
          stock: v.stock,
          price: v.price ?? null,
        },
      });
    }
  }
}

// ─────────────────────────────── Toggle status ──────────────────────────

export async function toggleStatus(actor: Actor, id: string, isActive: boolean) {
  const existing = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw AppError.notFound('Product not found.');

  await prisma.product.update({ where: { id }, data: { isActive } });

  await writeAuditLog({
    actorId: actor.id,
    actorRole: actor.role,
    action: isActive ? 'PRODUCT_ACTIVATE' : 'PRODUCT_DEACTIVATE',
    target: 'Product',
    targetId: id,
    ipAddress: actor.ip,
  });

  return fetchAndSerialize(id);
}

// ──────────────────────────────── Images ────────────────────────────────

export async function addImages(actor: Actor, id: string, files: Express.Multer.File[]) {
  if (!isCloudinaryConfigured) {
    throw new AppError('Image uploads are not configured.', 503, 'UPLOAD_UNAVAILABLE');
  }
  if (!files || files.length === 0) {
    throw AppError.badRequest('No image files provided.');
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!product) throw AppError.notFound('Product not found.');

  const hasMain = product.images.some((img) => img.isMain);
  let nextOrder = product.images.length;

  const created = [];
  for (const [i, file] of files.entries()) {
    const uploaded = await uploadImageBuffer(file.buffer);
    const image = await prisma.productImage.create({
      data: {
        productId: id,
        url: uploaded.url,
        publicId: uploaded.publicId,
        isMain: !hasMain && i === 0,
        order: nextOrder++,
      },
    });
    created.push(image);
  }

  await writeAuditLog({
    actorId: actor.id,
    actorRole: actor.role,
    action: 'PRODUCT_IMAGE_ADD',
    target: 'Product',
    targetId: id,
    ipAddress: actor.ip,
  });

  return created;
}

export async function removeImage(actor: Actor, productId: string, imageId: string) {
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image || image.productId !== productId) {
    throw AppError.notFound('Image not found.');
  }

  if (isCloudinaryConfigured) {
    await deleteImage(image.publicId).catch(() => undefined);
  }
  await prisma.productImage.delete({ where: { id: imageId } });

  // Promote another image to main if we removed the main one.
  if (image.isMain) {
    const next = await prisma.productImage.findFirst({
      where: { productId },
      orderBy: { order: 'asc' },
    });
    if (next) {
      await prisma.productImage.update({ where: { id: next.id }, data: { isMain: true } });
    }
  }

  await writeAuditLog({
    actorId: actor.id,
    actorRole: actor.role,
    action: 'PRODUCT_IMAGE_REMOVE',
    target: 'Product',
    targetId: productId,
    ipAddress: actor.ip,
  });
}

// ───────────────────────── Deletion request workflow ────────────────────

export async function requestDeletion(actor: Actor, productId: string, reason: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw AppError.notFound('Product not found.');

  const existing = await prisma.deletionRequest.findUnique({ where: { productId } });
  if (existing?.status === 'PENDING') {
    throw AppError.conflict('A deletion request is already pending for this product.');
  }

  await prisma.deletionRequest.upsert({
    where: { productId },
    create: { productId, requestedBy: actor.id, reason, status: 'PENDING' },
    update: { requestedBy: actor.id, reason, status: 'PENDING', reviewedBy: null, reviewedAt: null },
  });

  await notifyRole('OWNER', {
    type: 'SYSTEM',
    title: 'Deletion request',
    message: `A deletion was requested for "${product.name}".`,
    link: '/owner/deletions',
  });

  await writeAuditLog({
    actorId: actor.id,
    actorRole: actor.role,
    action: 'PRODUCT_DELETE_REQUEST',
    target: 'Product',
    targetId: productId,
    ipAddress: actor.ip,
  });

  return { productId, status: 'PENDING' as const };
}

export async function approveDeletion(actor: Actor, productId: string) {
  const request = await prisma.deletionRequest.findUnique({ where: { productId } });
  if (!request || request.status !== 'PENDING') {
    throw AppError.badRequest('No pending deletion request for this product.');
  }

  // Soft-delete (archive) to preserve order history.
  await prisma.$transaction([
    prisma.product.update({ where: { id: productId }, data: { isActive: false } }),
    prisma.deletionRequest.update({
      where: { productId },
      data: { status: 'APPROVED', reviewedBy: actor.id, reviewedAt: new Date() },
    }),
  ]);

  await notifyUser(request.requestedBy, {
    type: 'SYSTEM',
    title: 'Deletion approved',
    message: 'Your product deletion request was approved.',
    link: '/admin/products',
  });

  await writeAuditLog({
    actorId: actor.id,
    actorRole: actor.role,
    action: 'PRODUCT_DELETE_APPROVE',
    target: 'Product',
    targetId: productId,
    ipAddress: actor.ip,
  });

  return { productId, status: 'APPROVED' as const };
}

export async function rejectDeletion(actor: Actor, productId: string) {
  const request = await prisma.deletionRequest.findUnique({ where: { productId } });
  if (!request || request.status !== 'PENDING') {
    throw AppError.badRequest('No pending deletion request for this product.');
  }

  await prisma.deletionRequest.update({
    where: { productId },
    data: { status: 'REJECTED', reviewedBy: actor.id, reviewedAt: new Date() },
  });

  await notifyUser(request.requestedBy, {
    type: 'SYSTEM',
    title: 'Deletion rejected',
    message: 'Your product deletion request was rejected.',
    link: '/admin/products',
  });

  await writeAuditLog({
    actorId: actor.id,
    actorRole: actor.role,
    action: 'PRODUCT_DELETE_REJECT',
    target: 'Product',
    targetId: productId,
    ipAddress: actor.ip,
  });

  return { productId, status: 'REJECTED' as const };
}
