const DEFAULT_LOCAL_API_BASE_URL = 'http://localhost:8000';
const AUTH_SESSION_STORAGE_KEY = 'snapslot.auth.session';

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

function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawSession = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawSession) as { accessToken?: unknown };
    return typeof parsed.accessToken === 'string' ? parsed.accessToken : null;
  } catch {
    return null;
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

      if (Array.isArray(detail)) {
        const messages = detail
          .map((item) => {
            if (typeof item !== 'object' || item === null) {
              return null;
            }

            const message = (item as { msg?: unknown }).msg;
            if (typeof message === 'string' && message.length > 0) {
              return message;
            }

            const location = (item as { loc?: unknown }).loc;
            if (Array.isArray(location) && location.length > 0) {
              return `Validation error at ${location.join('.')}`;
            }

            return null;
          })
          .filter((message): message is string => Boolean(message));

        if (messages.length > 0) {
          return messages.join('; ');
        }
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
  const accessToken = getStoredAccessToken();

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    }

    throw new ApiError(response.status, await parseErrorDetail(response));
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}
