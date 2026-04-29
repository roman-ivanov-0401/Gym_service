import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { reaction } from 'mobx';
import { rootStore } from '../stores/RootStore';
import type { User } from '../stores/AuthStore';

interface AuthCtx {
  user: User | null; token: string | null;
  login: (a: string, r: string) => Promise<void>;
  logout: () => void; loading: boolean;
}

const AuthContext = createContext<AuthCtx | null>(null);

/** Без observer: при Module Federation observer-обёртка вокруг Provider иногда даёт «пустой» контекст в remote. */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const { auth, client, admin } = rootStore;

  useEffect(() => {
    void auth.init();
  }, [auth]);

  useEffect(
    () =>
      reaction(
        () => [auth.user, auth.token, auth.loading] as const,
        () => {
          rerender();
        },
      ),
    [auth],
  );

  return (
    <AuthContext.Provider
      value={{
        user: auth.user,
        token: auth.token,
        loading: auth.loading,
        login: (a, r) => auth.login(a, r),
        logout: () => {
          auth.logout();
          client.reset();
          admin.reset();
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthCtx => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
