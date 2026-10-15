import axios from 'axios';

import { api } from './client';
import { API_URL } from '../lib/env';
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

/** Contract 1.3.0: only the display name is editable; email is the login identity. */
export async function updateMe(name: string): Promise<User> {
  const response = await api.patch<ApiSuccess<User>>('/auth/me', { name });
  return response.data.data;
}

/**
 * Idempotent on the server: an unknown or revoked token still returns 204.
 * Authenticated by the refresh token in the body (contract 1.1.0), so this is
 * a bare request — no Authorization header, and it must work with an expired
 * access token.
 */
export async function logout(refreshToken: string): Promise<void> {
  await axios.post(`${API_URL}/api/v1/auth/logout`, { refreshToken }, { timeout: 15_000 });
}
