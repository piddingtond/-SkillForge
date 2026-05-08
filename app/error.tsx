'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{
      minHeight: '100vh', background: '#08080E',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif", padding: '24px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{
          fontSize: '48px', fontWeight: 900, color: '#EF4444',
          marginBottom: '16px', letterSpacing: '-0.02em',
        }}>
          Something went wrong
        </div>
        <p style={{ fontSize: '15px', color: '#8884A0', marginBottom: '36px', lineHeight: 1.6 }}>
          An unexpected error occurred. You can try again or head back to safety.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
              color: '#fff', padding: '11px 28px', borderRadius: '8px',
              fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer',
            }}
          >
            Try again
          </button>
          <Link href="/" style={{
            background: '#0F0F1A', border: '1px solid #252535',
            color: '#8884A0', padding: '11px 28px', borderRadius: '8px',
            fontWeight: 600, fontSize: '14px', textDecoration: 'none',
          }}>
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
