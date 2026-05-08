'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Nav from '@/components/Nav'
import ForgeScore from '@/components/ForgeScore'
import { CATEGORY_COLORS, DIFF_COLOR } from '@/lib/constants'

type Skill = {
  id: string
  name: string
  description: string
  long_description: string | null
  subject: string
  difficulty: string
  price: number
  is_free: boolean
  status: string
  download_count: number
  rating_avg: number
  rating_count: number
  input_schema: string | null
  output_schema: string | null
  compatible_runtimes: string[] | null
  created_at: string
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

export default function ManageSkillPage() {
  const params = useParams()
  const router = useRouter()
  const [skill, setSkill] = useState<Skill | null>(null)
  const [grossRevenue, setGrossRevenue] = useState(0)
  const [saleCount, setSaleCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    loadSkill()
  }, [params.id])

  async function loadSkill() {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.push('/login')
      return
    }

    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('id', params.id as string)
      .eq('seller_id', session.user.id)
      .single()

    if (error || !data) {
      toast.error('Skill not found or access denied')
      router.push('/dashboard')
      return
    }

    setSkill(data)

    // Load purchase/earnings data for this skill
    const { data: purchases } = await supabase
      .from('purchases')
      .select('amount')
      .eq('skill_id', params.id as string)

    if (purchases) {
      const gross = purchases.reduce((sum, p) => sum + (p.amount || 0), 0)
      setGrossRevenue(gross)
      setSaleCount(purchases.filter(p => p.amount > 0).length)
    }

    setLoading(false)
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }

    setDeleting(true)
    const { error } = await supabase.from('skills').delete().eq('id', params.id as string)

    if (error) {
      toast.error('Failed to delete skill')
      setDeleting(false)
      setConfirmDelete(false)
    } else {
      toast.success('Skill deleted')
      router.push('/dashboard')
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#08080E' }}>
        <Nav />
        <div style={{ maxWidth: '760px', margin: '40px auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[120, 280, 80].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: `${h}px`, borderRadius: '12px' }} />
          ))}
        </div>
      </div>
    )
  }

  if (!skill) return null

  const accent = CATEGORY_COLORS[skill.subject] || '#7C3AED'
  const score = computeForgeScore(skill)

  return (
    <div style={{ minHeight: '100vh', background: '#08080E', fontFamily: "'Inter', sans-serif" }}>
      <Nav />

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', fontSize: '13px', color: '#555570' }}>
          <Link href="/dashboard" style={{ color: '#8884A0', textDecoration: 'none' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#F8F8FF')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#8884A0')}
          >
            Dashboard
          </Link>
          <span>›</span>
          <span style={{ color: '#F8F8FF' }}>{skill.name}</span>
        </div>

        {/* Main card */}
        <div style={{
          background: '#15151F', border: '1px solid #252535',
          borderLeft: `4px solid ${accent}`,
          borderRadius: '14px', padding: '32px', marginBottom: '16px',
        }}>
          {/* Title row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#F8F8FF', letterSpacing: '-0.02em' }}>{skill.name}</h1>
                <span style={{
                  fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                  padding: '3px 10px', borderRadius: '6px',
                  background: STATUS_BG[skill.status] || 'rgba(124,58,237,0.1)',
                  color: STATUS_COLOR[skill.status] || '#A855F7',
                }}>
                  {skill.status}
                </span>
                <ForgeScore score={score} showLabel />
              </div>
              <p style={{ fontSize: '14px', color: '#8884A0' }}>{skill.description}</p>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Downloads',    value: skill.download_count.toLocaleString() },
              { label: 'Paid sales',   value: saleCount.toString() },
              { label: 'Your earnings', value: `£${(grossRevenue * 0.85).toFixed(2)}`, accent: '#10B981' },
              { label: 'Rating',       value: skill.rating_count > 0 ? `★ ${skill.rating_avg.toFixed(1)} (${skill.rating_count})` : 'No ratings' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: '#0F0F1A', border: '1px solid #252535',
                borderRadius: '10px', padding: '14px 16px',
              }}>
                <div style={{ fontSize: '11px', color: '#555570', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: (stat as any).accent ?? '#F8F8FF' }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Schema if set */}
          {(skill.input_schema || skill.output_schema) && (
            <div style={{ borderTop: '1px solid #252535', paddingTop: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {skill.input_schema && (
                <div>
                  <span style={{ fontSize: '11px', color: '#555570', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
                    Input schema
                  </span>
                  <span className="terminal-block" style={{ display: 'block', fontSize: '13px' }}>
                    {skill.input_schema}
                  </span>
                </div>
              )}
              {skill.output_schema && (
                <div>
                  <span style={{ fontSize: '11px', color: '#555570', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
                    Output schema
                  </span>
                  <span className="terminal-block" style={{ display: 'block', fontSize: '13px' }}>
                    {skill.output_schema}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #252535', paddingTop: '20px', flexWrap: 'wrap' }}>
            <Link
              href={`/skills/${skill.id}`}
              className="btn-secondary"
              style={{ fontSize: '13px', padding: '8px 18px' }}
            >
              View public page
            </Link>

            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                marginLeft: 'auto',
                padding: '8px 18px', borderRadius: '8px', fontSize: '13px',
                fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', border: 'none', transition: 'all 150ms',
                background: confirmDelete ? '#EF4444' : 'rgba(239,68,68,0.1)',
                color: confirmDelete ? '#F8F8FF' : '#EF4444',
                opacity: deleting ? 0.6 : 1,
              }}
            >
              {deleting ? 'Deleting…' : confirmDelete ? 'Confirm delete' : 'Delete skill'}
            </button>
            {confirmDelete && (
              <button
                onClick={() => setConfirmDelete(false)}
                style={{
                  padding: '8px 14px', borderRadius: '8px', fontSize: '13px',
                  cursor: 'pointer', fontFamily: 'inherit',
                  border: '1px solid #252535', background: 'none', color: '#555570',
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Status message */}
        {skill.status === 'pending' && (
          <div style={{
            padding: '16px 20px', borderRadius: '10px',
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
          }}>
            <p style={{ fontSize: '14px', color: '#F59E0B', lineHeight: 1.65 }}>
              <strong>Under review</strong> — your skill is being reviewed by the SkillForge team. Usually within 24 hours.
            </p>
          </div>
        )}

        {skill.status === 'rejected' && (
          <div style={{
            padding: '16px 20px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
          }}>
            <p style={{ fontSize: '14px', color: '#EF4444', lineHeight: 1.65 }}>
              <strong>Not approved.</strong> Check your email for reviewer feedback. You can delete this listing and resubmit once you've made changes.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
