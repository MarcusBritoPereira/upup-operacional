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
  logout: () => Promise<void>;
  updateUser: (data: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function initAuth() {
      try {
        const response = await api.get<{ user: AuthUser }>('/auth/me');
        setUser(response.user);
        localStorage.setItem('upup_user', JSON.stringify(response.user));
        if (window.location.pathname === '/login') {
          router.push('/dashboard');
        }
      } catch (err) {
        setUser(null);
        localStorage.removeItem('upup_user');
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post<{ user: AuthUser }>(
      '/auth/login',
      { email, password },
    );
    localStorage.setItem('upup_user', JSON.stringify(response.user));
    setUser(response.user);
    router.push('/dashboard');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch (err) {
      console.error('Erro ao realizar logout no servidor:', err);
    }
    localStorage.removeItem('upup_user');
    setUser(null);
    router.push('/login');
  };

  const updateUser = (data: Partial<AuthUser>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('upup_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
