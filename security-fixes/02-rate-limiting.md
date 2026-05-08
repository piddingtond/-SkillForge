# Critical Issue #2: Rate Limiting

## Problem
No rate limiting = attackers can:
- Brute-force login (unlimited attempts)
- Spam skill uploads
- DDoS API routes
- Fake purchase attempts

## Solution
Install `@upstash/ratelimit` with Redis backend.

### Why Upstash?
- Free tier: 10,000 requests/day
- Serverless (no server to manage)
- Works perfectly with Vercel
- Sliding window algorithm (better than fixed window)

## Implementation

### Step 1: Install Dependencies

```bash
cd G:\workspace\skill-finder
npm install @upstash/ratelimit @upstash/redis
```

### Step 2: Create Rate Limit Utility

```typescript
// lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Define rate limiters for different operations
export const loginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 attempts per 15 minutes
  analytics: true,
})

export const uploadRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 uploads per hour
  analytics: true,
})

export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  analytics: true,
})

export const purchaseRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '10 m'), // 3 purchases per 10 minutes
  analytics: true,
})

// Helper to get client identifier (IP or user ID)
export function getIdentifier(request: Request): string {
  // Try to get user ID first (if authenticated)
  const userId = request.headers.get('x-user-id')
  if (userId) return `user:${userId}`

  // Fall back to IP address
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  return `ip:${ip.split(',')[0]}`
}
```

### Step 3: Apply to Login Route

```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { loginRateLimit, getIdentifier } from '@/lib/ratelimit'

export async function POST(request: NextRequest) {
  // Rate limit check
  const identifier = getIdentifier(request)
  const { success, limit, remaining, reset } = await loginRateLimit.limit(identifier)

  if (!success) {
    return NextResponse.json(
      { 
        error: 'Too many login attempts',
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        }
      }
    )
  }

  // Continue with login logic...
}
```

### Step 4: Apply to Skill Upload

```typescript
// app/dashboard/upload/route.ts (or wherever upload happens)
import { uploadRateLimit, getIdentifier } from '@/lib/ratelimit'

export async function POST(request: NextRequest) {
  const identifier = getIdentifier(request)
  const { success } = await uploadRateLimit.limit(identifier)

  if (!success) {
    return NextResponse.json(
      { error: 'Upload rate limit exceeded. Max 10 uploads per hour.' },
      { status: 429 }
    )
  }

  // Continue with upload...
}
```

### Step 5: Apply to General API Routes

```typescript
// middleware.ts (applies to all API routes)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { apiRateLimit, getIdentifier } from '@/lib/ratelimit'

export async function middleware(request: NextRequest) {
  // Only apply to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const identifier = getIdentifier(request)
    const { success } = await apiRateLimit.limit(identifier)

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
```

### Step 6: Environment Variables

Add to `.env.local`:
```
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

Get these from [upstash.com](https://upstash.com) (free tier).

## Rate Limits Summary

| Operation | Limit | Window | Identifier |
|-----------|-------|--------|------------|
| Login | 5 attempts | 15 minutes | IP or User ID |
| Skill Upload | 10 uploads | 1 hour | User ID |
| Purchase | 3 purchases | 10 minutes | User ID |
| API General | 100 requests | 1 minute | IP |

## Testing

```bash
# Test login rate limit
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done

# 6th request should return 429 Too Many Requests
```

## Status: 🔄 IN PROGRESS
- [x] Design rate limit strategy
- [x] Document implementation
- [ ] Install packages
- [ ] Create utility file
- [ ] Apply to routes
- [ ] Test limits
- [ ] Set up Upstash account
