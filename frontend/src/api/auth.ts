import { apiFetch } from './client';

export interface AuthUser {
  id: string;
  email: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  surname: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface RegisterResponse {
  id?: string;
  email?: string;
  access_token?: string;
  token_type?: string;
  user?: AuthUser;
}

export interface StoredAuthSession {
  accessToken: string;
  tokenType: string;
  user: AuthUser;
}

const AUTH_SESSION_STORAGE_KEY = 'snapslot.auth.session';

export function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function register(payload: RegisterPayload): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function saveAuthSession(session: LoginResponse): void {
  if (typeof window === 'undefined') {
    return;
  }

  const storedSession: StoredAuthSession = {
    accessToken: session.access_token,
    tokenType: session.token_type,
    user: session.user,
  };

  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(storedSession));
}

export function loadAuthSession(): StoredAuthSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawSession = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    const parsedSession: unknown = JSON.parse(rawSession);
    if (
      typeof parsedSession === 'object' &&
      parsedSession !== null &&
      typeof (parsedSession as { accessToken?: unknown }).accessToken === 'string' &&
      typeof (parsedSession as { tokenType?: unknown }).tokenType === 'string' &&
      typeof (parsedSession as { user?: unknown }).user === 'object' &&
      (parsedSession as { user?: unknown }).user !== null
    ) {
      const parsedUser = (parsedSession as { user: { id?: unknown; email?: unknown } }).user;

      if (typeof parsedUser.id === 'string' && typeof parsedUser.email === 'string') {
        return {
          accessToken: (parsedSession as { accessToken: string }).accessToken,
          tokenType: (parsedSession as { tokenType: string }).tokenType,
          user: {
            id: parsedUser.id,
            email: parsedUser.email,
          },
        };
      }
    }
  } catch {
    // Ignore parsing errors and clear invalid data.
  }

  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  return null;
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
}
