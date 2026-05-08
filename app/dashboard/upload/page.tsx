'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Nav from '@/components/Nav'
import { CATEGORIES, DIFFICULTIES } from '@/lib/constants'

const SUBJECTS = CATEGORIES.filter(c => c.name !== 'All').map(c => c.name)

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'

export default function UploadSkillPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    long_description: '',
    subject: 'Coding',
    difficulty: 'Beginner' as Difficulty,
    price: 0,
    is_free: true,
    input_schema: '',
    output_schema: '',
    compatible_runtimes: [] as string[],
  })
  const [file, setFile] = useState<File | null>(null)

  const RUNTIMES = ['Claude', 'OpenAI', 'Hermes', 'OpenClaw', 'Local LLM']

  function toggleRuntime(runtime: string) {
    setFormData(prev => ({
      ...prev,
      compatible_runtimes: prev.compatible_runtimes.includes(runtime)
        ? prev.compatible_runtimes.filter(r => r !== runtime)
        : [...prev.compatible_runtimes, runtime],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      toast.error('Please sign in first')
      router.push('/login')
      return
    }

    try {
      let fileUrl = null

      if (file) {
        const ext = file.name.split('.').pop()
        const fileName = `${session.user.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('skills')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('skills')
          .getPublicUrl(fileName)

        fileUrl = publicUrl
      }

      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const { error: insertError } = await supabase.from('skills').insert({
        seller_id: session.user.id,
        name: formData.name,
        slug,
        description: formData.description,
        long_description: formData.long_description,
        subject: formData.subject,
        difficulty: formData.difficulty,
        price: formData.is_free ? 0 : formData.price,
        is_free: formData.is_free,
        file_url: fileUrl,
        status: 'pending',
        input_schema: formData.input_schema || null,
        output_schema: formData.output_schema || null,
        compatible_runtimes: formData.compatible_runtimes,
      })

      if (insertError) throw insertError

      toast.success('Skill submitted for review!')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload skill')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', background: '#0F0F1A', border: '1px solid #252535',
    borderRadius: '8px', padding: '11px 14px', color: '#F8F8FF',
    fontSize: '14px', fontFamily: 'inherit', outline: 'none',
    transition: 'border-color 150ms',
  }

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
          <span style={{ color: '#F8F8FF' }}>List a skill</span>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#F8F8FF', letterSpacing: '-0.02em', marginBottom: '6px' }}>
          List a new skill
        </h1>
        <p style={{ fontSize: '14px', color: '#8884A0', marginBottom: '32px' }}>
          Free to list. SkillForge takes a commission only when you make a sale.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Basic info card */}
            <Section title="Basic Info">
              <Field label="Skill name" required>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., GitHub PR Summariser"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = '#7C3AED')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#252535')}
                />
              </Field>

              <Field label="Short description" required hint="One line shown on the skill tile">
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summarises GitHub PRs into structured review comments"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = '#7C3AED')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#252535')}
                />
              </Field>

              <Field label="Full description" hint="Markdown supported. Explain features, use cases, setup instructions.">
                <textarea
                  rows={6}
                  value={formData.long_description}
                  onChange={e => setFormData({ ...formData, long_description: e.target.value })}
                  placeholder="## What this skill does&#10;&#10;This skill hooks into Claude and..."
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.65 }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#7C3AED')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#252535')}
                />
              </Field>
            </Section>

            {/* Classification */}
            <Section title="Classification">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Field label="Category" required>
                  <select
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#7C3AED')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#252535')}
                  >
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>

                <Field label="Difficulty" required>
                  <select
                    value={formData.difficulty}
                    onChange={e => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#7C3AED')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#252535')}
                  >
                    {(['Beginner', 'Intermediate', 'Advanced'] as Difficulty[]).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Compatible runtimes" hint="Select all that apply">
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {RUNTIMES.map(r => {
                    const active = formData.compatible_runtimes.includes(r)
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => toggleRuntime(r)}
                        style={{
                          padding: '6px 14px', borderRadius: '8px', fontSize: '13px',
                          fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                          border: `1px solid ${active ? '#7C3AED' : '#252535'}`,
                          background: active ? 'rgba(124,58,237,0.15)' : 'transparent',
                          color: active ? '#A855F7' : '#555570',
                          transition: 'all 150ms',
                        }}
                      >
                        {r}
                      </button>
                    )
                  })}
                </div>
              </Field>
            </Section>

            {/* Schema section */}
            <Section title="Input / Output Schema" hint="Optional but required for Skill Composer compatibility">
              <Field label="Input schema" hint='e.g. "repo_url (string), depth (number, optional)"'>
                <input
                  type="text"
                  value={formData.input_schema}
                  onChange={e => setFormData({ ...formData, input_schema: e.target.value })}
                  placeholder="What your skill expects as input"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = '#06B6D4')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#252535')}
                />
              </Field>
              <Field label="Output schema" hint='e.g. "summary (markdown), labels (string[])"'>
                <input
                  type="text"
                  value={formData.output_schema}
                  onChange={e => setFormData({ ...formData, output_schema: e.target.value })}
                  placeholder="What your skill produces as output"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = '#06B6D4')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#252535')}
                />
              </Field>
            </Section>

            {/* Pricing */}
            <Section title="Pricing">
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '16px' }}>
                <div
                  onClick={() => setFormData({ ...formData, is_free: !formData.is_free, price: 0 })}
                  style={{
                    width: '40px', height: '22px', borderRadius: '11px',
                    background: formData.is_free ? '#7C3AED' : '#252535',
                    position: 'relative', cursor: 'pointer', transition: 'background 150ms', flexShrink: 0,
                  }}
                >
                  <div style={{
                    position: 'absolute', top: '3px',
                    left: formData.is_free ? '21px' : '3px',
                    width: '16px', height: '16px', borderRadius: '50%',
                    background: '#F8F8FF', transition: 'left 150ms',
                  }} />
                </div>
                <span style={{ fontSize: '14px', color: '#C4C4D4', fontWeight: 500 }}>List this skill for free</span>
              </label>

              {!formData.is_free && (
                <Field label="Price (£)" required>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#555570', fontSize: '14px' }}>£</span>
                    <input
                      type="number"
                      min="0.99"
                      step="0.01"
                      required
                      value={formData.price || ''}
                      onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="9.99"
                      style={{ ...inputStyle, paddingLeft: '28px' }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#7C3AED')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#252535')}
                    />
                  </div>
                </Field>
              )}
            </Section>

            {/* File upload */}
            <Section title="Skill Package">
              <Field label="Upload file" hint="ZIP or .tar.gz containing your SKILL.md and any supporting files">
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '8px', padding: '32px', borderRadius: '10px',
                  border: '1px dashed #252535', cursor: 'pointer',
                  background: '#0F0F1A', transition: 'border-color 150ms',
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#7C3AED')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#252535')}
                >
                  <span style={{ fontSize: '24px' }}>📦</span>
                  <span style={{ fontSize: '14px', color: file ? '#A855F7' : '#555570', fontWeight: file ? 600 : 400 }}>
                    {file ? file.name : 'Click to choose file'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#555570' }}>.zip or .tar.gz</span>
                  <input
                    type="file"
                    accept=".zip,.tar.gz"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    style={{ display: 'none' }}
                  />
                </label>
              </Field>
            </Section>

            {/* Submit */}
            <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Submitting…' : 'Submit for review →'}
              </button>
              <Link
                href="/dashboard"
                className="btn-secondary"
              >
                Cancel
              </Link>
            </div>

            <p style={{ fontSize: '12px', color: '#555570', lineHeight: 1.5 }}>
              Skills are reviewed by the SkillForge team before going live. Usually within 24 hours. You'll be notified by email.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#15151F', border: '1px solid #252535',
      borderRadius: '14px', padding: '28px',
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#F8F8FF' }}>{title}</h2>
        {hint && <p style={{ fontSize: '12px', color: '#555570', marginTop: '4px' }}>{hint}</p>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {children}
      </div>
    </div>
  )
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#8884A0' }}>{label}</span>
        {required && <span style={{ color: '#EF4444', marginLeft: '2px' }}>*</span>}
        {hint && <span style={{ fontSize: '11px', color: '#555570', marginLeft: '8px', fontWeight: 400 }}>{hint}</span>}
      </label>
      {children}
    </div>
  )
}
