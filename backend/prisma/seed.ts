import bcrypt from 'bcryptjs';
import { PrismaClient, type Prisma } from '@prisma/client';
import { env } from '../src/config/env';

const prisma = new PrismaClient();

/** Deterministic slug helper. */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

interface SeedProduct {
  name: string;
  brand: string;
  basePrice: number;
  comparePrice?: number;
  featured?: boolean;
  variants: { size?: string; color?: string; stock: number }[];
}

const CATEGORIES: { name: string; description: string; products: SeedProduct[] }[] = [
  {
    name: 'Shirts',
    description: 'Premium shirts for every occasion.',
    products: [
      { name: 'Classic Oxford Shirt', brand: 'Indus Basics', basePrice: 2499, comparePrice: 3499, featured: true, variants: [{ size: 'S', color: 'White', stock: 12 }, { size: 'M', color: 'White', stock: 8 }, { size: 'L', color: 'Blue', stock: 5 }] },
      { name: 'Linen Casual Shirt', brand: 'Indus Basics', basePrice: 1999, variants: [{ size: 'M', color: 'Beige', stock: 15 }, { size: 'L', color: 'Beige', stock: 0 }] },
      { name: 'Slim Fit Formal Shirt', brand: 'Karachi Couture', basePrice: 2799, comparePrice: 3299, variants: [{ size: 'M', color: 'Black', stock: 10 }, { size: 'L', color: 'Black', stock: 3 }] },
      { name: 'Checkered Flannel Shirt', brand: 'Highland', basePrice: 2299, variants: [{ size: 'L', color: 'Red', stock: 7 }, { size: 'XL', color: 'Green', stock: 4 }] },
      { name: 'Denim Overshirt', brand: 'Indus Denim', basePrice: 3499, featured: true, variants: [{ size: 'M', color: 'Indigo', stock: 6 }, { size: 'L', color: 'Indigo', stock: 2 }] },
    ],
  },
  {
    name: 'Shoes',
    description: 'Footwear that blends comfort and style.',
    products: [
      { name: 'Leather Derby Shoes', brand: 'Lahore Leather', basePrice: 6999, comparePrice: 8999, featured: true, variants: [{ size: '41', color: 'Brown', stock: 5 }, { size: '42', color: 'Brown', stock: 9 }, { size: '43', color: 'Black', stock: 0 }] },
      { name: 'Running Sneakers', brand: 'Velocity', basePrice: 4999, variants: [{ size: '42', color: 'Grey', stock: 11 }, { size: '43', color: 'Grey', stock: 6 }] },
      { name: 'Suede Loafers', brand: 'Lahore Leather', basePrice: 5499, variants: [{ size: '41', color: 'Tan', stock: 4 }, { size: '44', color: 'Navy', stock: 3 }] },
      { name: 'Canvas Slip-Ons', brand: 'Velocity', basePrice: 2499, variants: [{ size: '42', color: 'White', stock: 18 }, { size: '43', color: 'Black', stock: 12 }] },
      { name: 'Chelsea Boots', brand: 'Highland', basePrice: 7499, comparePrice: 9999, featured: true, variants: [{ size: '42', color: 'Black', stock: 2 }, { size: '43', color: 'Brown', stock: 5 }] },
    ],
  },
  {
    name: 'Jewellery',
    description: 'Handcrafted jewellery and timeless accessories.',
    products: [
      { name: 'Sterling Silver Pendant', brand: 'Sindh Silver', basePrice: 3999, comparePrice: 4999, featured: true, variants: [{ color: 'Silver', stock: 8 }] },
      { name: 'Gold-Plated Hoop Earrings', brand: 'Aurum', basePrice: 2499, variants: [{ color: 'Gold', stock: 14 }] },
      { name: 'Beaded Charm Bracelet', brand: 'Sindh Silver', basePrice: 1799, variants: [{ color: 'Turquoise', stock: 9 }] },
      { name: 'Minimalist Chain Necklace', brand: 'Aurum', basePrice: 2999, variants: [{ color: 'Rose Gold', stock: 0 }] },
      { name: 'Statement Cocktail Ring', brand: 'Aurum', basePrice: 3499, featured: true, variants: [{ size: '7', color: 'Emerald', stock: 4 }, { size: '8', color: 'Emerald', stock: 3 }] },
    ],
  },
  {
    name: 'Electronics',
    description: 'Smart gadgets and everyday electronics.',
    products: [
      { name: 'Wireless Noise-Cancelling Headphones', brand: 'SonicWave', basePrice: 12999, comparePrice: 15999, featured: true, variants: [{ color: 'Black', stock: 7 }, { color: 'Silver', stock: 4 }] },
      { name: 'Smart Fitness Watch', brand: 'PulseTech', basePrice: 8999, variants: [{ color: 'Black', stock: 10 }, { color: 'Rose', stock: 6 }] },
      { name: 'Portable Bluetooth Speaker', brand: 'SonicWave', basePrice: 4499, variants: [{ color: 'Blue', stock: 13 }, { color: 'Black', stock: 0 }] },
      { name: '20000mAh Power Bank', brand: 'VoltCore', basePrice: 3299, variants: [{ color: 'White', stock: 20 }] },
      { name: 'Mechanical Keyboard', brand: 'KeyForge', basePrice: 6499, comparePrice: 7999, featured: true, variants: [{ color: 'Black', stock: 5 }, { color: 'White', stock: 2 }] },
    ],
  },
];

