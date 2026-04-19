const ACCESS_TOKEN_STORAGE_KEY = 'snapslot:access-token';
const USER_EMAIL_STORAGE_KEY = 'snapslot:user-email';
const AUTH_SESSION_STORAGE_KEY = 'snapslot.auth.session';

interface StoredAuthSession {
  accessToken: string;
  tokenType: string;
  user: {
    id: string;
    email: string;
  };
}

function loadStoredAuthSession(): StoredAuthSession | null {
  const rawSession = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(rawSession) as Partial<StoredAuthSession>;

    if (
      typeof parsedSession.accessToken === 'string' &&
      typeof parsedSession.tokenType === 'string' &&
      typeof parsedSession.user?.id === 'string' &&
      typeof parsedSession.user?.email === 'string'
    ) {
      return parsedSession as StoredAuthSession;
    }
  } catch {
    // Ignore malformed session payloads and fall back to legacy keys.
  }

  return null;
}

export function getAccessToken(): string | null {
  return loadStoredAuthSession()?.accessToken ?? localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_EMAIL_STORAGE_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

export function setAuthenticatedUserEmail(email: string): void {
  localStorage.setItem(USER_EMAIL_STORAGE_KEY, email);
}

export function getAuthenticatedUserEmail(): string | null {
  return loadStoredAuthSession()?.user.email ?? localStorage.getItem(USER_EMAIL_STORAGE_KEY);
}
