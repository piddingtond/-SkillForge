// Next.js 16 middleware (named "proxy" per Next.js 16 convention).
// Two jobs: CORS for /api/* and session-checked redirects for /dashboard/* and /admin/*.
//
// Uses @supabase/ssr's createServerClient configured against the request and
// response cookie stores so it sees the same cookie-backed session that the
// browser client (lib/supabase.ts) writes. Without this alignment, signed-in
// users get redirected to /login because the middleware can't see their session.

import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_ORIGINS =
  process.env.NODE_ENV === 'production'
    ? ['https://skill-forge.dev', 'https://www.skill-forge.dev']
    : ['http://localhost:3000']

const PROTECTED_ROUTES = ['/dashboard', '/admin']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })

  // CORS for API routes
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')

    if (origin) {
      if (ALLOWED_ORIGINS.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin)
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.set('Access-Control-Max-Age', '86400')
        response.headers.set('Vary', 'Origin')
      } else if (request.method === 'OPTIONS') {
        return new NextResponse(null, { status: 403 })
      }
    }

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: response.headers })
    }

    return response
  }

  // Auth-protected routes
  if (PROTECTED_ROUTES.some(r => pathname.startsWith(r))) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // getUser() is preferred over getSession() in middleware — it revalidates
    // against Supabase rather than trusting whatever the cookie says.
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (pathname.startsWith('/admin')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    return response
  }

  return response
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*', '/admin/:path*'],
}
