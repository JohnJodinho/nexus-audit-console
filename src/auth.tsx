/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { login } from './api/client';

type AuthContextValue = {
  token: string | null;
  loginError: string | null;
  isSigningIn: boolean;
  signIn: (username: string, password: string) => Promise<boolean>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const signIn = useCallback(async (username: string, password: string) => {
    setIsSigningIn(true);
    setLoginError(null);
    try {
      const response = await login(username, password);
      setToken(response.access_token);
      return true;
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Sign-in failed. Try again.');
      return false;
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const signOut = useCallback(() => setToken(null), []);
  const value = useMemo(() => ({ token, loginError, isSigningIn, signIn, signOut }), [token, loginError, isSigningIn, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
