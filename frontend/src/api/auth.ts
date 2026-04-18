import { apiFetch } from './client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginUser {
  id: string;
  email: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: LoginUser;
}

export function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
