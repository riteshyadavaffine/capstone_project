import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchMe } from '../services/api';
import type { AuthState } from '../types';

interface AuthContextValue {
  auth: AuthState | null;
  isBootstrapping: boolean;
  setAuth: (next: AuthState | null) => void;
  signOut: () => void;
}

const STORAGE_KEY = 'supportpilot-auth';
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuthState] = useState<AuthState | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthState) : null;
  });
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      if (!auth) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const result = await fetchMe(auth.token);
        setAuthState({ ...auth, user: result.user });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setAuthState(null);
      } finally {
        setIsBootstrapping(false);
      }
    }

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      auth,
      isBootstrapping,
      setAuth: (next) => {
        setAuthState(next);
        if (next) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      },
      signOut: () => {
        localStorage.removeItem(STORAGE_KEY);
        setAuthState(null);
      },
    }),
    [auth, isBootstrapping],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}

