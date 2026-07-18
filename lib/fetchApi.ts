import { getApiUrl } from './api';
import { getAuthHeaders } from './auth';

export async function fetchApi<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: T }> {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string> | undefined),
  };

  const response = await fetch(getApiUrl(path), {
    ...options,
    headers,
    credentials: 'include',
  });

  let data: T;
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    data = (await response.json()) as T;
  } else {
    data = (await response.text()) as T;
  }

  return { ok: response.ok, status: response.status, data };
}
