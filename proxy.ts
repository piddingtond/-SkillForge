import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Next.js 16 requires a named "proxy" export instead of "middleware"
export async function proxy(request: NextRequest) {
  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    try {
      // Dynamic import to avoid edge runtime issues
      const { apiRateLimit, getIdentifier } = await import('@/lib/ratelimit')
      
      const identifier = getIdentifier(request)
      const { success, limit, remaining, reset } = await apiRateLimit.limit(identifier)

      if (!success) {
        return NextResponse.json(
          { 
            error: 'Too many requests',
            retryAfter: Math.ceil((reset - Date.now()) / 1000),
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString(),
              'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
            }
          }
        )
      }

      // Add rate limit headers to successful responses
      const response = NextResponse.next()
      response.headers.set('X-RateLimit-Limit', limit.toString())
      response.headers.set('X-RateLimit-Remaining', remaining.toString())
      response.headers.set('X-RateLimit-Reset', reset.toString())
      
      return response
    } catch (error) {
      // If rate limiting fails, allow request but log error
      console.error('Rate limiting error:', error)
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
}
