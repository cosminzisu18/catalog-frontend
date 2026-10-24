'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { SESSION_EXPIRED_EVENT, type AuthUser } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';

// the rate limit window is one minute, so retries wait at most 10s each
const MAX_RETRY_DELAY_MS = 10_000;

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
};

type AuthState = { user: AuthUser | null; ready: boolean };

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, ready: false });

  // on page load the session cookie (if any) gives us the profile;
  // api() refreshes by itself if the access token expired. Only a 401 means
  // there is no session: a rate limit (429) or a server error is retried,
  // otherwise a valid session would be sent to the login page
  useEffect(() => {
    let cancelled = false;
    let retry: ReturnType<typeof setTimeout> | undefined;

    const load = (attempt: number) => {
      api<AuthUser>('/auth/me')
        .then((user) => {
          if (!cancelled) setState({ user, ready: true });
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          if (err instanceof ApiError && err.status === 401) {
            setState({ user: null, ready: true });
            return;
          }
          const delay = Math.min(1000 * 2 ** attempt, MAX_RETRY_DELAY_MS);
          retry = setTimeout(() => load(attempt + 1), delay);
        });
    };
    load(0);

    return () => {
      cancelled = true;
      clearTimeout(retry);
    };
  }, []);

  // session expired or revoked on the server (e.g. password changed on another device)
  useEffect(() => {
    const onExpired = () => setState({ user: null, ready: true });
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback((user: AuthUser) => {
    setState({ user, ready: true });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST', auth: false });
    } catch {
      // log out in the UI even if the server does not answer
    }
    setState({ user: null, ready: true });
  }, []);

  const value = useMemo(
    () => ({ ...state, login, logout }),
    [state, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
