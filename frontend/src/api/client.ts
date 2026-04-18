import { getAccessToken } from '../auth/session';

const DEFAULT_LOCAL_API_BASE_URL = 'http://localhost:8000';

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

export function getApiBaseUrl(): string {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (configuredUrl) {
    return normalizeBaseUrl(configuredUrl);
  }

  if (typeof window === 'undefined') {
    return DEFAULT_LOCAL_API_BASE_URL;
  }

  const { hostname, protocol } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return DEFAULT_LOCAL_API_BASE_URL;
  }

  return normalizeBaseUrl(`${protocol}//${hostname}:8000`);
}

export class ApiError extends Error {
  readonly status: number;
  readonly detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

async function parseErrorDetail(response: Response): Promise<string> {
  const fallback = `Request failed with status ${response.status}`;

  try {
    const data: unknown = await response.json();
    if (typeof data === 'object' && data !== null && 'detail' in data) {
      const detail = (data as { detail?: unknown }).detail;
      if (typeof detail === 'string' && detail.length > 0) {
        return detail;
      }
    }
  } catch {
    // Ignore parsing errors and use fallback text.
  }

  return fallback;
}

export async function apiFetch<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  const accessToken = getAccessToken();
  const headers = new Headers(init?.headers);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorDetail(response));
  }

  return (await response.json()) as TResponse;
}
