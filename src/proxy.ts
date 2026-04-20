import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/sign-in', '/sign-up', '/terms', '/privacy']
const AUTH_ROUTES = ['/sign-in', '/sign-up']

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

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
  const pathname = request.nextUrl.pathname
  const url = request.nextUrl.clone()

  // 1. Manejo de la raíz '/' por separado para evitar falsos positivos con startsWith
  const isHomePage = pathname === '/'
  const isPublicRoute = PUBLIC_ROUTES.some(r => pathname.startsWith(r)) || 
                       pathname.startsWith('/api/stripe/webhook') ||
                       pathname.startsWith('/onboarding')

  // 2. Lógica para rutas públicas y Auth
  if (isHomePage || isPublicRoute) {
    if (user && AUTH_ROUTES.some(r => pathname.startsWith(r))) {
      // Opcional: Solo consultar DB si el rol no está en user.app_metadata
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role) {
        url.pathname = profile.role === 'STUDENT' ? '/student/dashboard' : '/pyme/dashboard'
        return NextResponse.redirect(url)
      }
    }
    return supabaseResponse
  }

  // 3. Protección: Sin sesión
  if (!user) {
    url.pathname = '/sign-in'
    // Guardar la URL original para redirigir después del login si quieres (opcional)
    // url.searchParams.set('next', pathname) 
    return NextResponse.redirect(url)
  }

  // 4. Obtener rol (Idealmente saca esto de los metadatos del JWT si puedes)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile?.role) {
    // Evitar bucle: si ya está en onboarding, dejar pasar
    if (pathname.startsWith('/onboarding')) return supabaseResponse
    url.pathname = '/onboarding/select-role'
    return NextResponse.redirect(url)
  }

  // 5. Protección cruzada de roles (RBAC)
  if (pathname.startsWith('/student') && profile.role !== 'STUDENT') {
    url.pathname = '/pyme/dashboard'
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/pyme') && profile.role !== 'PYME') {
    url.pathname = '/student/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}