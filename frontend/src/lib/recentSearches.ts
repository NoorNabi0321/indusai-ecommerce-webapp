import { STORAGE_KEYS } from '@/lib/constants';

const KEY = STORAGE_KEYS.recentSearches;
const MAX = 6;

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string): void {
  const q = query.trim();
  if (!q) return;
  const list = [q, ...getRecentSearches().filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function clearRecentSearches(): void {
  localStorage.removeItem(KEY);
}
