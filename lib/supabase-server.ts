// Server-side Supabase client for use in Server Components, Route Handlers,
// and Server Actions. Reads/writes the session via Next.js cookies(), which
// keeps it in sync with the browser client (lib/supabase.ts) and the
// middleware (proxy.ts). All three must use cookie-backed clients or auth
// state silently drifts apart.
//
// Note: this is the *user-scoped* server client (uses anon key + RLS).
// For the bypass-RLS service-role client, use lib/supabase-admin.ts.
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component where cookie writes are blocked.
            // Safe to ignore — the middleware will refresh the session.
          }
        },
      },
    }
  )
}
