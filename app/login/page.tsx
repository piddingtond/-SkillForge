'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }

      toast.success('Welcome back!')
      const redirect = searchParams.get('redirect') || '/dashboard'
      router.push(redirect)
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong — please try again')
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
    <div style={{
      minHeight: '100vh', background: '#08080E',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              SkillForge
            </span>
          </Link>
          <p style={{ color: '#8884A0', fontSize: '14px', marginTop: '8px' }}>Sign in to your account</p>
        </div>

        <div style={{
          background: '#15151F', border: '1px solid #252535',
          borderRadius: '16px', padding: '36px',
        }}>
          <form onSubmit={handleLogin}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#8884A0', marginBottom: '6px' }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="you@example.com"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = '#7C3AED')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#252535')}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#8884A0', marginBottom: '6px' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={inputStyle}
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
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#8884A0' }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: '#A855F7', textDecoration: 'none', fontWeight: 600 }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#F8F8FF')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#A855F7')}
            >
              Create one free
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#08080E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: '2px solid #252535', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
