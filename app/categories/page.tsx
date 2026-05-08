'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import { CATEGORIES } from '@/lib/constants'

type CategoryCount = Record<string, number>

export default function CategoriesPage() {
  const [counts, setCounts] = useState<CategoryCount>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCounts() {
      const { data } = await supabase
        .from('skills')
        .select('subject')
        .eq('status', 'approved')

      if (data) {
        const map: CategoryCount = {}
        for (const row of data) {
          map[row.subject] = (map[row.subject] || 0) + 1
        }
        setCounts(map)
      }
      setLoading(false)
    }
    fetchCounts()
  }, [])

  const displayCategories = CATEGORIES.filter(c => c.name !== 'All')

  return (
    <div style={{ minHeight: '100vh', background: '#08080E' }}>
      <Nav />

      {/* Header */}
      <div style={{
        borderBottom: '1px solid #252535',
        background: 'linear-gradient(180deg, #0F0F1A 0%, #08080E 100%)',
        padding: '48px 24px 40px',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#7C3AED', marginBottom: '12px',
        }}>
          Explore by Category
        </p>
        <h1 style={{
          fontSize: '36px', fontWeight: 800, letterSpacing: '-0.03em', color: '#F8F8FF',
          marginBottom: '12px',
        }}>
          Skills for every use case
        </h1>
        <p style={{ fontSize: '16px', color: '#8884A0', maxWidth: '520px', margin: '0 auto' }}>
          Browse curated AI agent skills across {displayCategories.length} categories — from coding to content, security to SEO.
        </p>
      </div>

      {/* Category grid */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '16px',
        }}>
          {displayCategories.map(cat => {
            const count = counts[cat.name] || 0
            return (
              <Link
                key={cat.name}
                href={`/browse?category=${encodeURIComponent(cat.name)}`}
                style={{
                  display: 'block', textDecoration: 'none',
                  background: '#15151F',
                  border: '1px solid #252535',
                  borderLeft: `4px solid ${cat.color}`,
                  borderRadius: '12px',
                  padding: '24px 20px',
                  transition: 'transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = 'translateY(-4px)'
                  el.style.borderColor = cat.color
                  el.style.boxShadow = `0 12px 36px ${cat.color}22`
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = 'translateY(0)'
                  el.style.borderColor = '#252535'
                  el.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px',
                  background: `${cat.color}18`, border: `1px solid ${cat.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', marginBottom: '14px',
                }}>
                  {cat.emoji}
                </div>

                <h3 style={{
                  fontSize: '15px', fontWeight: 700, color: '#F8F8FF',
                  marginBottom: '6px',
                }}>
                  {cat.name}
                </h3>

                <p style={{ fontSize: '13px', color: cat.color, fontWeight: 600 }}>
                  {loading ? '…' : `${count} skill${count !== 1 ? 's' : ''}`}
                </p>
              </Link>
            )
          })}
        </div>

        {/* All skills CTA */}
        <div style={{ textAlign: 'center', marginTop: '52px' }}>
          <p style={{ fontSize: '15px', color: '#8884A0', marginBottom: '20px' }}>
            Not sure where to start?
          </p>
          <Link href="/browse" className="btn-primary" style={{ fontSize: '15px' }}>
            Browse all skills →
          </Link>
        </div>
      </div>
    </div>
  )
}
