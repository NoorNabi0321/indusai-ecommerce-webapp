import { z } from 'zod';

/** Split a comma-separated query value into a trimmed string array. */
const csv = z
  .string()
  .transform((s) => s.split(',').map((x) => x.trim()).filter(Boolean));

const boolish = z.preprocess(
  (v) => (v === 'true' ? true : v === 'false' ? false : v),
  z.boolean().optional(),
);

export const productQuerySchema = z.object({
  category: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  size: csv.optional(),
  color: csv.optional(),
  brand: csv.optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  inStock: boolish,
  search: z.string().trim().min(1).optional(),
  sortBy: z.enum(['relevance', 'price-asc', 'price-desc', 'newest', 'rating']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ProductQuery = z.infer<typeof productQuerySchema>;
