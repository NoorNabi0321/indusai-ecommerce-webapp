/** App-wide constants for the IndusAI frontend. */

export const APP_NAME = 'IndusAI Technology';
export const APP_TAGLINE = 'Shop Premium. Shop Smart.';

/** Base URL for the backend API (overridable via VITE_API_URL). */
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

/** Product categories (mirrors backend Category seed). */
export const CATEGORIES = [
  { slug: 'shirts', name: 'Shirts' },
  { slug: 'shoes', name: 'Shoes' },
  { slug: 'jewellery', name: 'Jewellery' },
  { slug: 'electronics', name: 'Electronics' },
] as const;

/** Free shipping threshold in PKR (also configurable server-side by Owner). */
export const FREE_SHIPPING_THRESHOLD = 2000;

/** Pagination default. */
export const DEFAULT_PAGE_SIZE = 20;

/** LocalStorage keys. */
export const STORAGE_KEYS = {
  cart: 'indusai.cart',
  recentSearches: 'indusai.recentSearches',
  authToken: 'indusai.accessToken',
} as const;

/** Animation timing tokens (ms) — mirrors design strategy §7. */
export const MOTION = {
  instant: 0,
  fast: 150,
  standard: 250,
  smooth: 350,
  transition: 500,
  story: 800,
} as const;

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top Rated' },
] as const;
