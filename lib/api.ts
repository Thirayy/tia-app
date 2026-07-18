/**
 * Centralized API configuration.
 * Set NEXT_PUBLIC_API_URL in production to your FastAPI backend origin.
 * Leave empty when Nginx proxies /api, /admin, /musyrif on the same host.
 */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');

export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;
}

const ARRAY_KEYS = [
  'data',
  'santri',
  'ustadz',
  'musyrif',
  'kelompok',
  'results',
  'items',
  'laporan',
  'riwayat_lengkap',
] as const;

/** Safely extract an array from varied backend response shapes. */
export function ensureArray<T>(value: unknown, extraKeys: string[] = []): T[] {
  if (Array.isArray(value)) return value as T[];
  if (!value || typeof value !== 'object') return [];

  const record = value as Record<string, unknown>;
  const keys = [...ARRAY_KEYS, ...extraKeys];

  for (const key of keys) {
    const nested = record[key];
    if (Array.isArray(nested)) return nested as T[];
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      const deeper = ensureArray<T>(nested, extraKeys);
      if (deeper.length > 0) return deeper;
    }
  }

  return [];
}

/** Extract a single object from common wrapper shapes. */
export function ensureObject<T extends Record<string, unknown>>(value: unknown): T | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (record.data && typeof record.data === 'object' && !Array.isArray(record.data)) {
    return record.data as T;
  }
  return record as T;
}
