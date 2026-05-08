import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const upstashConfigured =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN

// No-op rate limiter used when Upstash is not configured (development / pre-Redis deployment)
const noopLimiter = {
  limit: async (_identifier: string) => ({
    success: true, limit: 999, remaining: 999, reset: Date.now() + 60_000, pending: Promise.resolve(),
  }),
} as unknown as Ratelimit

function makeLimiter(window: Parameters<typeof Ratelimit.slidingWindow>[0], duration: Parameters<typeof Ratelimit.slidingWindow>[1], prefix: string): Ratelimit {
  if (!upstashConfigured) return noopLimiter
  const redis = Redis.fromEnv()
  return new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(window, duration), analytics: true, prefix })
}

export const loginRateLimit    = makeLimiter(5,   '15 m', 'ratelimit:login')
export const uploadRateLimit   = makeLimiter(10,  '1 h',  'ratelimit:upload')
export const apiRateLimit      = makeLimiter(100, '1 m',  'ratelimit:api')
export const purchaseRateLimit = makeLimiter(3,   '10 m', 'ratelimit:purchase')

// Helper to get client identifier (IP or user ID)
export function getIdentifier(request: Request): string {
  // Try to get user ID first (if authenticated)
  const userId = request.headers.get('x-user-id')
  if (userId) return `user:${userId}`

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  
  return `ip:${ip}`
}

// Helper to check rate limit and return response headers
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
}> {
  const result = await limiter.limit(identifier)
  
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  }
}
