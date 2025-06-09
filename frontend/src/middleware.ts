import { NextRequest, NextResponse } from 'next/server';

// Define roles enum
export enum ROLES {
  ADMIN = 'admin',
  USER = 'user'
}

/**
 * Next.js middleware for route protection and redirects
 * 
 * Note: This middleware is minimal since we're using client-side auth checks.
 * Most authentication is now handled in the React components using localStorage.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/', 
    '/auth/login', 
    '/auth/signup', 
    '/auth/reset-password',
    '/auth/verify-email',
    '/worksheets',
    '/pricing', 
    '/about', 
    '/contact'
  ];
  
  // Check if the request is for a static asset (images, etc.)
  const isStaticAsset = pathname.startsWith('/images/') || 
                       pathname.startsWith('/assets/') || 
                       pathname.startsWith('/_next/') || 
                       pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|json)$/);
  
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  ) || isStaticAsset;

  // API routes are handled separately
  if (pathname.startsWith('/api/')) {
    // Allow all API routes - authentication is handled by the backend
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Common redirects for better UX
  if (pathname === '/profile') {
    return NextResponse.redirect(new URL('/dashboard/profile', request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /_next (Next.js internals)
     * 2. /static (static files)
     * 3. /favicon.ico, /robots.txt (common files)
     */
    '/((?!_next|static|favicon.ico|robots.txt).*)',
  ],
};
