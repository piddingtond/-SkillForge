'use client'

import Link from 'next/link'
import { CATEGORY_COLORS } from '@/lib/constants'
import ForgeScore from './ForgeScore'

type Skill = {
  id: string
  name: string
  description: string
  subject: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  price: number
  is_free: boolean
  rating_avg: number
  rating_count: number
  download_count?: number
  forge_score?: number
  profiles?: { username: string | null; full_name: string | null }
}

function computeForgeScore(skill: Skill): number {
  const ratingScore = Math.round((skill.rating_avg / 5) * 40)
  const installScore = Math.min(Math.round((skill.download_count || 0) / 4), 25)
  const base = skill.rating_count > 0 ? 35 : 20
  return Math.min(99, base + ratingScore + installScore)
}

export default function SkillTile({ skill }: { skill: Skill }) {
  const accent = CATEGORY_COLORS[skill.subject] || '#7C3AED'
  const seller = skill.profiles?.full_name || skill.profiles?.username || 'Anonymous'
  const score = skill.forge_score ?? computeForgeScore(skill)

  return (
    <Link
      href={`/skills/${skill.id}`}
      style={{
        display: 'block',
        textDecoration: 'none',
        background: '#15151F',
        border: '1px solid #252535',
        borderLeft: `3px solid ${accent}`,
        borderRadius: '12px',
        padding: '20px',
        transition: 'border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = accent
        el.style.borderLeftColor = accent
        el.style.transform = 'translateY(-4px)'
        el.style.boxShadow = `0 12px 40px ${accent}25`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = '#252535'
        el.style.borderLeftColor = accent
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = 'none'
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: accent,
        }}>
          {skill.subject}
        </span>
        <ForgeScore score={score} />
      </div>

      {/* Name */}
      <h3 style={{
        fontSize: '15px', fontWeight: 600, color: '#F8F8FF',
        lineHeight: 1.4, marginBottom: '8px',
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
      } as React.CSSProperties}>
        {skill.name}
      </h3>

      {/* Description */}
      <p style={{
        fontSize: '13px', color: '#8884A0', lineHeight: 1.6, marginBottom: '18px',
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
      } as React.CSSProperties}>
        {skill.description}
      </p>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#555570' }}>by {seller}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {skill.rating_count > 0 && (
            <span style={{ fontSize: '12px', color: '#8884A0' }}>
              ★ {skill.rating_avg.toFixed(1)}
            </span>
          )}
          <span style={{
            fontSize: '15px', fontWeight: 700,
            color: skill.is_free ? '#10B981' : '#F8F8FF',
          }}>
            {skill.is_free ? 'Free' : `£${skill.price}`}
          </span>
        </div>
      </div>
    </Link>
  )
}
