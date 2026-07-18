export type UserRole = 'admin' | 'kadiv_tahfizh' | 'musyrif' | 'ustadz' | string;

export interface UserSession {
  username: string;
  role: UserRole;
  nama?: string;
  nama_lengkap?: string;
  access_token?: string;
  token?: string;
  [key: string]: unknown;
}

const SESSION_KEY = 'user_session';

export function getSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserSession;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function setSession(session: UserSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getAuthHeaders(): Record<string, string> {
  const session = getSession();
  
  if (!session) return { 'Content-Type': 'application/json' };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Session-User': session.username || 'admin', // Pastikan ini terkirim
    'x-session-user': session.username || 'admin', // Tambahkan lowercase untuk jaga-jaga
    'X-Session-Nama': session.nama_lengkap || session.username || 'Admin',
  };

  const token = session.access_token || session.token || "dummy-token-jika-perlu";
  headers['Authorization'] = `Bearer ${token}`;

  return headers;
}

export function isAdminRole(role: string | undefined | null): boolean {
  const normalized = (role ?? '').toLowerCase();
  return normalized === 'admin' || normalized === 'kadiv_tahfizh';
}

export function isMusyrifRole(role: string | undefined | null): boolean {
  const normalized = (role ?? '').toLowerCase();
  return normalized === 'musyrif' || normalized === 'ustadz' || normalized === 'ust_ahmad';
}

export function getPostLoginPath(role: string): string | null {
  const normalized = role.toLowerCase();
  if (isAdminRole(normalized)) return '/musyrif';
  if (isMusyrifRole(normalized)) return '/musyrif';
  return null;
}

