'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

const supabase = createClientComponentClient()

const STATES = ['lab', 'wiring', 'test', 'deployed'] as const
type State = typeof STATES[number]

const MODES = [
  { id: 'sequential', icon: '→', label: 'Sequential', desc: 'Skills run in order — output of each feeds the next' },
  { id: 'selective', icon: '⑂', label: 'Selective', desc: 'A router skill picks which path to take' },
  { id: 'layered', icon: '≡', label: 'Layered', desc: 'All skills run in parallel on the same input' },
  { id: 'synthesized', icon: '⊕', label: 'Synthesized', desc: 'Parallel run, outputs merged into a single response' },
]

const STATE_COLORS: Record<string, string> = {
  lab: '#F59E0B',
  wiring: '#7C3AED',
  test: '#06B6D4',
  deployed: '#10B981',
}

type Skill = { id: string; name: string; description: string; input_schema: string | null; output_schema: string | null; compatible_runtimes: string[] }
type CompositionSkill = { id: string; skill_id: string; position: number; skill: Skill }
type Composition = { id: string; name: string; mode: string; state: State; owner_id: string }
type TestResult = { id: string; prompt: string; component_scores: any; composed_score: any; passed: boolean; tested_at: string }

export default function ComposerBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [composition, setComposition] = useState<Composition | null>(null)
  const [compSkills, setCompSkills] = useState<CompositionSkill[]>([])
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([])
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [showSkillPicker, setShowSkillPicker] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState('')
  const [skillMd, setSkillMd] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [compRes, skillsRes] = await Promise.all([
        supabase.from('compositions').select('*').eq('id', id).single(),
        supabase.from('skills').select('id, name, description, input_schema, output_schema, compatible_runtimes').order('name'),
      ])

      if (compRes.error || !compRes.data) { router.replace('/dashboard/composer'); return }

      const comp = compRes.data as Composition
      setComposition(comp)
      setName(comp.name)
      setAvailableSkills(skillsRes.data ?? [])

      const { data: csData } = await supabase
        .from('composition_skills')
        .select('*, skill:skills(id, name, description, input_schema, output_schema, compatible_runtimes)')
        .eq('composition_id', id)
        .order('position')
      setCompSkills(csData ?? [])

      if (comp.state === 'test' || comp.state === 'deployed') {
        const { data: tests } = await supabase
          .from('composition_test_results')
          .select('*')
          .eq('composition_id', id)
          .order('tested_at', { ascending: false })
        setTestResults(tests ?? [])
      }

      setLoading(false)
    }
    load()
  }, [id, router])

  async function saveName() {
    if (!name.trim()) return
    setSaving(true)
    await supabase.from('compositions').update({ name: name.trim(), updated_at: new Date().toISOString() }).eq('id', id)
    setComposition(prev => prev ? { ...prev, name: name.trim() } : prev)
    setEditingName(false)
    setSaving(false)
  }

  async function saveMode(mode: string) {
    setSaving(true)
    await supabase.from('compositions').update({ mode, updated_at: new Date().toISOString() }).eq('id', id)
    setComposition(prev => prev ? { ...prev, mode } : prev)
    setSaving(false)
  }

  async function addSkill(skill: Skill) {
    const exists = compSkills.some(cs => cs.skill_id === skill.id)
    if (exists) { setShowSkillPicker(false); return }

    const position = compSkills.length
    const { data } = await supabase
      .from('composition_skills')
      .insert({ composition_id: id, skill_id: skill.id, position })
      .select('*, skill:skills(id, name, description, input_schema, output_schema, compatible_runtimes)')
      .single()

    if (data) setCompSkills(prev => [...prev, data])
    setShowSkillPicker(false)
  }

  async function removeSkill(csId: string) {
    await supabase.from('composition_skills').delete().eq('id', csId)
    setCompSkills(prev => prev.filter(cs => cs.id !== csId))
  }

  async function advanceState() {
    if (!composition) return
    const currentIdx = STATES.indexOf(composition.state)
    if (currentIdx >= STATES.length - 1) return

    // Gate: need at least 2 skills to advance from lab
    if (composition.state === 'lab' && compSkills.length < 2) {
      alert('Add at least 2 skills before advancing to Wiring.')
      return
    }

    const nextState = STATES[currentIdx + 1]
    setSaving(true)
    await supabase.from('compositions').update({ state: nextState, updated_at: new Date().toISOString() }).eq('id', id)
    setComposition(prev => prev ? { ...prev, state: nextState } : prev)
    setSaving(false)
  }

  async function runTests() {
    if (!composition) return
    setTesting(true)

    const TEST_PROMPTS = [
      'Explain what this skill pipeline does and what it is best used for.',
      'Given a complex user query, walk through how each component would handle it.',
      'What are the limitations or failure modes of this composition?',
    ]

    const skillSummary = compSkills.map((cs, i) => `${i + 1}. ${cs.skill.name}: ${cs.skill.description}`).join('\n')
    const modeDesc = MODES.find(m => m.id === composition.mode)?.desc ?? composition.mode

    const results = []
    for (const prompt of TEST_PROMPTS) {
      const res = await fetch('/api/test-composition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, mode: composition.mode, modeDesc, skills: compSkills.map(cs => cs.skill) }),
      })
      const data = await res.json()
      const { data: saved } = await supabase
        .from('composition_test_results')
        .insert({ composition_id: id, prompt, component_scores: data.component_scores ?? {}, composed_score: data.composed_score ?? {}, passed: data.passed ?? false })
        .select()
        .single()
      if (saved) results.push(saved)
    }

    setTestResults(results)
    setTesting(false)

    const allPassed = results.every(r => r.passed)
    if (allPassed) {
      await supabase.from('compositions').update({ state: 'deployed', updated_at: new Date().toISOString() }).eq('id', id)
      setComposition(prev => prev ? { ...prev, state: 'deployed' } : prev)
      generateSkillMd()
    }
  }

  function generateSkillMd() {
    if (!composition) return
    const mode = MODES.find(m => m.id === composition.mode)
    const skillList = compSkills.map((cs, i) => `### ${i + 1}. ${cs.skill.name}\n${cs.skill.description}${cs.skill.input_schema ? `\n**Input:** ${cs.skill.input_schema}` : ''}${cs.skill.output_schema ? `\n**Output:** ${cs.skill.output_schema}` : ''}`).join('\n\n')

    const md = `# ${composition.name}

**Composition type:** ${mode?.label ?? composition.mode} — ${mode?.desc}
**Compatible runtimes:** ${[...new Set(compSkills.flatMap(cs => cs.skill.compatible_runtimes ?? []))].join(', ') || 'All'}
**Skills:** ${compSkills.length}
**Created with:** SkillForge Skill Composer

---

## Overview

This is a ${mode?.label?.toLowerCase()} composition of ${compSkills.length} skills.

${mode?.id === 'sequential' ? `Skills execute in order. The output of each skill becomes the input to the next.` : ''}
${mode?.id === 'selective' ? `A router skill evaluates the input and selects the appropriate path.` : ''}
${mode?.id === 'layered' ? `All skills receive the same input and execute in parallel. Results are returned as a set.` : ''}
${mode?.id === 'synthesized' ? `All skills receive the same input and execute in parallel. Outputs are merged into a unified response.` : ''}

---

## Skills in this composition

${skillList}

---

## Usage

Provide input according to the first skill's input schema. The composition handles routing and aggregation.

---

*Generated by SkillForge Skill Composer*
`
    setSkillMd(md)
  }

  useEffect(() => {
    if (composition?.state === 'deployed') generateSkillMd()
  }, [composition?.state, compSkills])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#08080E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: '2px solid #252535', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!composition) return null

  const currentStateIdx = STATES.indexOf(composition.state)
  const isDeployed = composition.state === 'deployed'

  return (
    <div style={{ minHeight: '100vh', background: '#08080E', fontFamily: "'Inter', sans-serif" }}>
      <Nav />

      <div style={{ maxWidth: '920px', margin: '0 auto', padding: '36px 24px' }}>

        {/* Breadcrumb + name */}
        <div style={{ marginBottom: '28px' }}>
          <Link href="/dashboard/composer" style={{ fontSize: '13px', color: '#555570', textDecoration: 'none' }}>
            ← Skill Composer
          </Link>
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {editingName ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                  autoFocus
                  style={{
                    background: '#15151F', border: '1px solid #7C3AED', borderRadius: '8px',
                    padding: '6px 12px', color: '#F8F8FF', fontSize: '20px', fontWeight: 800,
                    fontFamily: 'inherit', outline: 'none', letterSpacing: '-0.02em',
                  }}
                />
                <button onClick={saveName} style={{ background: '#7C3AED', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px' }}>
                  Save
                </button>
                <button onClick={() => { setEditingName(false); setName(composition.name) }} style={{ background: 'none', border: 'none', color: '#555570', cursor: 'pointer', fontSize: '13px' }}>
                  Cancel
                </button>
              </div>
            ) : (
              <h1
                onClick={() => setEditingName(true)}
                style={{
                  fontSize: '22px', fontWeight: 900, letterSpacing: '-0.02em',
                  color: '#F8F8FF', cursor: 'text',
                  borderBottom: '1px dashed transparent',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderBottomColor = '#252535')}
                onMouseLeave={e => (e.currentTarget.style.borderBottomColor = 'transparent')}
              >
                {composition.name}
              </h1>
            )}
          </div>
        </div>

        {/* State pipeline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '36px', overflowX: 'auto', paddingBottom: '4px' }}>
          {STATES.map((state, i) => {
            const isDone = i < currentStateIdx
            const isCurrent = i === currentStateIdx
            const color = STATE_COLORS[state]
            return (
              <div key={state} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '7px 14px', borderRadius: '999px',
                  background: isCurrent ? `${color}15` : isDone ? '#15151F' : '#0F0F1A',
                  border: `1px solid ${isCurrent ? color : isDone ? '#252535' : '#1C1C28'}`,
                  transition: 'all 0.2s',
                }}>
                  <span style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: isDone ? '#10B981' : isCurrent ? color : '#252535',
                    flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: isCurrent ? color : isDone ? '#8884A0' : '#555570',
                  }}>
                    {state}
                  </span>
                </div>
                {i < STATES.length - 1 && (
                  <div style={{ width: '24px', height: '1px', background: i < currentStateIdx ? '#10B981' : '#252535', flexShrink: 0 }} />
                )}
              </div>
            )
          })}
        </div>

        {/* LAB STAGE */}
        {composition.state === 'lab' && (
          <div>
            {/* Mode selector */}
            <div style={{ marginBottom: '28px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8884A0', marginBottom: '12px' }}>
                Composition type
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                {MODES.map(m => {
                  const isSelected = composition.mode === m.id
                  return (
                    <button
                      key={m.id}
                      onClick={() => saveMode(m.id)}
                      style={{
                        background: isSelected ? 'rgba(124,58,237,0.1)' : '#0F0F1A',
                        border: `1px solid ${isSelected ? '#7C3AED' : '#252535'}`,
                        borderRadius: '10px', padding: '14px',
                        cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ fontSize: '20px', marginBottom: '6px' }}>{m.icon}</div>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#F8F8FF', marginBottom: '3px' }}>{m.label}</p>
                      <p style={{ fontSize: '11px', color: '#8884A0', lineHeight: 1.5 }}>{m.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Skills in composition */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8884A0' }}>
                  Skills ({compSkills.length})
                </p>
                <button
                  onClick={() => setShowSkillPicker(true)}
                  style={{
                    background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
                    borderRadius: '8px', padding: '6px 14px', color: '#A855F7',
                    fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  + Add skill
                </button>
              </div>

              {compSkills.length === 0 ? (
                <div style={{
                  background: '#0F0F1A', border: '1px dashed #252535',
                  borderRadius: '10px', padding: '32px', textAlign: 'center',
                }}>
                  <p style={{ fontSize: '14px', color: '#8884A0' }}>
                    Add at least 2 skills to compose. You can use skills you've listed or purchased.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {compSkills.map((cs, i) => (
                    <div key={cs.id} style={{
                      background: '#0F0F1A', border: '1px solid #252535',
                      borderRadius: '10px', padding: '14px 18px',
                      display: 'flex', alignItems: 'center', gap: '12px',
                    }}>
                      <span style={{
                        width: '24px', height: '24px', borderRadius: '6px',
                        background: '#15151F', border: '1px solid #252535',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: 800, color: '#8884A0', flexShrink: 0,
                      }}>
                        {i + 1}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#F8F8FF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {cs.skill.name}
                        </p>
                        <p style={{ fontSize: '12px', color: '#8884A0', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {cs.skill.description}
                        </p>
                      </div>
                      {i < compSkills.length - 1 && (
                        <span style={{ fontSize: '16px', color: '#555570', flexShrink: 0 }}>→</span>
                      )}
                      <button
                        onClick={() => removeSkill(cs.id)}
                        style={{ background: 'none', border: 'none', color: '#555570', cursor: 'pointer', fontSize: '16px', padding: '4px' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Advance */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={advanceState}
                disabled={saving || compSkills.length < 2}
                className="btn-primary"
                style={{ fontSize: '14px', padding: '11px 28px', opacity: compSkills.length < 2 ? 0.5 : 1 }}
              >
                Continue to Wiring →
              </button>
            </div>
          </div>
        )}

        {/* WIRING STAGE */}
        {composition.state === 'wiring' && (
          <div>
            <div style={{ background: '#0F0F1A', border: '1px solid #252535', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7C3AED', marginBottom: '12px' }}>
                Schema compatibility
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {compSkills.map((cs, i) => {
                  const next = compSkills[i + 1]
                  const hasSchemas = cs.skill.output_schema && next?.skill.input_schema
                  return (
                    <div key={cs.id}>
                      <div style={{ background: '#15151F', border: '1px solid #252535', borderRadius: '10px', padding: '14px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#F8F8FF', marginBottom: '8px' }}>
                          {i + 1}. {cs.skill.name}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#8884A0', marginBottom: '4px' }}>INPUT</p>
                            <p style={{ fontSize: '12px', color: cs.skill.input_schema ? '#C4C4D4' : '#555570', fontFamily: 'monospace', wordBreak: 'break-word' }}>
                              {cs.skill.input_schema ?? 'Not declared'}
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#8884A0', marginBottom: '4px' }}>OUTPUT</p>
                            <p style={{ fontSize: '12px', color: cs.skill.output_schema ? '#C4C4D4' : '#555570', fontFamily: 'monospace', wordBreak: 'break-word' }}>
                              {cs.skill.output_schema ?? 'Not declared'}
                            </p>
                          </div>
                        </div>
                      </div>
                      {next && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px' }}>
                          <div style={{ flex: 1, height: '1px', background: '#252535' }} />
                          <span style={{
                            fontSize: '11px', padding: '2px 8px', borderRadius: '999px',
                            background: hasSchemas ? 'rgba(16,185,129,0.1)' : 'rgba(255,165,0,0.1)',
                            color: hasSchemas ? '#10B981' : '#F59E0B', fontWeight: 700,
                          }}>
                            {hasSchemas ? '✓ schemas declared' : '! schemas missing'}
                          </span>
                          <div style={{ flex: 1, height: '1px', background: '#252535' }} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => { supabase.from('compositions').update({ state: 'lab' }).eq('id', id); setComposition(prev => prev ? { ...prev, state: 'lab' } : prev) }}
                style={{ background: 'none', border: '1px solid #252535', borderRadius: '8px', color: '#8884A0', cursor: 'pointer', fontSize: '13px', padding: '10px 20px', fontFamily: 'inherit' }}
              >
                ← Back to Lab
              </button>
              <button onClick={advanceState} disabled={saving} className="btn-primary" style={{ fontSize: '14px', padding: '11px 28px' }}>
                Continue to Test →
              </button>
            </div>
          </div>
        )}

        {/* TEST STAGE */}
        {composition.state === 'test' && (
          <div>
            <div style={{ background: '#0F0F1A', border: '1px solid #252535', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#06B6D4', marginBottom: '8px' }}>
                Test stage
              </p>
              <p style={{ fontSize: '13px', color: '#8884A0', marginBottom: '16px' }}>
                The composition will be tested against 3 standard prompts. It must score well on at least one dimension without failing another. Tests run in sequence against Claude.
              </p>

              {testResults.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {testResults.map((t, i) => (
                    <div key={t.id} style={{
                      background: '#15151F', border: `1px solid ${t.passed ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      borderRadius: '10px', padding: '14px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px' }}>{t.passed ? '✅' : '❌'}</span>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#F8F8FF' }}>Test {i + 1}</p>
                      </div>
                      <p style={{ fontSize: '12px', color: '#8884A0', fontStyle: 'italic', marginBottom: '8px' }}>"{t.prompt}"</p>
                      {t.composed_score && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {Object.entries(t.composed_score as Record<string, any>).map(([k, v]) => (
                            <span key={k} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', background: '#252535', color: '#8884A0' }}>
                              {k}: {typeof v === 'number' ? Math.round(v) : String(v)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {testResults.every(t => t.passed) && (
                    <p style={{ fontSize: '13px', color: '#10B981', fontWeight: 700, textAlign: 'center', marginTop: '8px' }}>
                      All tests passed — advancing to Deployed
                    </p>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <button
                    onClick={runTests}
                    disabled={testing}
                    className="btn-primary"
                    style={{ fontSize: '14px', padding: '12px 32px' }}
                  >
                    {testing ? 'Running tests...' : 'Run tests'}
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <button
                onClick={() => { supabase.from('compositions').update({ state: 'wiring' }).eq('id', id); setComposition(prev => prev ? { ...prev, state: 'wiring' } : prev) }}
                style={{ background: 'none', border: '1px solid #252535', borderRadius: '8px', color: '#8884A0', cursor: 'pointer', fontSize: '13px', padding: '10px 20px', fontFamily: 'inherit' }}
              >
                ← Back to Wiring
              </button>
            </div>
          </div>
        )}

        {/* DEPLOYED STAGE */}
        {composition.state === 'deployed' && (
          <div>
            <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#10B981', marginBottom: '6px' }}>
                ✓ Deployed
              </p>
              <p style={{ fontSize: '13px', color: '#8884A0' }}>
                This composition passed testing. Your SKILL.md is ready to download and list on SkillForge.
              </p>
            </div>

            {skillMd && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8884A0', marginBottom: '10px' }}>
                  SKILL.md preview
                </p>
                <pre style={{
                  background: '#0F0F1A', border: '1px solid #252535', borderRadius: '10px',
                  padding: '16px', fontSize: '12px', color: '#C4C4D4', lineHeight: 1.7,
                  overflow: 'auto', maxHeight: '400px', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  fontFamily: 'monospace',
                }}>
                  {skillMd}
                </pre>
                <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      const blob = new Blob([skillMd], { type: 'text/markdown' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `${composition.name.replace(/\s+/g, '-').toLowerCase()}-SKILL.md`
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                    className="btn-primary"
                    style={{ fontSize: '13px', padding: '10px 22px' }}
                  >
                    Download SKILL.md
                  </button>
                  <Link href="/dashboard/upload" className="btn-secondary" style={{ fontSize: '13px', padding: '10px 22px' }}>
                    List on SkillForge →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Skill picker modal */}
      {showSkillPicker && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }}
          onClick={() => setShowSkillPicker(false)}
        >
          <div style={{
            background: '#15151F', border: '1px solid #252535', borderRadius: '14px',
            padding: '24px', width: '100%', maxWidth: '520px', maxHeight: '70vh', overflow: 'auto',
          }}
            onClick={e => e.stopPropagation()}
          >
            <p style={{ fontSize: '15px', fontWeight: 800, color: '#F8F8FF', marginBottom: '16px' }}>
              Add a skill
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {availableSkills.map(skill => {
                const already = compSkills.some(cs => cs.skill_id === skill.id)
                return (
                  <button
                    key={skill.id}
                    onClick={() => !already && addSkill(skill)}
                    disabled={already}
                    style={{
                      background: already ? '#0F0F1A' : '#1C1C28', border: `1px solid ${already ? '#1C1C28' : '#252535'}`,
                      borderRadius: '10px', padding: '12px 16px', textAlign: 'left',
                      cursor: already ? 'default' : 'pointer', fontFamily: 'inherit',
                      opacity: already ? 0.5 : 1, transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!already) (e.currentTarget as HTMLElement).style.borderColor = '#7C3AED' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#252535' }}
                  >
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#F8F8FF', marginBottom: '2px' }}>
                      {skill.name} {already && '· already added'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#8884A0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {skill.description}
                    </p>
                  </button>
                )
              })}
              {availableSkills.length === 0 && (
                <p style={{ fontSize: '13px', color: '#8884A0', textAlign: 'center', padding: '24px' }}>
                  No skills yet. <Link href="/dashboard/upload" style={{ color: '#7C3AED' }}>Upload one first →</Link>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
