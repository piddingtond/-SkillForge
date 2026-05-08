'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PurchaseSuccessPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [router])

  return (
    <div style={{
      minHeight: '100vh', background: '#08080E',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}>
        <div style={{
          background: '#15151F',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '16px', padding: '48px 36px',
          boxShadow: '0 0 60px rgba(16,185,129,0.08)',
        }}>
          {/* Checkmark */}
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', fontSize: '28px',
          }}>
            ✓
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#F8F8FF', marginBottom: '12px', letterSpacing: '-0.02em' }}>
            Skill acquired!
          </h1>

          <p style={{ fontSize: '15px', color: '#8884A0', lineHeight: 1.65, marginBottom: '8px' }}>
            Your skill has been added to your account. Deploy it to any compatible AI agent — Claude, OpenAI, Hermes, and more.
          </p>

          <p style={{ fontSize: '13px', color: '#555570', marginBottom: '32px' }}>
            Redirecting to dashboard in {countdown}s…
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link href="/dashboard" className="btn-primary" style={{ fontSize: '14px', padding: '10px 24px' }}>
              Go to Dashboard
            </Link>
            <Link href="/browse" className="btn-secondary" style={{ fontSize: '14px', padding: '10px 24px' }}>
              Browse more
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
