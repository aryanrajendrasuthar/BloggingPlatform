'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { saveAuth, clearAuth, getToken, getStoredUser } from '@/lib/auth';
import { authApi } from '@/lib/api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getStoredUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      // Refresh user data in background
      authApi.me(storedToken).then(setUser).catch(() => {
        clearAuth();
        setToken(null);
        setUser(null);
      });
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    saveAuth(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    clearAuth();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
