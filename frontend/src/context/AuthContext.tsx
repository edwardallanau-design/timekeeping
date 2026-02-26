import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';
import type { AuthContextValue, User, MeResponse } from '../types';

// The context itself can be undefined when consumed outside a provider.
// The useAuth() hook below enforces it is always used inside AuthProvider.
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    const restoreSession = async (): Promise<void> => {
      const savedToken = localStorage.getItem('token');
      const savedUser  = localStorage.getItem('user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        try {
          const response = await api.get<MeResponse>('/auth/me');
          setUser(response.data.user);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = (userData: User, authToken: string): void => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value: AuthContextValue = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!token,
    isDeveloper: user?.role === 'DEVELOPER',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Export the raw context ONLY for App.tsx which calls useContext directly.
// All other consumers should use useAuth() instead.
export { AuthContext };
