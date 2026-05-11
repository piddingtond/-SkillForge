// Browser-side Supabase client. Uses @supabase/ssr's createBrowserClient so the
// session is stored in cookies (not just localStorage), which lets the
// middleware in proxy.ts read it via createServerClient. This is the modern,
// supported pattern for Supabase Auth + Next.js App Router. The previous
// bare createClient() approach put the session in localStorage only, and the
// middleware couldn't see it — so signed-in users were bounced back to /login.
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)


export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          username: string | null
          avatar_url: string | null
          role: 'seller' | 'admin'
          bio: string | null
          website: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          role?: 'seller' | 'admin'
          bio?: string | null
          website?: string | null
        }
        Update: {
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          role?: 'seller' | 'admin'
          bio?: string | null
          website?: string | null
        }
      }
      skills: {
        Row: {
          id: string
          seller_id: string
          name: string
          slug: string
          description: string
          long_description: string | null
          subject: string
          difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
          price: number
          is_free: boolean
          file_url: string | null
          download_count: number
          rating_avg: number
          rating_count: number
          status: 'pending' | 'approved' | 'rejected'
          featured: boolean
          created_at: string
          updated_at: string
        }
      }
      purchases: {
        Row: {
          id: string
          buyer_id: string
          skill_id: string
          amount: number
          stripe_payment_id: string | null
          created_at: string
        }
      }
      reviews: {
        Row: {
          id: string
          skill_id: string
          buyer_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
      }
      seller_subscriptions: {
        Row: {
          id: string
          seller_id: string
          tier_id: string
          stripe_subscription_id: string | null
          status: 'active' | 'canceled' | 'past_due'
          current_period_start: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
      }
      subscription_tiers: {
        Row: {
          id: string
          name: string
          price_monthly: number
          max_skills: number | null
          features: any
          created_at: string
        }
      }
    }
  }
}
