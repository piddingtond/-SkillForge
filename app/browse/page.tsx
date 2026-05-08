'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import SkillTile from '@/components/SkillTile'
import { CATEGORIES, DIFFICULTIES, CATEGORY_COLORS } from '@/lib/constants'

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
  created_at: string
  profiles?: { username: string | null; full_name: string | null }
}

const SORT_OPTIONS = [
  { label: 'Popular',  value: 'popular' },
  { label: 'Newest',   value: 'newest' },
  { label: 'Top Rated',value: 'rating' },
  { label: 'Price ↑',  value: 'price_asc' },
  { label: 'Price ↓',  value: 'price_desc' },
  { label: 'Free',     value: 'free' },
]

const SKELETON_COUNT = 12

function BrowsePage() {
  const searchParams = useSearchParams()
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(() => searchParams.get('category') || 'All')
  const [difficulty, setDifficulty] = useState('All')
  const [sort, setSort] = useState('popular')
  const [total, setTotal] = useState(0)

  const fetchSkills = useCallback(async () => {
    setLoading(true)

    let query = supabase
      .from('skills')
      .select(`*, profiles:seller_id (username, full_name)`, { count: 'exact' })
      .eq('status', 'approved')

    if (category !== 'All') query = query.eq('subject', category)
    if (difficulty !== 'All') query = query.eq('difficulty', difficulty)
    if (search.trim()) {
      query = query.or(`name.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`)
    }
    if (sort === 'free') {
      query = query.eq('is_free', true)
    }
    if (sort === 'popular')   query = query.order('download_count', { ascending: false })
    if (sort === 'newest')    query = query.order('created_at', { ascending: false })
    if (sort === 'rating')    query = query.order('rating_avg', { ascending: false })
    if (sort === 'price_asc') query = query.order('price', { ascending: true })
    if (sort === 'price_desc') query = query.order('price', { ascending: false })
    if (sort === 'free')      query = query.order('download_count', { ascending: false })

    query = query.limit(60)

    const { data, count } = await query
    setSkills(data || [])
    setTotal(count || 0)
    setLoading(false)
  }, [category, difficulty, sort, search])

  useEffect(() => {
    const timer = setTimeout(fetchSkills, search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [fetchSkills, search])

  const accentColor = CATEGORY_COLORS[category] || '#7C3AED'

  return (
    <div style={{ minHeight: '100vh', background: '#08080E' }}>
      <Nav />

      {/* Page header */}
      <div style={{
        borderBottom: '1px solid #252535',
        background: 'linear-gradient(180deg, #0F0F1A 0%, #08080E 100%)',
        padding: '40px 24px 32px',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em', color: '#F8F8FF', marginBottom: '8px' }}>
            Browse Skills
          </h1>
          <p style={{ fontSize: '15px', color: '#8884A0' }}>
            {loading ? '…' : `${total.toLocaleString()} skills available`}
          </p>

          {/* Search bar */}
          <div style={{ position: 'relative', marginTop: '20px', maxWidth: '560px' }}>
            <span style={{
              position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
              fontSize: '16px', pointerEvents: 'none',
            }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or description…"
              style={{
                width: '100%', background: '#15151F', border: '1px solid #252535',
                borderRadius: '10px', padding: '12px 16px 12px 44px',
                color: '#F8F8FF', fontSize: '15px', fontFamily: 'inherit', outline: 'none',
                transition: 'border-color 150ms',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#7C3AED')}
              onBlur={e => (e.currentTarget.style.borderColor = '#252535')}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px', display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

        {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
        <aside style={{
          width: '220px', flexShrink: 0,
          position: 'sticky', top: '80px',
        }}>
          {/* Categories */}
          <div style={{ marginBottom: '32px' }}>
            <p style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#555570', marginBottom: '12px',
            }}>
              Category
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {CATEGORIES.map(cat => {
                const active = category === cat.name
                return (
                  <button
                    key={cat.name}
                    onClick={() => setCategory(cat.name)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '8px 12px', borderRadius: '8px',
                      background: active ? `${cat.color}18` : 'transparent',
                      border: `1px solid ${active ? cat.color + '60' : 'transparent'}`,
                      color: active ? cat.color : '#8884A0',
                      fontSize: '13px', fontWeight: active ? 600 : 400,
                      cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'all 150ms',
                      textAlign: 'left',
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#F8F8FF' }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#8884A0' }}
                  >
                    <span style={{ fontSize: '14px', lineHeight: 1 }}>{cat.emoji}</span>
                    {cat.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Difficulty */}
          <div style={{ marginBottom: '32px' }}>
            <p style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#555570', marginBottom: '12px',
            }}>
              Difficulty
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {DIFFICULTIES.map(d => {
                const active = difficulty === d
                const diffColor = d === 'Beginner' ? '#10B981' : d === 'Intermediate' ? '#F59E0B' : d === 'Advanced' ? '#EF4444' : '#7C3AED'
                return (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    style={{
                      padding: '8px 12px', borderRadius: '8px',
                      background: active ? `${diffColor}18` : 'transparent',
                      border: `1px solid ${active ? diffColor + '60' : 'transparent'}`,
                      color: active ? diffColor : '#8884A0',
                      fontSize: '13px', fontWeight: active ? 600 : 400,
                      cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'all 150ms', textAlign: 'left',
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#F8F8FF' }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#8884A0' }}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Sort */}
          <div>
            <p style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#555570', marginBottom: '12px',
            }}>
              Sort By
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {SORT_OPTIONS.map(opt => {
                const active = sort === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSort(opt.value)}
                    style={{
                      padding: '8px 12px', borderRadius: '8px',
                      background: active ? 'rgba(124,58,237,0.12)' : 'transparent',
                      border: `1px solid ${active ? '#7C3AED60' : 'transparent'}`,
                      color: active ? '#A855F7' : '#8884A0',
                      fontSize: '13px', fontWeight: active ? 600 : 400,
                      cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'all 150ms', textAlign: 'left',
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#F8F8FF' }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#8884A0' }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        {/* ── TILE BOARD ──────────────────────────────────────────────── */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* Active filter pills */}
          {(category !== 'All' || difficulty !== 'All' || search) && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {category !== 'All' && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: `${accentColor}18`, border: `1px solid ${accentColor}50`,
                  color: accentColor, borderRadius: '999px',
                  fontSize: '12px', fontWeight: 600, padding: '4px 12px',
                }}>
                  {category}
                  <button
                    onClick={() => setCategory('All')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '14px', lineHeight: 1, padding: 0 }}
                  >
                    ×
                  </button>
                </span>
              )}
              {difficulty !== 'All' && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)',
                  color: '#A855F7', borderRadius: '999px',
                  fontSize: '12px', fontWeight: 600, padding: '4px 12px',
                }}>
                  {difficulty}
                  <button
                    onClick={() => setDifficulty('All')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '14px', lineHeight: 1, padding: 0 }}
                  >
                    ×
                  </button>
                </span>
              )}
              {search && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)',
                  color: '#06B6D4', borderRadius: '999px',
                  fontSize: '12px', fontWeight: 600, padding: '4px 12px',
                }}>
                  "{search}"
                  <button
                    onClick={() => setSearch('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '14px', lineHeight: 1, padding: 0 }}
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Skill grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <div key={i} className="skeleton" style={{
                  height: '180px', borderRadius: '12px',
                }} />
              ))}
            </div>
          ) : skills.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <p style={{ fontSize: '18px', fontWeight: 600, color: '#F8F8FF', marginBottom: '8px' }}>No skills found</p>
              <p style={{ fontSize: '14px', color: '#8884A0' }}>
                Try a different category, difficulty, or search term.
              </p>
              <button
                onClick={() => { setCategory('All'); setDifficulty('All'); setSearch(''); setSort('popular') }}
                style={{
                  marginTop: '20px', background: 'rgba(124,58,237,0.12)',
                  border: '1px solid rgba(124,58,237,0.3)', borderRadius: '8px',
                  color: '#A855F7', padding: '10px 20px', fontSize: '14px',
                  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {skills.map(skill => (
                <SkillTile key={skill.id} skill={skill} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function BrowsePageWrapper() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#08080E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: '2px solid #252535', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <BrowsePage />
    </Suspense>
  )
}
