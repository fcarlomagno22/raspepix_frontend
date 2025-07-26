import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

// Rotas que não precisam de autenticação
const publicRoutes = [
  '/',
  '/login',
  '/cadastro',
  '/recuperarsenha',
  '/admin/login'
]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isAdminPath = path.startsWith('/admin')
  const isPublicPath = publicRoutes.includes(path)
  const response = NextResponse.next()

  // Inicializa o cliente do Supabase
  const supabase = createMiddlewareClient({ req: request, res: response })
  
  // Atualiza a sessão se existir um refresh token
  const { data: { session } } = await supabase.auth.getSession()

  // Se for uma rota administrativa (exceto login)
  if (isAdminPath && !isPublicPath) {
    const token = request.cookies.get('admin_token')?.value || ''
    
    if (!token) {
      const url = new URL('/admin/login', request.url)
      url.searchParams.set('from', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    // Adiciona o token no header para a API
    response.headers.set('Authorization', `Bearer ${token}`)
    return response
  }

  // Se for uma rota de usuário comum (não pública e não administrativa)
  if (!isPublicPath && !isAdminPath) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Se estiver logado e tentar acessar uma rota pública
  if (isPublicPath) {
    const adminToken = request.cookies.get('admin_token')?.value || ''
    
    if (path === '/admin/login' && adminToken) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    
    if (path === '/login' && session) {
      return NextResponse.redirect(new URL('/home', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
} 