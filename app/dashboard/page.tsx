'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Nav from '@/components/Nav'
import ForgeScore from '@/components/ForgeScore'
import { CATEGORY_COLORS, DIFF_COLOR } from '@/lib/constants'

type Profile = {
  id: string
  email: string
  full_name: string | null
  username: string | null
  role: string
}

type Skill = {
  id: string
  name: string
  subject: string
  difficulty: string
  price: number
  is_free: boolean
  status: string
  download_count: number
  rating_avg: number
  rating_count: number
  created_at: string
}

type Purchase = {
  id: string
  amount: number
  created_at: string
  skills: { name: string; subject: string }
}

const STATUS_COLOR: Record<string, string> = {
  approved: '#10B981',
  pending:  '#F59E0B',
  rejected: '#EF4444',
}

const STATUS_BG: Record<string, string> = {
  approved: 'rgba(16,185,129,0.1)',
  pending:  'rgba(245,158,11,0.1)',
  rejected: 'rgba(239,68,68,0.1)',
}

function computeForgeScore(skill: Skill): number {
  const ratingScore = Math.round((skill.rating_avg / 5) * 40)
  const installScore = Math.min(Math.round(skill.download_count / 4), 25)
  const base = skill.rating_count > 0 ? 35 : 20
  return Math.min(99, base + ratingScore + installScore)
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [sellerEarnings, setSellerEarnings] = useState(0)
  const [loading, setLoading] = useState(true)
  const [requestingPayout, setRequestingPayout] = useState(false)
  const [payoutRequested, setPayoutRequested] = useState(false)
  const [showPayoutForm, setShowPayoutForm] = useState(false)
  const [bankDetails, setBankDetails] = useState('')
  const [activeTab, setActiveTab] = useState<'skills' | 'purchases'>('skills')
  const router = useRouter()

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.push('/login')
      return
    }

    const [{ data: profileData }, { data: skillsData }, { data: purchasesData }, { data: salesData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', session.user.id).single(),
      supabase.from('skills').select('*').eq('seller_id', session.user.id).order('created_at', { ascending: false }),
      supabase.from('purchases').select('*, skills(name, subject)').eq('buyer_id', session.user.id).order('created_at', { ascending: false }),
      // Purchases where the user is the seller (via skill ownership)
      supabase.from('purchases').select('amount, skill_id, skills!inner(seller_id)').eq('skills.seller_id', session.user.id),
    ])

    setProfile(profileData)
    setSkills(skillsData || [])
    setPurchases(purchasesData || [])
    const gross = (salesData || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
    setSellerEarnings(gross * 0.85)
    setLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function requestPayout() {
    if (sellerEarnings < 10) {
      toast.error('Minimum payout is £10')
      return
    }
    if (!bankDetails.trim()) {
      toast.error('Please enter your bank details')
      return
    }
    setRequestingPayout(true)
    const { error } = await supabase.from('payout_requests').insert({
      seller_id: profile!.id,
      amount: sellerEarnings,
      bank_details: bankDetails.trim(),
    })
    if (error) {
      toast.error('Failed to submit payout request')
    } else {
      toast.success('Payout request submitted — we\'ll process it within 3 business days')
      setPayoutRequested(true)
      setShowPayoutForm(false)
    }
    setRequestingPayout(false)
  }

  const totalDownloads = skills.reduce((sum, s) => sum + s.download_count, 0)
  const approvedSkills = skills.filter(s => s.status === 'approved')
  const hasEarnings = sellerEarnings > 0

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#08080E' }}>
        <Nav />
        <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[80, 200, 300].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: `${h}px`, borderRadius: '12px' }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#08080E', fontFamily: "'Inter', sans-serif" }}>
      <Nav />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>

        {/* ── PROFILE HEADER ─────────────────────────────────────── */}
        <div style={{
          background: '#15151F', border: '1px solid #252535',
          borderRadius: '14px', padding: '28px 32px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '16px', marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', fontWeight: 800, color: '#F8F8FF', flexShrink: 0,
            }}>
              {(profile?.full_name || profile?.username || '?')[0].toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#F8F8FF', marginBottom: '2px' }}>
                {profile?.full_name || profile?.username || 'Your Account'}
              </h1>
              <p style={{ fontSize: '13px', color: '#555570' }}>
                {profile?.username ? `@${profile.username} · ` : ''}{profile?.email}
              </p>
            </div>
          </div>

          <button
            onClick={signOut}
            style={{
              background: 'none', border: '1px solid #252535', borderRadius: '8px',
              color: '#555570', padding: '8px 16px', fontSize: '13px',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#8884A0'; (e.currentTarget as HTMLElement).style.color = '#8884A0' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#252535'; (e.currentTarget as HTMLElement).style.color = '#555570' }}
          >
            Sign Out
          </button>
        </div>

        {/* ── STATS ROW ───────────────────────────────────────────── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px', marginBottom: '32px',
        }}>
          {[
            { label: 'Skills listed',   value: skills.length },
            { label: 'Approved',        value: approvedSkills.length },
            { label: 'Total downloads', value: totalDownloads.toLocaleString() },
            { label: 'Your earnings',   value: `£${sellerEarnings.toFixed(2)}`, accent: hasEarnings ? '#10B981' : undefined },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#15151F', border: '1px solid #252535',
              borderRadius: '12px', padding: '20px 24px',
            }}>
              <div style={{ fontSize: '26px', fontWeight: 800, color: (stat as any).accent ?? '#F8F8FF', letterSpacing: '-0.02em' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '12px', color: '#555570', marginTop: '4px', fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── PAYOUT BANNER ───────────────────────────────────────── */}
        {sellerEarnings >= 10 && !payoutRequested && (
          <div style={{
            background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '12px', padding: '18px 24px', marginBottom: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#F8F8FF', marginBottom: '3px' }}>
                  £{sellerEarnings.toFixed(2)} available to withdraw
                </p>
                <p style={{ fontSize: '12px', color: '#8884A0' }}>
                  85% of gross sales · paid within 3 business days
                </p>
              </div>
              {!showPayoutForm && (
                <button
                  onClick={() => setShowPayoutForm(true)}
                  style={{
                    background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)',
                    borderRadius: '8px', color: '#10B981', fontSize: '13px', fontWeight: 700,
                    padding: '9px 20px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                  }}
                >
                  Request Payout
                </button>
              )}
            </div>

            {showPayoutForm && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(16,185,129,0.15)' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#8884A0', marginBottom: '6px' }}>
                  Bank details (sort code &amp; account number, or IBAN)
                </label>
                <input
                  type="text"
                  value={bankDetails}
                  onChange={e => setBankDetails(e.target.value)}
                  placeholder="e.g. 20-00-00 / 12345678"
                  style={{
                    width: '100%', background: '#0F0F1A', border: '1px solid #252535',
                    borderRadius: '8px', padding: '10px 14px', color: '#F8F8FF',
                    fontSize: '14px', fontFamily: 'inherit', outline: 'none',
                    marginBottom: '12px', boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#10B981')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#252535')}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={requestPayout}
                    disabled={requestingPayout || !bankDetails.trim()}
                    style={{
                      background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)',
                      borderRadius: '8px', color: '#10B981', fontSize: '13px', fontWeight: 700,
                      padding: '9px 20px', cursor: bankDetails.trim() ? 'pointer' : 'not-allowed',
                      fontFamily: 'inherit', whiteSpace: 'nowrap',
                      opacity: requestingPayout || !bankDetails.trim() ? 0.6 : 1,
                    }}
                  >
                    {requestingPayout ? 'Submitting…' : 'Confirm Payout Request'}
                  </button>
                  <button
                    onClick={() => { setShowPayoutForm(false); setBankDetails('') }}
                    style={{
                      background: 'transparent', border: '1px solid #252535',
                      borderRadius: '8px', color: '#8884A0', fontSize: '13px',
                      padding: '9px 16px', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TABS ────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
          {[
            { id: 'skills' as const,    label: `Your Skills (${skills.length})` },
            { id: 'purchases' as const, label: `Purchased (${purchases.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', border: 'none', transition: 'all 150ms',
                background: activeTab === tab.id ? 'rgba(124,58,237,0.15)' : 'transparent',
                color: activeTab === tab.id ? '#A855F7' : '#555570',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── SKILLS TAB ──────────────────────────────────────────── */}
        {activeTab === 'skills' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: '#555570' }}>
                {skills.length === 0
                  ? 'No skills listed yet. List your first skill — it\'s free.'
                  : `${skills.length} skill${skills.length !== 1 ? 's' : ''} listed`}
              </p>
              <Link href="/dashboard/upload" className="btn-primary" style={{ fontSize: '13px', padding: '8px 18px' }}>
                + List a skill
              </Link>
            </div>

            {skills.length === 0 ? (
              <div style={{
                background: '#15151F', border: '1px dashed #252535',
                borderRadius: '14px', padding: '60px 24px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>🛠</div>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#F8F8FF', marginBottom: '8px' }}>
                  Ready to sell your first skill?
                </p>
                <p style={{ fontSize: '14px', color: '#8884A0', marginBottom: '24px', maxWidth: '360px', margin: '0 auto 24px' }}>
                  List for free. SkillForge takes a small commission only when you make a sale.
                </p>
                <Link href="/dashboard/upload" className="btn-primary">
                  List your first skill →
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {skills.map(skill => {
                  const accent = CATEGORY_COLORS[skill.subject] || '#7C3AED'
                  const score = computeForgeScore(skill)
                  return (
                    <div key={skill.id} style={{
                      background: '#15151F', border: '1px solid #252535',
                      borderLeft: `3px solid ${accent}`,
                      borderRadius: '12px', padding: '20px 24px',
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', flexWrap: 'wrap', gap: '12px',
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#F8F8FF' }}>{skill.name}</h3>
                          <span style={{
                            fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.08em', padding: '2px 8px', borderRadius: '4px',
                            background: STATUS_BG[skill.status] || 'rgba(124,58,237,0.1)',
                            color: STATUS_COLOR[skill.status] || '#A855F7',
                          }}>
                            {skill.status}
                          </span>
                          <ForgeScore score={score} />
                        </div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#555570', flexWrap: 'wrap' }}>
                          <span style={{ color: accent }}>{skill.subject}</span>
                          <span>{skill.is_free ? 'Free' : `£${skill.price}`}</span>
                          <span>{skill.download_count} downloads</span>
                          {skill.rating_count > 0 && <span>★ {skill.rating_avg.toFixed(1)} ({skill.rating_count})</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <Link
                          href={`/skills/${skill.id}`}
                          style={{
                            padding: '7px 14px', borderRadius: '7px', fontSize: '13px',
                            color: '#8884A0', border: '1px solid #252535', textDecoration: 'none',
                            transition: 'all 150ms',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F8F8FF'; (e.currentTarget as HTMLElement).style.borderColor = '#8884A0' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#8884A0'; (e.currentTarget as HTMLElement).style.borderColor = '#252535' }}
                        >
                          View
                        </Link>
                        <Link
                          href={`/dashboard/skills/${skill.id}`}
                          style={{
                            padding: '7px 14px', borderRadius: '7px', fontSize: '13px',
                            color: '#A855F7', border: '1px solid rgba(124,58,237,0.3)', textDecoration: 'none',
                            transition: 'all 150ms',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.1)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── PURCHASES TAB ───────────────────────────────────────── */}
        {activeTab === 'purchases' && (
          <div>
            {purchases.length === 0 ? (
              <div style={{
                background: '#15151F', border: '1px dashed #252535',
                borderRadius: '14px', padding: '60px 24px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>🛒</div>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#F8F8FF', marginBottom: '8px' }}>
                  No skills purchased yet
                </p>
                <p style={{ fontSize: '14px', color: '#8884A0', marginBottom: '24px' }}>
                  Browse the marketplace to find skills for your AI agents.
                </p>
                <Link href="/browse" className="btn-primary">
                  Browse skills →
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {purchases.map(purchase => {
                  const accent = CATEGORY_COLORS[purchase.skills?.subject] || '#7C3AED'
                  return (
                    <div key={purchase.id} style={{
                      background: '#15151F', border: '1px solid #252535',
                      borderLeft: `3px solid ${accent}`,
                      borderRadius: '12px', padding: '18px 24px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#F8F8FF', marginBottom: '4px' }}>
                          {purchase.skills?.name || 'Unknown skill'}
                        </h3>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#555570' }}>
                          {purchase.skills?.subject && <span style={{ color: accent }}>{purchase.skills.subject}</span>}
                          <span>{purchase.amount === 0 ? 'Free' : `£${purchase.amount}`}</span>
                          <span>{new Date(purchase.created_at).toLocaleDateString('en-GB')}</span>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px',
                        background: 'rgba(16,185,129,0.1)', color: '#10B981',
                      }}>
                        Owned
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── COMPOSER TEASER ─────────────────────────────────────── */}
        <div style={{
          marginTop: '40px',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(6,182,212,0.06) 100%)',
          border: '1px solid rgba(124,58,237,0.2)',
          borderRadius: '14px', padding: '28px 32px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)',
              borderRadius: '999px', padding: '3px 10px',
              fontSize: '11px', fontWeight: 700, color: '#06B6D4',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px',
            }}>
              New
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#F8F8FF', marginBottom: '6px' }}>
              Skill Composer
            </h3>
            <p style={{ fontSize: '14px', color: '#8884A0', maxWidth: '480px' }}>
              Chain skills into pipelines. Test before you deploy. Export as a portable SKILL.md.
            </p>
          </div>
          <Link
            href="/dashboard/composer"
            className="btn-primary"
            style={{ fontSize: '14px', padding: '10px 22px', whiteSpace: 'nowrap' }}
          >
            Open Composer →
          </Link>
        </div>

      </div>
    </div>
  )
}
