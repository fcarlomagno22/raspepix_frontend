import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, getErrorMessage } from '@/services/api';
import { API_CONFIG } from '@/config/api';
import Cookies from 'js-cookie';

interface User {
  id: string;
  name: string;
  email: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  message: string;
}

export function useAuth(isAdmin: boolean = false, skipAuthCheck: boolean = false) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (skipAuthCheck) return;

    const token = isAdmin ? Cookies.get('admin_token') : Cookies.get('access_token');
    if (!token) {
      router.replace(isAdmin ? '/admin/login' : '/login');
    }
  }, [router, isAdmin, skipAuthCheck]);

  const login = useCallback(async (data: LoginData) => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = isAdmin ? API_CONFIG.ENDPOINTS.AUTH.ADMIN_LOGIN : API_CONFIG.ENDPOINTS.AUTH.LOGIN;
      const response = await api.post<AuthResponse>(endpoint, data);
      
      const { user } = response.data;
      setUser(user);
      router.push(isAdmin ? '/admin/dashboard' : '/home');
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router, isAdmin]);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? API_CONFIG.ENDPOINTS.AUTH.ADMIN_LOGOUT : API_CONFIG.ENDPOINTS.AUTH.LOGOUT;
      await api.post(endpoint);
      setUser(null);
      
      if (isAdmin) {
        Cookies.remove('admin_token');
        router.push('/admin/login');
      } else {
        Cookies.remove('access_token');
        router.push('/login');
      }
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router, isAdmin]);

  return {
    user,
    loading,
    error,
    login,
    logout
  };
} 