'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function SignUpPage() {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, username },
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    // Profile row is created automatically by the handle_new_user() trigger
    // in database/functions.sql, which reads full_name + username from
    // raw_user_meta_data. No client-side insert needed (and it would fail
    // anyway — there's no INSERT RLS policy on profiles).

    toast.success('Account created! Check your email to verify.')
    router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#08080E',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              SkillForge
            </span>
          </Link>
          <p style={{ color: '#8884A0', fontSize: '14px', marginTop: '8px' }}>Free to join. Commission only on sales.</p>
        </div>

        {/* Value prop strip */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '20px',
          marginBottom: '28px', flexWrap: 'wrap',
        }}>
          {['Free to list', 'No monthly fee', 'Skills for every AI platform', 'Windows & Mac'].map(v => (
            <span key={v} style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontSize: '12px', color: '#8884A0',
            }}>
              <span style={{ color: '#10B981' }}>✓</span> {v}
            </span>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: '#15151F', border: '1px solid #252535',
          borderRadius: '16px', padding: '36px',
        }}>
          <form onSubmit={handleSignUp}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#8884A0', marginBottom: '6px' }}>
                  Full name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  autoFocus
                  placeholder="Alex Johnson"
                  style={{
                    width: '100%', background: '#0F0F1A', border: '1px solid #252535',
                    borderRadius: '8px', padding: '11px 14px', color: '#F8F8FF',
                    fontSize: '14px', fontFamily: 'inherit', outline: 'none',
                    transition: 'border-color 150ms',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#7C3AED')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#252535')}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#8884A0', marginBottom: '6px' }}>
                  Username <span style={{ color: '#EF4444' }}>*</span>
                  <span style={{ fontWeight: 400, color: '#555570', marginLeft: '6px' }}>— shown on your skill listings</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                    color: '#555570', fontSize: '14px', pointerEvents: 'none',
                  }}>@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    required
                    placeholder="alexbuilds"
                    style={{
                      width: '100%', background: '#0F0F1A', border: '1px solid #252535',
                      borderRadius: '8px', padding: '11px 14px 11px 30px', color: '#F8F8FF',
                      fontSize: '14px', fontFamily: 'inherit', outline: 'none',
                      transition: 'border-color 150ms',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#7C3AED')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#252535')}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#8884A0', marginBottom: '6px' }}>
                  Email address <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  style={{
                    width: '100%', background: '#0F0F1A', border: '1px solid #252535',
                    borderRadius: '8px', padding: '11px 14px', color: '#F8F8FF',
                    fontSize: '14px', fontFamily: 'inherit', outline: 'none',
                    transition: 'border-color 150ms',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#7C3AED')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#252535')}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#8884A0', marginBottom: '6px' }}>
                  Password <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Min 8 characters"
                  style={{
                    width: '100%', background: '#0F0F1A', border: '1px solid #252535',
                    borderRadius: '8px', padding: '11px 14px', color: '#F8F8FF',
                    fontSize: '14px', fontFamily: 'inherit', outline: 'none',
                    transition: 'border-color 150ms',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#7C3AED')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#252535')}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '24px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Creating account…' : 'Create Account →'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '11px', color: '#555570', lineHeight: 1.5 }}>
              By signing up you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#8884A0' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#A855F7', textDecoration: 'none', fontWeight: 600 }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#F8F8FF')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#A855F7')}
            >
              Sign in
            </Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#555570' }}>
          <Link href="/" style={{ color: '#555570', textDecoration: 'none' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#8884A0')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#555570')}
          >
            ← Back to marketplace
          </Link>
        </p>
      </div>
    </div>
  )
}
