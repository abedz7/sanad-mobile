import axios, { isAxiosError, type AxiosError, type AxiosRequestConfig } from 'axios';

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '../auth/tokenStore';
import { API_URL } from '../lib/env';
import type { ApiError, ApiErrorDetail, ApiSuccess, AuthSession, ErrorCode } from '../types/api';

/**
 * Axios instance for all API calls. Responsibilities:
 *  - inject the in-memory access token as a Bearer header
 *  - on 401 outside /auth/*: one silent refresh (shared across concurrent 401s),
 *    then retry the original request once
 *  - on refresh failure: wipe tokens and notify listeners ("signed-out")
 *  - normalise every failure to ApiRequestError (the contract's error envelope)
 *
 * Tokens and headers are never logged here or anywhere else.
 */

export class ApiRequestError extends Error implements ApiError {
  readonly code: ErrorCode;
  readonly details?: ApiErrorDetail[];
  readonly requestId: string;
  /** HTTP status; 0 when the server could not be reached. */
  readonly status: number;

  constructor(args: {
    code: ErrorCode;
    message: string;
    details?: ApiErrorDetail[];
    requestId: string;
    status: number;
  }) {
    super(args.message);
    this.name = 'ApiRequestError';
    this.code = args.code;
    this.details = args.details;
    this.requestId = args.requestId;
    this.status = args.status;
  }
}

function toApiRequestError(error: unknown): ApiRequestError {
  if (error instanceof ApiRequestError) return error;
  if (isAxiosError(error)) {
    const body = error.response?.data as { error?: ApiError } | undefined;
    if (error.response && body?.error?.code) {
      return new ApiRequestError({
        code: body.error.code,
        message: body.error.message,
        details: body.error.details,
        requestId: body.error.requestId,
        status: error.response.status,
      });
    }
    // No contract envelope: network failure, timeout, or a non-API proxy response.
    return new ApiRequestError({
      code: 'INTERNAL',
      message: error.response
        ? 'The server returned an unexpected response. Please try again.'
        : 'Could not reach the server. Check your connection and try again.',
      requestId: '',
      status: error.response?.status ?? 0,
    });
  }
  return new ApiRequestError({
    code: 'INTERNAL',
    message: 'Something went wrong. Please try again.',
    requestId: '',
    status: 0,
  });
}

type SignedOutListener = () => void;
const signedOutListeners = new Set<SignedOutListener>();

/** AuthProvider subscribes to route to sign-in when the session dies mid-flight. */
export function onSignedOut(listener: SignedOutListener): () => void {
  signedOutListeners.add(listener);
  return () => signedOutListeners.delete(listener);
}

function emitSignedOut(): void {
  for (const listener of signedOutListeners) listener();
}

// eslint-disable-next-line import/no-named-as-default-member -- axios documents only the default export for create()
export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Single-flight refresh: concurrent 401s all await the same promise.
let refreshPromise: Promise<boolean> | null = null;

/**
 * Exchanges the stored refresh token for a new pair. Uses bare axios (not `api`)
 * so the 401 interceptor cannot recurse. Resolves true on success; on failure
 * wipes tokens, emits signed-out and resolves false.
 */
export function refreshSession(): Promise<boolean> {
  refreshPromise ??= (async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) return false;
      const response = await axios.post<ApiSuccess<AuthSession>>(
        `${API_URL}/api/v1/auth/refresh`,
        { refreshToken },
        { timeout: 15_000 },
      );
      setAccessToken(response.data.data.accessToken);
      await setRefreshToken(response.data.data.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })().then(async (ok) => {
    if (!ok) {
      await clearTokens();
      emitSignedOut();
    }
    return ok;
  });
  return refreshPromise;
}

interface RetriableConfig extends AxiosRequestConfig {
  _retried?: boolean;
}

// Routes where a 401 is a definitive verdict on the credentials in the request
// body (or the refresh token itself) — refreshing the access token cannot help.
// /auth/me is NOT here: it authenticates by access token like any other route.
const NO_REFRESH_ROUTES = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const isTokenFlowRoute = NO_REFRESH_ROUTES.some((route) => config?.url === route);

    if (error.response?.status === 401 && config && !config._retried && !isTokenFlowRoute) {
      config._retried = true;
      const refreshed = await refreshSession();
      if (refreshed) {
        return api.request(config);
      }
    }
    throw toApiRequestError(error);
  },
);
