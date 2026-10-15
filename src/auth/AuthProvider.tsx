import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import * as authApi from '../api/auth';
import { onSignedOut, refreshSession } from '../api/client';
import type { User } from '../types/api';
import { clearTokens, getRefreshToken, setAccessToken, setRefreshToken } from './tokenStore';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  signIn: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  // Session died mid-flight (refresh failed on a 401): drop everything cached.
  useEffect(() => {
    return onSignedOut(() => {
      setUser(null);
      setStatus('signedOut');
      queryClient.clear();
    });
  }, [queryClient]);

  // Launch: a stored refresh token is exchanged for an access token, then /auth/me.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await getRefreshToken();
        if (!stored) {
          if (!cancelled) setStatus('signedOut');
          return;
        }
        const refreshed = await refreshSession();
        if (!refreshed) {
          // refreshSession already wiped tokens and emitted signed-out.
          if (!cancelled) setStatus('signedOut');
          return;
        }
        const currentUser = await authApi.me();
        if (!cancelled) {
          setUser(currentUser);
          setStatus('signedIn');
        }
      } catch {
        if (!cancelled) setStatus('signedOut');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const adoptSession = useCallback(
    async (session: Awaited<ReturnType<typeof authApi.login>>) => {
      setAccessToken(session.accessToken);
      await setRefreshToken(session.refreshToken);
      setUser(session.user);
      setStatus('signedIn');
    },
    [],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      await adoptSession(await authApi.login(email, password));
    },
    [adoptSession],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await adoptSession(await authApi.register(name, email, password));
    },
    [adoptSession],
  );

  const signOut = useCallback(async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      // Local sign-out proceeds regardless of the server response.
    } finally {
      await clearTokens();
      queryClient.clear();
      setUser(null);
      setStatus('signedOut');
    }
  }, [queryClient]);

  const value = useMemo(
    () => ({ user, status, signIn, register, signOut }),
    [user, status, signIn, register, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
