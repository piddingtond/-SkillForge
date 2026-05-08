import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service role client — bypasses RLS. Server-side only (webhook handlers, admin actions).
// Never expose SUPABASE_SERVICE_ROLE_KEY to the client.
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
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
          role: 'buyer' | 'seller' | 'admin'
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
          role?: 'buyer' | 'seller' | 'admin'
          bio?: string | null
          website?: string | null
        }
        Update: {
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          role?: 'buyer' | 'seller' | 'admin'
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
