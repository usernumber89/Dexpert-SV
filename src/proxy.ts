import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password', '/terminos', '/privacidad', '/verify']
const AUTH_ROUTES = ['/sign-in', '/sign-up']

const OLD_ADMIN_ROUTES: Record<string, string> = {
  '/admin/administracion': '/admin/gestion-usuarios',
  '/admin/administracion/usuarios': '/admin/gestion-usuarios',
  '/admin/administracion/roles': '/admin/roles',
  '/admin/administracion/auditoria': '/admin/auditoria',
  '/admin/administracion/alertas': '/admin/alertas',
}

function getCachedRole(request: NextRequest): string | null {
  return request.cookies.get('role')?.value ?? null
}

function setCachedRole(response: NextResponse, role: string): void {
  response.cookies.set('role', role, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 300, // 5 min cache
    path: '/',
  })
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const pathname = request.nextUrl.pathname
  const url = request.nextUrl.clone()

  const redirect = OLD_ADMIN_ROUTES[pathname]
  if (redirect) {
    url.pathname = redirect
    return NextResponse.redirect(url, 308)
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const isHomePage = pathname === '/'

  const isPublicRoute = PUBLIC_ROUTES.some(r => pathname.startsWith(r)) ||
                        pathname.startsWith('/api/wompi/webhook') ||
                        pathname.startsWith('/onboarding')

  const isApiRoute = pathname.startsWith('/api')
  const isServerAction = request.method === 'POST'

  if (isHomePage || isPublicRoute || isApiRoute || isServerAction) {
    if (user && AUTH_ROUTES.some(r => pathname.startsWith(r))) {
      let role = getCachedRole(request)
      if (!role) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        role = profile?.role ?? null
      }
      if (role) {
        setCachedRole(supabaseResponse, role)
        if (role === 'ADMIN') url.pathname = '/admin'
        else url.pathname = role === 'STUDENT' ? '/student/dashboard' : '/pyme/dashboard'
        return NextResponse.redirect(url)
      }
    }
    return supabaseResponse
  }

  if (!user) {
    url.pathname = '/sign-in'
    return NextResponse.redirect(url)
  }

  let role = getCachedRole(request)
  if (!role) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    role = profile?.role ?? null
    if (role) setCachedRole(supabaseResponse, role)
  }

  if (!role) {
    if (pathname.startsWith('/onboarding')) return supabaseResponse
    url.pathname = '/onboarding/select-role'
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    url.pathname = role === 'STUDENT' ? '/student/dashboard' : '/pyme/dashboard'
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/student') && role !== 'STUDENT') {
    url.pathname = role === 'ADMIN' ? '/admin' : '/pyme/dashboard'
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/pyme') && role !== 'PYME') {
    url.pathname = role === 'ADMIN' ? '/admin' : '/student/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
