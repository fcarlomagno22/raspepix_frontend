import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

function isTokenExpired(token: string | undefined): boolean {
  if (!token) return true;
  
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return true;

    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    const exp = payload.exp;
    
    if (!exp) return true;

    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

function clearAllCookies() {
  // Remove usando js-cookie
  Cookies.remove('access_token', { path: '/' });
  Cookies.remove('refresh_token', { path: '/' });
  Cookies.remove('user', { path: '/' });
  Cookies.remove('admin_token', { path: '/' });

  // Remove também usando document.cookie para garantir
  document.cookie = 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie = 'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie = 'user=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie = 'admin_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';

  // Remove do localStorage também
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
}

export function useAuth(isAdmin: boolean = false) {
  const router = useRouter();

  useEffect(() => {
    function checkAuth() {
      if (isAdmin) {
        // Verifica autenticação de admin
        const adminToken = Cookies.get('admin_token');
        if (!adminToken || isTokenExpired(adminToken)) {
          clearAllCookies();
          router.replace('/admin/login');
          return false;
        }
        return true;
      } else {
        // Verifica autenticação de usuário normal
        const token = Cookies.get('access_token');
        if (!token || isTokenExpired(token)) {
          clearAllCookies();
          router.replace('/login');
          return false;
        }
        return true;
      }
    }

    // Verifica imediatamente
    checkAuth();

    // Configura um timer para verificar a cada 5 segundos
    const interval = setInterval(checkAuth, 5000);

    // Adiciona listener para mudanças de foco da janela
    const handleFocus = () => checkAuth();
    window.addEventListener('focus', handleFocus);

    // Adiciona listener para mudanças de cookies
    const handleCookieChange = () => {
      const isAuthenticated = checkAuth();
      if (!isAuthenticated) {
        clearInterval(interval);
      }
    };
    
    // Verifica mudanças nos cookies a cada 1 segundo
    const cookieInterval = setInterval(handleCookieChange, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(cookieInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [router, isAdmin]);

  const logout = () => {
    clearAllCookies();
    router.replace(isAdmin ? '/admin/login' : '/login');
  };

  return { logout };
} 