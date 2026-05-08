'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

type SkillRow = {
  id: string
  name: string
  subject: string
  difficulty: string
  price: number
  is_free: boolean
  status: string
  created_at: string
  download_count: number
  profiles: { username: string | null; full_name: string | null; email: string }
}

type Stats = {
  totalSkills: number
  pendingSkills: number
  approvedSkills: number
  totalUsers: number
  totalPurchases: number
}

const STATUS_COLOR: Record<string, string> = {
  pending:  '#F59E0B',
  approved: '#10B981',
  rejected: '#EF4444',
}

const STATUS_BG: Record<string, string> = {
  pending:  'rgba(245,158,11,0.1)',
  approved: 'rgba(16,185,129,0.1)',
  rejected: 'rgba(239,68,68,0.1)',
}

type PayoutRow = {
  id: string
  amount: number
  status: string
  bank_details: string | null
  requested_at: string
  profiles: { email: string; full_name: string | null }
}

export default function AdminPage() {
  const router = useRouter()
  const [skills, setSkills] = useState<SkillRow[]>([])
  const [payouts, setPayouts] = useState<PayoutRow[]>([])
  const [stats, setStats] = useState<Stats>({ totalSkills: 0, pendingSkills: 0, approvedSkills: 0, totalUsers: 0, totalPurchases: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [tab, setTab] = useState<'skills' | 'payouts'>('skills')
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    const [{ data: skillData }, { count: userCount }, { count: purchaseCount }, { data: payoutData }] = await Promise.all([
      supabase
        .from('skills')
        .select('id, name, subject, difficulty, price, is_free, status, created_at, download_count, profiles:seller_id(username, full_name, email)')
        .order('created_at', { ascending: false }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('purchases').select('*', { count: 'exact', head: true }),
      supabase
        .from('payout_requests')
        .select('id, amount, status, bank_details, requested_at, profiles:seller_id(email, full_name)')
        .order('requested_at', { ascending: false }),
    ])

    const all = (skillData ?? []) as unknown as SkillRow[]
    setSkills(all)
    setPayouts((payoutData ?? []) as unknown as PayoutRow[])
    setStats({
      totalSkills: all.length,
      pendingSkills: all.filter(s => s.status === 'pending').length,
      approvedSkills: all.filter(s => s.status === 'approved').length,
      totalUsers: userCount ?? 0,
      totalPurchases: purchaseCount ?? 0,
    })
    setLoading(false)
  }

  async function setPayoutStatus(payoutId: string, status: 'paid' | 'rejected') {
    setProcessing(payoutId)
    const { error } = await supabase
      .from('payout_requests')
      .update({ status, processed_at: new Date().toISOString() })
      .eq('id', payoutId)

    if (error) {
      toast.error('Failed to update payout status')
    } else {
      toast.success(status === 'paid' ? 'Marked as paid' : 'Payout rejected')
      setPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, status } : p))
    }
    setProcessing(null)
  }

  async function setStatus(skillId: string, status: 'approved' | 'rejected') {
    setProcessing(skillId)
    const { error } = await supabase
      .from('skills')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', skillId)

    if (error) {
      toast.error('Failed to update status')
    } else {
      toast.success(status === 'approved' ? 'Skill approved' : 'Skill rejected')
      setSkills(prev => prev.map(s => s.id === skillId ? { ...s, status } : s))
      setStats(prev => ({
        ...prev,
        pendingSkills: prev.pendingSkills - (status === 'approved' || status === 'rejected' ? 1 : 0),
        approvedSkills: status === 'approved' ? prev.approvedSkills + 1 : prev.approvedSkills,
      }))
    }
    setProcessing(null)
  }

  const filtered = filter === 'all' ? skills : skills.filter(s => s.status === filter)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#08080E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: '2px solid #252535', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#08080E', fontFamily: "'Inter', sans-serif" }}>

      {/* Top bar */}
      <div style={{
        background: '#0F0F1A', borderBottom: '1px solid #252535',
        padding: '0 24px', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>
            SkillForge
          </Link>
          <span style={{ fontSize: '10px', fontWeight: 800, background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', padding: '2px 8px', letterSpacing: '0.1em' }}>ADMIN</span>
        </div>
        <Link href="/dashboard" style={{ fontSize: '13px', color: '#555570', textDecoration: 'none' }}>← Dashboard</Link>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 24px' }}>

        <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#F8F8FF', marginBottom: '28px', letterSpacing: '-0.02em' }}>
          Admin Console
        </h1>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px', marginBottom: '36px' }}>
          {[
            { label: 'Total skills', value: stats.totalSkills },
            { label: 'Pending review', value: stats.pendingSkills, accent: '#F59E0B' },
            { label: 'Approved', value: stats.approvedSkills, accent: '#10B981' },
            { label: 'Total users', value: stats.totalUsers },
            { label: 'Total purchases', value: stats.totalPurchases, accent: '#06B6D4' },
          ].map(s => (
            <div key={s.label} style={{ background: '#0F0F1A', border: '1px solid #252535', borderRadius: '12px', padding: '18px 22px' }}>
              <div style={{ fontSize: '26px', fontWeight: 800, color: s.accent ?? '#F8F8FF', letterSpacing: '-0.02em' }}>
                {s.value.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#555570', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Top-level tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
          {([
            { id: 'skills', label: 'Skills' },
            { id: 'payouts', label: `Payouts (${payouts.filter(p => p.status === 'pending').length} pending)` },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '8px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms',
                background: tab === t.id ? 'rgba(124,58,237,0.15)' : 'transparent',
                color: tab === t.id ? '#A855F7' : '#555570',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Skills filter tabs */}
        {tab === 'skills' && <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
          {([
            { id: 'pending', label: `Pending (${stats.pendingSkills})` },
            { id: 'approved', label: `Approved (${stats.approvedSkills})` },
            { id: 'rejected', label: 'Rejected' },
            { id: 'all', label: `All (${stats.totalSkills})` },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              style={{
                padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms',
                background: filter === t.id ? 'rgba(124,58,237,0.15)' : 'transparent',
                color: filter === t.id ? '#A855F7' : '#555570',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>}

        {/* Skills table */}
        {tab === 'skills' && <div style={{ background: '#0F0F1A', border: '1px solid #252535', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #252535' }}>
                {['Skill', 'Seller', 'Category', 'Price', 'Status', 'Submitted', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#555570', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #1A1A28' : 'none' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <Link href={`/skills/${s.id}`} target="_blank" style={{ fontSize: '13px', fontWeight: 600, color: '#F8F8FF', textDecoration: 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#A855F7')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#F8F8FF')}
                    >
                      {s.name}
                    </Link>
                    <div style={{ fontSize: '11px', color: '#555570', marginTop: '2px' }}>{s.difficulty}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: '13px', color: '#C4C4D4' }}>
                      {(s.profiles as any)?.full_name || (s.profiles as any)?.username || '—'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#555570', marginTop: '2px' }}>{(s.profiles as any)?.email}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#8884A0' }}>{s.subject}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#C4C4D4', whiteSpace: 'nowrap' }}>
                    {s.is_free ? 'Free' : `£${s.price.toFixed(2)}`}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '999px',
                      color: STATUS_COLOR[s.status] ?? '#8884A0',
                      background: STATUS_BG[s.status] ?? 'rgba(136,132,160,0.1)',
                      textTransform: 'capitalize',
                    }}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: '#555570', whiteSpace: 'nowrap' }}>
                    {new Date(s.created_at).toLocaleDateString('en-GB')}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {s.status !== 'approved' && (
                      <button
                        onClick={() => setStatus(s.id, 'approved')}
                        disabled={processing === s.id}
                        style={{
                          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                          borderRadius: '6px', color: '#10B981', fontSize: '12px', fontWeight: 700,
                          padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit',
                          marginRight: '6px', opacity: processing === s.id ? 0.5 : 1,
                        }}
                      >
                        Approve
                      </button>
                    )}
                    {s.status !== 'rejected' && (
                      <button
                        onClick={() => setStatus(s.id, 'rejected')}
                        disabled={processing === s.id}
                        style={{
                          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                          borderRadius: '6px', color: '#EF4444', fontSize: '12px', fontWeight: 700,
                          padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit',
                          opacity: processing === s.id ? 0.5 : 1,
                        }}
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#555570', fontSize: '14px' }}>
                    {filter === 'pending' ? 'No skills pending review' : `No ${filter} skills`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>}

        {/* Payouts table */}
        {tab === 'payouts' && (
          <div style={{ background: '#0F0F1A', border: '1px solid #252535', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #252535' }}>
                  {['Seller', 'Amount', 'Bank details', 'Status', 'Requested', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#555570', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payouts.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: i < payouts.length - 1 ? '1px solid #1A1A28' : 'none' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '13px', color: '#F8F8FF', fontWeight: 600 }}>
                        {(p.profiles as any)?.full_name || '—'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#555570', marginTop: '2px' }}>{(p.profiles as any)?.email}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 700, color: '#10B981' }}>
                      £{p.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '14px 16px', maxWidth: '200px' }}>
                      <span style={{ fontSize: '12px', color: '#C4C4D4', fontFamily: 'monospace', wordBreak: 'break-word' }}>
                        {p.bank_details ?? <em style={{ color: '#555570', fontStyle: 'italic', fontFamily: 'inherit' }}>not provided</em>}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '999px',
                        color: p.status === 'paid' ? '#10B981' : p.status === 'rejected' ? '#EF4444' : '#F59E0B',
                        background: p.status === 'paid' ? 'rgba(16,185,129,0.1)' : p.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                        textTransform: 'capitalize',
                      }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: '#555570', whiteSpace: 'nowrap' }}>
                      {new Date(p.requested_at).toLocaleDateString('en-GB')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {p.status === 'pending' && (
                        <>
                          <button
                            onClick={() => setPayoutStatus(p.id, 'paid')}
                            disabled={processing === p.id}
                            style={{
                              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                              borderRadius: '6px', color: '#10B981', fontSize: '12px', fontWeight: 700,
                              padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit', marginRight: '6px',
                              opacity: processing === p.id ? 0.5 : 1,
                            }}
                          >
                            Mark Paid
                          </button>
                          <button
                            onClick={() => setPayoutStatus(p.id, 'rejected')}
                            disabled={processing === p.id}
                            style={{
                              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                              borderRadius: '6px', color: '#EF4444', fontSize: '12px', fontWeight: 700,
                              padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit',
                              opacity: processing === p.id ? 0.5 : 1,
                            }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {payouts.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#555570', fontSize: '14px' }}>
                      No payout requests yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  )
}
