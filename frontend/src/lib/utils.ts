import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes with conflict resolution (Shadcn standard). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format a number as Pakistani Rupees, e.g. 1999 -> "PKR 1,999". */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format a date for display, e.g. "8 Jun 2026". */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/** Format a date with time, e.g. "8 Jun 2026, 14:30". */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/** Truncate a string to `max` chars, appending an ellipsis when cut. */
export function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return `${str.slice(0, max).trimEnd()}…`;
}

/** Discount percentage from a compare-at price, rounded. Returns 0 if none. */
export function discountPercent(basePrice: number, comparePrice?: number | null): number {
  if (!comparePrice || comparePrice <= basePrice) return 0;
  return Math.round(((comparePrice - basePrice) / comparePrice) * 100);
}

/** Convert a product name into a URL slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** Initials for an avatar fallback, e.g. "Noor Nabi" -> "NN". */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** Promise-based delay (useful for optimistic UI / demos). */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Best-effort map a colour name to a CSS colour for swatch dots. */
export function cssColor(name: string): string {
  const map: Record<string, string> = {
    white: '#ffffff', black: '#111111', blue: '#3b82f6', red: '#ef4444', green: '#22c55e',
    grey: '#9ca3af', gray: '#9ca3af', beige: '#e3d5b8', brown: '#8b5e3c', tan: '#d2b48c',
    navy: '#1e3a8a', silver: '#cbd5e1', gold: '#E4A93A', rose: '#f43f5e', indigo: '#6366f1',
    turquoise: '#14b8a6', emerald: '#10b981', 'rose gold': '#b76e79',
  };
  return map[name.toLowerCase()] ?? '#9ca3af';
}
