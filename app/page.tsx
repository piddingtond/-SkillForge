'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import SkillTile from '@/components/SkillTile'
import { CATEGORIES } from '@/lib/constants'

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
  download_count: number
  profiles?: { username: string | null; full_name: string | null }
}

function SkeletonTile() {
  return (
    <div className="skeleton" style={{
      height: '172px', borderRadius: '12px', border: '1px solid #252535',
    }} />
  )
}

export default function HomePage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    supabase
      .from('skills')
      .select('*, profiles:seller_id (username, full_name)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setSkills(data || [])
        setLoading(false)
      })
  }, [])

  const filtered =
    activeCategory === 'All' ? skills : skills.filter(s => s.subject === activeCategory)

  const activeCat = CATEGORIES.find(c => c.name === activeCategory) || CATEGORIES[0]

  return (
    <div style={{ minHeight: '100vh', background: '#08080E' }}>
      <Nav />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '88vh',
        display: 'flex', alignItems: 'center',
        background: 'radial-gradient(ellipse 90% 65% at 50% -5%, rgba(124,58,237,0.14) 0%, transparent 65%)',
        padding: '80px 24px',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
          {/* Pill badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)',
            borderRadius: '100px', padding: '6px 16px', marginBottom: '36px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#A855F7', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Cross-Platform · Curated · Composable
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 800,
            lineHeight: 1.08, letterSpacing: '-0.03em',
            color: '#F8F8FF', marginBottom: '24px',
          }}>
            The skill marketplace<br />
            <span style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Claude Code deserves.
            </span>
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: '18px', color: '#8884A0', lineHeight: 1.65,
            maxWidth: '560px', margin: '0 auto 44px',
          }}>
            Buy, build, and compose skills that work across every AI platform.
            Claude, OpenAI, Hermes — pick your agent, forge your stack.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#browse" className="btn-primary" style={{ fontSize: '16px', padding: '14px 32px' }}>
              Browse Skills
            </a>
            <Link href="/signup" className="btn-secondary" style={{ fontSize: '16px', padding: '14px 32px' }}>
              Start Selling — it's free
            </Link>
          </div>

          {/* Stats bar */}
          <div style={{
            display: 'flex', gap: '0', justifyContent: 'center',
            marginTop: '72px', paddingTop: '48px',
            borderTop: '1px solid #252535', flexWrap: 'wrap',
          }}>
            {[
              { label: 'Skills Available', value: loading ? '—' : String(skills.length) },
              { label: 'Platforms Supported', value: '3+' },
              { label: 'Forge-Scored', value: '100%' },
              { label: 'Commission', value: '% only' },
            ].map((stat, i) => (
              <div key={stat.label} style={{
                textAlign: 'center', padding: '0 48px',
                borderRight: i < 3 ? '1px solid #252535' : 'none',
              }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#F8F8FF', letterSpacing: '-0.02em' }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '11px', color: '#555570', fontWeight: 600,
                  letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '6px',
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: '#0F0F1A', borderTop: '1px solid #252535' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7C3AED', marginBottom: '10px' }}>
            EXPLORE
          </p>
          <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#F8F8FF', letterSpacing: '-0.02em', marginBottom: '36px' }}>
            Browse by Category
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '10px',
          }}>
            {CATEGORIES.filter(c => c.name !== 'All').map(cat => {
              const isActive = activeCategory === cat.name
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    setActiveCategory(cat.name)
                    document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  style={{
                    background: isActive ? `${cat.color}18` : '#15151F',
                    border: `1px solid ${isActive ? cat.color : '#252535'}`,
                    borderRadius: '12px', padding: '18px 14px',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 150ms ease',
                    display: 'flex', flexDirection: 'column', gap: '8px',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = cat.color
                      el.style.background = `${cat.color}10`
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = '#252535'
                      el.style.background = '#15151F'
                    }
                  }}
                >
                  <span style={{ fontSize: '18px', lineHeight: 1 }}>{cat.emoji}</span>
                  <span style={{
                    fontSize: '12px', fontWeight: 600,
                    color: isActive ? cat.color : '#C4C4D4',
                    lineHeight: 1.3,
                  }}>
                    {cat.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── TILE BOARD ───────────────────────────────────────────────────── */}
      <section id="browse" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Board header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '36px' }}>
            <div>
              <p style={{
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: activeCategory === 'All' ? '#7C3AED' : activeCat.color,
                marginBottom: '8px',
              }}>
                {activeCategory === 'All' ? 'ALL SKILLS' : activeCategory.toUpperCase()}
              </p>
              <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#F8F8FF', letterSpacing: '-0.02em' }}>
                {loading ? 'Loading...' : `${filtered.length} skill${filtered.length !== 1 ? 's' : ''} on the board`}
              </h2>
            </div>
            {activeCategory !== 'All' && (
              <button
                onClick={() => setActiveCategory('All')}
                style={{
                  background: 'none', border: 'none',
                  color: '#7C3AED', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 500, fontFamily: 'inherit',
                }}
              >
                ← All categories
              </button>
            )}
          </div>

          {/* The Tile Board */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {[...Array(9)].map((_, i) => <SkeletonTile key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '80px 0',
              background: '#0F0F1A', borderRadius: '16px',
              border: '1px solid #252535',
            }}>
              <p style={{ fontSize: '32px', marginBottom: '16px' }}>🔮</p>
              <p style={{ color: '#555570', fontSize: '16px', marginBottom: '16px' }}>
                No skills in this category yet.
              </p>
              <Link
                href="/dashboard/upload"
                style={{
                  color: '#7C3AED', fontSize: '14px', fontWeight: 600,
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
                }}
              >
                Be the first to list one →
              </Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}>
              {filtered.map(skill => (
                <SkillTile key={skill.id} skill={skill} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── SELLER CTA ───────────────────────────────────────────────────── */}
      <section style={{
        padding: '96px 24px',
        background: 'linear-gradient(180deg, #08080E 0%, #0F0F1A 100%)',
        borderTop: '1px solid #252535',
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)',
            borderRadius: '8px', padding: '4px 12px', marginBottom: '24px',
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#06B6D4', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              For Creators
            </span>
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 700,
            color: '#F8F8FF', marginBottom: '16px', letterSpacing: '-0.02em',
          }}>
            Built something worth selling?
          </h2>
          <p style={{ fontSize: '17px', color: '#8884A0', marginBottom: '36px', lineHeight: 1.65 }}>
            List your skills for free. We take a small percentage when you make a sale —
            same model as eBay, built for the AI agent economy.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn-primary" style={{ fontSize: '15px' }}>
              Start Selling — Free
            </Link>
            <Link href="/pricing" className="btn-secondary" style={{ fontSize: '15px' }}>
              See how it works
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid #252535', padding: '36px 24px' }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '16px',
        }}>
          <span style={{
            fontSize: '18px', fontWeight: 800,
            background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            SkillForge
          </span>
          <p style={{ fontSize: '13px', color: '#555570' }}>
            Where AI agents go shopping.
          </p>
          <div style={{ display: 'flex', gap: '24px' }}>
            {[
              { label: 'Browse', href: '/browse' },
              { label: 'Pricing', href: '/pricing' },
              { label: 'Sell', href: '/signup' },
              { label: 'Sign In', href: '/login' },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                style={{ fontSize: '13px', color: '#555570', textDecoration: 'none', transition: 'color 150ms' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#C4C4D4')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#555570')}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
