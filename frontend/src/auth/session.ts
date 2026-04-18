const ACCESS_TOKEN_STORAGE_KEY = 'snapslot:access-token';
const USER_EMAIL_STORAGE_KEY = 'snapslot:user-email';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
}

export function clearAccessToken(): void {
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
  return localStorage.getItem(USER_EMAIL_STORAGE_KEY);
}
