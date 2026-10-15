import { api } from './client';
import type { ApiSuccess, AuthSession, User } from '../types/api';

export async function login(email: string, password: string): Promise<AuthSession> {
  const response = await api.post<ApiSuccess<AuthSession>>('/auth/login', {
    email,
    password,
    client: 'mobile',
  });
  return response.data.data;
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthSession> {
  const response = await api.post<ApiSuccess<AuthSession>>('/auth/register', {
    name,
    email,
    password,
  });
  return response.data.data;
}

export async function me(): Promise<User> {
  const response = await api.get<ApiSuccess<User>>('/auth/me');
  return response.data.data;
}

/** Idempotent on the server: an unknown or revoked token still returns 204. */
export async function logout(refreshToken: string): Promise<void> {
  await api.post('/auth/logout', { refreshToken });
}
