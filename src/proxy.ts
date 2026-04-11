import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// 1. Definición de rutas públicas y de autenticación
const isPublicRoute = createRouteMatcher([
  '/', 
  '/auth/sign-in(.*)',   // Nueva ruta con /auth
  '/auth/sign-up(.*)',   // Nueva ruta con /auth
  '/onboarding(.*)', 
  '/api/auth(.*)', 
  '/api/webhooks(.*)', 
  '/api/stripe/webhook(.*)',
  '/api/uploadthing(.*)', 
  '/terms(.*)', 
  '/privacy(.*)',
]);

const isStudentRoute = createRouteMatcher(['/student(.*)']);
const isPymeRoute = createRouteMatcher(['/pyme(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const url = req.nextUrl.clone();
  
  // Extraer el rol desde los Session Claims (Metadata)
  // Asegúrate de haber configurado esto en el Dashboard de Clerk
  const role = sessionClaims?.metadata?.role as string | undefined;

  // A. Lógica para Rutas Públicas
  if (isPublicRoute(req)) {
    // Si el usuario ya está logueado y trata de entrar a login/register, 
    // lo mandamos directo a su dashboard correspondiente.
    if (userId && (url.pathname.startsWith('/auth/sign-in') || url.pathname.startsWith('/auth/sign-up'))) {
      if (role === 'STUDENT') {
        url.pathname = '/student/dashboard';
        return NextResponse.redirect(url);
      }
      if (role === 'PYME') {
        url.pathname = '/pyme/dashboard';
        return NextResponse.redirect(url);
      }
    }
    return NextResponse.next();
  }

  // B. Protección: Si no hay usuario en ruta privada, mandarlo al login con /auth
  if (!userId) {
    url.pathname = '/auth/sign-in';
    return NextResponse.redirect(url);
  }

  // C. Lógica de Onboarding (Si el usuario existe pero no tiene rol asignado)
  if (!role && !url.pathname.startsWith('/onboarding')) {
    url.pathname = '/onboarding/select-role';
    return NextResponse.redirect(url);
  }

  // D. Protección de Rutas por Rol (Evitar que un estudiante entre a pyme y viceversa)
  if (isStudentRoute(req) && role !== 'STUDENT') {
    url.pathname = '/pyme/dashboard';
    return NextResponse.redirect(url);
  }

  if (isPymeRoute(req) && role !== 'PYME') {
    url.pathname = '/student/dashboard';
    return NextResponse.redirect(url);
  }

  // E. Continuar con la petición y añadir el pathname a los headers (útil para layouts)
  const res = NextResponse.next();
  res.headers.set('x-pathname', req.nextUrl.pathname);
  return res;
});

export const config = {
  matcher: [
    // Ignorar archivos estáticos (imágenes, fuentes, etc.) y rutas internas de Next.js
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Siempre ejecutar para rutas de API y TRPC
    '/(api|trpc)(.*)',
  ],
};