'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { AuthUser } from '@/lib/types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('upup_user');
    const token = localStorage.getItem('upup_token');
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('upup_user');
        localStorage.removeItem('upup_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post<{ access_token: string; user: AuthUser }>(
      '/auth/login',
      { email, password },
    );
    localStorage.setItem('upup_token', response.access_token);
    localStorage.setItem('upup_user', JSON.stringify(response.user));
    setUser(response.user);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('upup_token');
    localStorage.removeItem('upup_user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
