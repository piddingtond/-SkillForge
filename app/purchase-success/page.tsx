'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'

function PurchaseSuccessContent() {
  const params = useSearchParams()
  const isTest = params.get('test') === '1'
  const skillId = params.get('skillId')
  const sessionId = params.get('session_id')

  return (
    <div style={{
      minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-0)', padding: '48px 24px',
    }}>
      <div style={{
        maxWidth: '540px', width: '100%', textAlign: 'center',
        background: 'var(--bg-1)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '56px 48px',
      }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 28px',
          background: 'linear-gradient(135deg, #7C3AED22 0%, #06B6D422 100%)',
          border: '1px solid #7C3AED44',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '32px', color: '#06B6D4',
        }}>
          ✓
        </div>

        <h1 style={{
          fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          marginBottom: '12px',
        }}>
          Purchase complete
        </h1>

        <p style={{ color: 'var(--text-2)', fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
          Your skill is ready to download from your dashboard.
        </p>

        {isTest && (
          <p style={{
            color: 'var(--amber)', fontSize: '13px', marginBottom: '20px',
            background: '#F59E0B11', border: '1px solid #F59E0B33',
            borderRadius: '8px', padding: '8px 14px', display: 'inline-block',
          }}>
            Test mode — no payment was taken
          </p>
        )}

        {(sessionId || skillId) && (
          <p style={{ color: 'var(--text-4)', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', marginBottom: '8px' }}>
            {sessionId ? `ref: ${sessionId.slice(0, 20)}…` : `skill: ${skillId?.slice(0, 8)}…`}
          </p>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '32px' }}>
          <Link
            href="/dashboard"
            style={{
              display: 'inline-block', padding: '12px 28px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
              color: '#fff', fontWeight: 700, fontSize: '15px', textDecoration: 'none',
            }}
          >
            Go to dashboard →
          </Link>
          <Link
            href="/browse"
            style={{
              display: 'inline-block', padding: '12px 28px', borderRadius: '8px',
              border: '1px solid var(--border)', color: 'var(--text-2)',
              fontWeight: 500, fontSize: '15px', textDecoration: 'none',
            }}
          >
            Browse more skills
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PurchaseSuccessPage() {
  return (
    <>
      <Nav />
      <Suspense fallback={<div style={{ minHeight: '80vh', background: 'var(--bg-0)' }} />}>
        <PurchaseSuccessContent />
      </Suspense>
    </>
  )
}
