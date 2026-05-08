'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

const supabase = createClientComponentClient()

const MODE_ICONS: Record<string, string> = {
  sequential: '→',
  selective: '⑂',
  layered: '≡',
  synthesized: '⊕',
}

const STATE_COLORS: Record<string, string> = {
  lab: '#F59E0B',
  wiring: '#7C3AED',
  test: '#06B6D4',
  deployed: '#10B981',
}

type Composition = {
  id: string
  name: string
  mode: string
  state: string
  created_at: string
  updated_at: string
  skill_count?: number
}

export default function ComposerPage() {
  const router = useRouter()
  const [compositions, setCompositions] = useState<Composition[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('compositions')
        .select('*, composition_skills(count)')
        .order('updated_at', { ascending: false })
      setCompositions(
        (data ?? []).map((c: any) => ({
          ...c,
          skill_count: c.composition_skills?.[0]?.count ?? 0,
        }))
      )
      setLoading(false)
    }
    load()
  }, [])

  async function createComposition() {
    setCreating(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data, error } = await supabase
      .from('compositions')
      .insert({ owner_id: user.id, name: 'Untitled composition', mode: 'sequential', state: 'lab' })
      .select('id')
      .single()

    if (!error && data) {
      router.push(`/dashboard/composer/${data.id}`)
    }
    setCreating(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#08080E', fontFamily: "'Inter', sans-serif" }}>
      <Nav />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '40px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.03em', color: '#F8F8FF', marginBottom: '6px' }}>
              Skill Composer
            </h1>
            <p style={{ fontSize: '14px', color: '#8884A0', maxWidth: '480px' }}>
              Chain skills into pipelines. Test before you deploy. Export as a portable SKILL.md.
            </p>
          </div>
          <button
            onClick={createComposition}
            disabled={creating}
            className="btn-primary"
            style={{ fontSize: '14px', padding: '11px 24px', flexShrink: 0 }}
          >
            {creating ? 'Creating...' : '+ New composition'}
          </button>
        </div>

        {/* Mode legend */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '10px', marginBottom: '36px' }}>
          {[
            { mode: 'sequential', label: 'Sequential', desc: 'A → B → C in order' },
            { mode: 'selective', label: 'Selective', desc: 'Router picks one path' },
            { mode: 'layered', label: 'Layered', desc: 'All run in parallel' },
            { mode: 'synthesized', label: 'Synthesized', desc: 'Outputs merged into one' },
          ].map(m => (
            <div key={m.mode} style={{
              background: '#0F0F1A', border: '1px solid #252535',
              borderRadius: '10px', padding: '14px',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <span style={{
                fontSize: '18px', width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#15151F', borderRadius: '8px', flexShrink: 0,
              }}>
                {MODE_ICONS[m.mode]}
              </span>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#F8F8FF' }}>{m.label}</p>
                <p style={{ fontSize: '11px', color: '#555570' }}>{m.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Compositions list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#555570' }}>Loading...</div>
        ) : compositions.length === 0 ? (
          <div style={{
            background: '#0F0F1A', border: '1px dashed #252535',
            borderRadius: '14px', padding: '60px 24px', textAlign: 'center',
          }}>
            <p style={{ fontSize: '32px', marginBottom: '14px' }}>🧩</p>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#F8F8FF', marginBottom: '6px' }}>
              No compositions yet
            </p>
            <p style={{ fontSize: '13px', color: '#8884A0', marginBottom: '24px' }}>
              Chain skills together into something more powerful than any single one.
            </p>
            <button onClick={createComposition} className="btn-primary" style={{ fontSize: '14px', padding: '11px 28px' }}>
              Create your first composition
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {compositions.map(c => (
              <Link key={c.id} href={`/dashboard/composer/${c.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#0F0F1A', border: '1px solid #252535',
                  borderRadius: '12px', padding: '18px 22px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '12px', cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#7C3AED'; (e.currentTarget as HTMLElement).style.background = '#15151F' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#252535'; (e.currentTarget as HTMLElement).style.background = '#0F0F1A' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                    <span style={{
                      fontSize: '18px', width: '40px', height: '40px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: '#15151F', border: '1px solid #252535',
                      borderRadius: '10px', flexShrink: 0,
                    }}>
                      {MODE_ICONS[c.mode] ?? '?'}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#F8F8FF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#555570', marginTop: '2px' }}>
                        {c.mode} · {c.skill_count} skill{c.skill_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
                      textTransform: 'uppercase', padding: '3px 10px', borderRadius: '999px',
                      background: `${STATE_COLORS[c.state]}15`,
                      color: STATE_COLORS[c.state] ?? '#8884A0',
                    }}>
                      {c.state}
                    </span>
                    <span style={{ color: '#555570' }}>›</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
