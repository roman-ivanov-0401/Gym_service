import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { authApi } from '../store/authApi';
import { gymApi } from '../store/gymApi';
import { clearAuth, setAuthLoading, setCredentials, setToken } from '../store/authSlice';
import type { User } from '../store/authSlice';

interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  const loading = useAppSelector((s) => s.auth.loading);

  useEffect(() => {
    void (async () => {
      const storedToken = localStorage.getItem('token');
      const storedRefresh = localStorage.getItem('refreshToken');

      if (!storedToken && !storedRefresh) {
        dispatch(setAuthLoading(false));
        return;
      }

      try {
        const meUser = await dispatch(
          authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }),
        ).unwrap();
        dispatch(setCredentials({ user: meUser, token: storedToken ?? localStorage.getItem('token') ?? '' }));
      } catch {
        if (storedRefresh) {
          try {
            const refreshed = await dispatch(
              authApi.endpoints.refresh.initiate({ refreshToken: storedRefresh }),
            ).unwrap();
            const { accessToken, refreshToken } = refreshed.data;
            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            const meUser = await dispatch(
              authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }),
            ).unwrap();
            dispatch(setCredentials({ user: meUser, token: accessToken }));
          } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            dispatch(clearAuth());
          }
        } else {
          localStorage.removeItem('token');
          dispatch(clearAuth());
        }
      } finally {
        dispatch(setAuthLoading(false));
      }
    })();
  }, [dispatch]);

  const login = useCallback(
    async (accessToken: string, refreshToken: string) => {
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      dispatch(setToken(accessToken));
      const meUser = await dispatch(
        authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }),
      ).unwrap();
      dispatch(setCredentials({ user: meUser, token: accessToken }));
    },
    [dispatch],
  );

  const logout = useCallback(async () => {
    const t = localStorage.getItem('token');
    if (t) {
      try {
        await dispatch(authApi.endpoints.logout.initiate(undefined)).unwrap();
      } catch {
        /* сеть / 401 — всё равно выходим локально */
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    dispatch(clearAuth());
    dispatch(gymApi.util.resetApiState());
    dispatch(authApi.util.resetApiState());
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthCtx => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth должен вызываться внутри AuthProvider');
  return ctx;
};
