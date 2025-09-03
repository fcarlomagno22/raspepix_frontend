import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas que não precisam de autenticação
const publicRoutes = [
  '/',
  '/login',
  '/cadastro',
  '/recuperarsenha',
  '/admin/login',
  '/images',
  '/favicon.ico',
  '/manifest.json',
  '/_next',
  '/api/auth/login',
  '/api/admin/login'
]

// Verifica se a rota atual é pública
const isPublicRoute = (path: string) => {
  return publicRoutes.some(route => path === route || path.startsWith(`${route}/`))
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Ignora rotas da API pois elas são tratadas pelo interceptor do axios
  if (path.startsWith('/api/')) {
    return NextResponse.next()
  }

  const isAdminPath = path.startsWith('/admin')
  const isPublicPath = isPublicRoute(path)

  // Se for uma rota administrativa (exceto login)
  if (isAdminPath && !isPublicPath) {
    const adminToken = request.cookies.get('admin_token')?.value
    
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Permite a requisição prosseguir com o token
    return NextResponse.next()
  }

  // Rotas não-admin
  if (!isPublicPath && !isAdminPath) {
    const token = request.cookies.get('access_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Exclui rotas estáticas e da API
    '/((?!api/|_next/static/|_next/image/|favicon.ico).*)'
  ]
} 