async function main(): Promise<void> {
  console.log('🌱 Seeding database…');

  // ── Owner account ──
  if (!env.SEED_OWNER_PASSWORD) {
    throw new Error('SEED_OWNER_PASSWORD is required to seed the owner account.');
  }
  const ownerEmail = env.SEED_OWNER_EMAIL ?? 'owner@indusai.pk';
  const hashedPassword = await bcrypt.hash(env.SEED_OWNER_PASSWORD, 12);

  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {},
    create: {
      email: ownerEmail,
      name: 'IndusAI Owner',
      password: hashedPassword,
      role: 'OWNER',
      isVerified: true,
      isActive: true,
    },
  });
  console.log(`  ✓ Owner account: ${owner.email}`);

  // ── Categories + products ──
  let productCount = 0;
  let variantCount = 0;

  for (const cat of CATEGORIES) {
    const categorySlug = slugify(cat.name);
    const category = await prisma.category.upsert({
      where: { slug: categorySlug },
      update: { description: cat.description },
      create: { name: cat.name, slug: categorySlug, description: cat.description },
    });

    for (const p of cat.products) {
      const productSlug = slugify(p.name);
      const skuBase = `${cat.name.slice(0, 3).toUpperCase()}-${productSlug.slice(0, 12)}`;

      const variants: Prisma.ProductVariantCreateWithoutProductInput[] = p.variants.map(
        (v, i) => ({
          size: v.size ?? null,
          color: v.color ?? null,
          stock: v.stock,
          sku: `${skuBase}-${i + 1}`.toUpperCase(),
        }),
      );

      await prisma.product.upsert({
        where: { slug: productSlug },
        update: {},
        create: {
          name: p.name,
          slug: productSlug,
          description: `${p.name} by ${p.brand}. ${cat.description}`,
          categoryId: category.id,
          brand: p.brand,
          tags: [cat.name.toLowerCase(), p.brand.toLowerCase()],
          isFeatured: p.featured ?? false,
          basePrice: p.basePrice,
          comparePrice: p.comparePrice ?? null,
          createdById: owner.id,
          variants: { create: variants },
          images: {
            create: [
              {
                url: `https://picsum.photos/seed/${productSlug}/800/800`,
                publicId: `seed/${productSlug}`,
                isMain: true,
                order: 0,
              },
              {
                url: `https://picsum.photos/seed/${productSlug}-2/800/800`,
                publicId: `seed/${productSlug}-2`,
                isMain: false,
                order: 1,
              },
            ],
          },
        },
      });
      productCount += 1;
      variantCount += variants.length;
    }
    console.log(`  ✓ Category "${cat.name}" with ${cat.products.length} products`);
  }

  console.log(`🌱 Seed complete — ${productCount} products, ${variantCount} variants.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
