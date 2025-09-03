"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Cookies from 'js-cookie'


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    console.log('AdminLayout - Pathname:', pathname);
    
    // Ignora verificação na página de login
    if (pathname === '/admin/login') {
      console.log('AdminLayout - Página de login, ignorando verificação');
      setIsAuthorized(true);
      return;
    }

    const adminToken = Cookies.get('admin_token');
    console.log('AdminLayout - Token:', adminToken ? 'Presente' : 'Ausente');

    if (!adminToken) {
      console.log('AdminLayout - Token ausente, redirecionando para login');
      setIsAuthorized(false);
      window.location.href = '/admin/login';
    } else {
      console.log('AdminLayout - Token presente, permitindo acesso');
      setIsAuthorized(true);
    }
  }, [pathname]);

  // Mostra nada enquanto verifica autorização
  if (isAuthorized === null) {
    return null;
  }

  // Se não está autorizado, não mostra nada
  if (!isAuthorized && pathname !== '/admin/login') {
    return null;
  }

  // Se está autorizado ou é página de login, mostra o conteúdo
  return (
    <div className="min-h-screen bg-[#131B24]">
      {children}
    </div>
  );
} 