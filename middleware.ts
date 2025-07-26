import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas que não precisam de autenticação
const publicRoutes = [
  '/login',
  '/cadastro',
  '/recuperarsenha',
  '/admin/login'
]

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isAdminPath = path.startsWith('/admin')
  const isPublicPath = publicRoutes.includes(path)

  // Se for uma rota administrativa (exceto login)
  if (isAdminPath && !isPublicPath) {
    const token = request.cookies.get('admin_token')?.value || ''
    
    if (!token) {
      const url = new URL('/admin/login', request.url)
      url.searchParams.set('from', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    // Adiciona o token no header para a API
    const response = NextResponse.next()
    response.headers.set('Authorization', `Bearer ${token}`)
    return response
  }

  // Se for uma rota de usuário comum (não pública e não administrativa)
  if (!isPublicPath && !isAdminPath) {
    const token = request.cookies.get('access_token')?.value || ''
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Se estiver logado e tentar acessar uma rota pública
  if (isPublicPath) {
    const adminToken = request.cookies.get('admin_token')?.value || ''
    const userToken = request.cookies.get('access_token')?.value || ''
    
    if (path === '/admin/login' && adminToken) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    
    if (path === '/login' && userToken) {
      return NextResponse.redirect(new URL('/home', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
} 