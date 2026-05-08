'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import toast from 'react-hot-toast'
import { CATEGORY_COLORS, DIFF_COLOR, DIFF_BG } from '@/lib/constants'
import Nav from '@/components/Nav'
import ForgeScore from '@/components/ForgeScore'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type Skill = {
  id: string
  seller_id: string
  name: string
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
  status: string
  created_at: string
  profiles?: {
    username: string | null
    full_name: string | null
  }
}

type Review = {
  id: string
  rating: number
  comment: string | null
  created_at: string
  profiles: {
    full_name: string | null
    username: string | null
  }
}

function computeForgeScore(skill: Skill): number {
  const ratingScore = Math.round((skill.rating_avg / 5) * 40)
  const installScore = Math.min(Math.round(skill.download_count / 4), 25)
  const base = skill.rating_count > 0 ? 35 : 20
  return Math.min(99, base + ratingScore + installScore)
}

export default function SkillDetailPage() {
  const params = useParams<{ id: string }>()
  const [skill, setSkill] = useState<Skill | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [downloading, setDownloading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadSkill()
    checkAuth()
  }, [params.id])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user || null)

    if (session?.user) {
      const { data } = await supabase
        .from('purchases')
        .select('id')
        .eq('buyer_id', session.user.id)
        .eq('skill_id', params.id)
        .single()
      setHasPurchased(!!data)
    }
  }

  async function loadSkill() {
    const { data: skillData, error } = await supabase
      .from('skills')
      .select(`*, profiles:seller_id (username, full_name)`)
      .eq('id', params.id)
      .single()

    if (error || !skillData) {
      toast.error('Skill not found')
      router.push('/browse')
      return
    }

    setSkill(skillData)

    const { data: reviewsData } = await supabase
      .from('reviews')
      .select(`*, profiles:buyer_id (username, full_name)`)
      .eq('skill_id', params.id)
      .order('created_at', { ascending: false })

    setReviews(reviewsData || [])
    setLoading(false)
  }

  async function handleDownload() {
    setDownloading(true)
    try {
      const res = await fetch(`/api/download?skillId=${skill?.id}`)
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.open(url, '_blank')
    } catch (err: any) {
      toast.error(err.message || 'Download failed')
    } finally {
      setDownloading(false)
    }
  }

  async function handlePurchase() {
    if (!user) {
      toast.error('Please sign in to purchase')
      router.push('/login')
      return
    }

    if (skill?.is_free) {
      const { error } = await supabase.from('purchases').insert({
        buyer_id: user.id,
        skill_id: skill.id,
        amount: 0,
      })
      if (error) {
        toast.error('Failed to claim skill')
      } else {
        toast.success('Skill claimed!')
        setHasPurchased(true)
      }
      return
    }

    setPurchasing(true)
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId: skill?.id }),
      })
      const { sessionId, error: apiError } = await response.json()
      if (apiError) throw new Error(apiError)

      const stripe = await stripePromise
      if (!stripe) throw new Error('Stripe failed to load')

      const { error } = await stripe.redirectToCheckout({ sessionId })
      if (error) throw error
    } catch (err: any) {
      toast.error(err.message || 'Payment failed')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#08080E' }}>
        <Nav />
        <div style={{ maxWidth: '960px', margin: '60px auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }}>
          {[300, 200, 400].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: `${h}px`, borderRadius: '12px' }} />
          ))}
        </div>
      </div>
    )
  }

  if (!skill) return null

  const accent = CATEGORY_COLORS[skill.subject] || '#7C3AED'
  const sellerName = skill.profiles?.full_name || skill.profiles?.username || 'Anonymous'
  const score = computeForgeScore(skill)

  return (
    <div style={{ minHeight: '100vh', background: '#08080E' }}>
      <Nav />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', fontSize: '13px', color: '#555570' }}>
          <Link href="/browse" style={{ color: '#8884A0', textDecoration: 'none' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#F8F8FF')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#8884A0')}
          >
            Browse
          </Link>
          <span>›</span>
          <span style={{ color: accent }}>{skill.subject}</span>
          <span>›</span>
          <span style={{ color: '#F8F8FF' }}>{skill.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px', alignItems: 'flex-start' }}>

          {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
          <div>
            {/* Main card */}
            <div style={{
              background: '#15151F',
              border: '1px solid #252535',
              borderLeft: `4px solid ${accent}`,
              borderRadius: '14px',
              padding: '36px',
              marginBottom: '24px',
            }}>
              {/* Category + difficulty badges */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: accent,
                  background: `${accent}18`, border: `1px solid ${accent}40`,
                  borderRadius: '6px', padding: '4px 10px',
                }}>
                  {skill.subject}
                </span>
                <span style={{
                  fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: DIFF_COLOR[skill.difficulty] || '#F8F8FF',
                  background: DIFF_BG[skill.difficulty] || 'rgba(124,58,237,0.12)',
                  border: `1px solid ${DIFF_COLOR[skill.difficulty] || '#7C3AED'}40`,
                  borderRadius: '6px', padding: '4px 10px',
                }}>
                  {skill.difficulty}
                </span>
                <ForgeScore score={score} showLabel />
              </div>

              <h1 style={{
                fontSize: '26px', fontWeight: 800, color: '#F8F8FF',
                letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: '14px',
              }}>
                {skill.name}
              </h1>

              <p style={{ fontSize: '16px', color: '#8884A0', lineHeight: 1.65, marginBottom: '24px' }}>
                {skill.description}
              </p>

              {/* Stats row */}
              <div style={{
                display: 'flex', gap: '24px', flexWrap: 'wrap',
                paddingTop: '20px', borderTop: '1px solid #252535',
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#555570', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Downloads</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#F8F8FF' }}>{skill.download_count.toLocaleString()}</div>
                </div>
                {skill.rating_count > 0 && (
                  <div>
                    <div style={{ fontSize: '11px', color: '#555570', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Rating</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#F8F8FF' }}>
                      ★ {skill.rating_avg.toFixed(1)}
                      <span style={{ fontSize: '13px', color: '#555570', fontWeight: 400, marginLeft: '4px' }}>
                        ({skill.rating_count})
                      </span>
                    </div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '11px', color: '#555570', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Seller</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#C4C4D4' }}>{sellerName}</div>
                </div>
              </div>
            </div>

            {/* Long description */}
            {skill.long_description && (
              <div style={{
                background: '#15151F', border: '1px solid #252535',
                borderRadius: '14px', padding: '28px', marginBottom: '24px',
              }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#F8F8FF', marginBottom: '16px' }}>
                  About this skill
                </h2>
                <p style={{ fontSize: '15px', color: '#8884A0', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
                  {skill.long_description}
                </p>
              </div>
            )}

            {/* Reviews */}
            <div style={{ background: '#15151F', border: '1px solid #252535', borderRadius: '14px', padding: '28px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#F8F8FF', marginBottom: '20px' }}>
                Reviews
                {reviews.length > 0 && (
                  <span style={{ fontSize: '13px', fontWeight: 400, color: '#555570', marginLeft: '8px' }}>
                    ({reviews.length})
                  </span>
                )}
              </h2>

              {reviews.length === 0 ? (
                <p style={{ fontSize: '14px', color: '#555570' }}>No reviews yet. Be the first to leave one!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {reviews.map(review => (
                    <div key={review.id} style={{
                      padding: '16px', background: '#0F0F1A',
                      border: '1px solid #252535', borderRadius: '10px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#C4C4D4' }}>
                          {review.profiles.full_name || review.profiles.username || 'Anonymous'}
                        </span>
                        <span style={{ fontSize: '12px', color: '#555570' }}>
                          {new Date(review.created_at).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', color: '#F59E0B', marginBottom: review.comment ? '8px' : 0 }}>
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                      {review.comment && (
                        <p style={{ fontSize: '14px', color: '#8884A0', lineHeight: 1.65 }}>{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN — Purchase card ────────────────────────── */}
          <div style={{ position: 'sticky', top: '80px' }}>
            <div style={{
              background: '#15151F',
              border: `1px solid ${accent}40`,
              borderRadius: '14px',
              padding: '28px',
              boxShadow: `0 0 40px ${accent}12`,
            }}>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '32px', fontWeight: 900, color: skill.is_free ? '#10B981' : '#F8F8FF', letterSpacing: '-0.02em' }}>
                  {skill.is_free ? 'Free' : `£${skill.price}`}
                </div>
                {!skill.is_free && (
                  <div style={{ fontSize: '13px', color: '#555570', marginTop: '4px' }}>One-time purchase</div>
                )}
              </div>

              {hasPurchased ? (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '10px', background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px',
                    color: '#10B981', fontSize: '13px', fontWeight: 700, marginBottom: '10px',
                  }}>
                    ✓ You own this skill
                  </div>
                  {skill.file_url && (
                    <button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="btn-primary"
                      style={{ width: '100%', justifyContent: 'center', opacity: downloading ? 0.7 : 1 }}
                    >
                      {downloading ? 'Preparing download…' : '↓ Download SKILL.md'}
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginBottom: '12px', opacity: purchasing ? 0.7 : 1 }}
                >
                  {purchasing ? 'Processing…' : skill.is_free ? 'Claim Free Skill' : `Buy for £${skill.price}`}
                </button>
              )}

              <div style={{ borderTop: '1px solid #252535', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { icon: '📥', label: `${skill.download_count.toLocaleString()} downloads` },
                  { icon: '♾️', label: 'Lifetime access' },
                  { icon: '🌐', label: 'Works across Claude, OpenAI, Hermes' },
                ].map(({ icon, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#8884A0' }}>
                    <span>{icon}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              {!user && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #252535', textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: '#555570' }}>
                    <Link href="/login" style={{ color: '#A855F7', textDecoration: 'none' }}>Sign in</Link>
                    {' '}or{' '}
                    <Link href="/signup" style={{ color: '#A855F7', textDecoration: 'none' }}>create account</Link>
                    {' '}to purchase
                  </p>
                </div>
              )}
            </div>

            {/* Back link */}
            <Link
              href="/browse"
              style={{
                display: 'block', marginTop: '16px', textAlign: 'center',
                fontSize: '13px', color: '#555570', textDecoration: 'none',
                transition: 'color 150ms',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#8884A0')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#555570')}
            >
              ← Back to browse
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
