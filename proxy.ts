import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_ORIGINS =
  process.env.NODE_ENV === 'production'
    ? ['https://skill-forge.dev', 'https://www.skill-forge.dev']
    : ['http://localhost:3000']

const PROTECTED_ROUTES = ['/dashboard', '/admin']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

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

  if (PROTECTED_ROUTES.some(r => pathname.startsWith(r))) {
    const supabase = createMiddlewareClient({ req: request, res: response })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (pathname.startsWith('/admin')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
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
