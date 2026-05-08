'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Nav() {
  const [user, setUser] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) =>
      setUser(session?.user ?? null)
    )
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => {
      subscription.unsubscribe()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: scrolled ? 'rgba(8,8,14,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid #252535' : '1px solid transparent',
      transition: 'all 250ms ease',
    }}>
      <div style={{
        maxWidth: '1280px', margin: '0 auto', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px',
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '20px', fontWeight: 800, letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            SkillForge
          </span>
          <span style={{
            fontSize: '9px', fontWeight: 800, letterSpacing: '0.12em', color: '#555570',
            textTransform: 'uppercase', border: '1px solid #252535', borderRadius: '4px',
            padding: '2px 6px',
          }}>
            BETA
          </span>
        </Link>

        {/* Centre links */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          {[
            { label: 'Browse', href: '/browse' },
            { label: 'Categories', href: '/categories' },
            { label: 'Pricing', href: '/pricing' },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              style={{ color: '#8884A0', fontSize: '14px', fontWeight: 500, textDecoration: 'none', transition: 'color 150ms' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#F8F8FF')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#8884A0')}
            >
              {label}
            </Link>
          ))}
          {user && (
            <Link
              href="/dashboard"
              style={{ color: '#8884A0', fontSize: '14px', fontWeight: 500, textDecoration: 'none', transition: 'color 150ms' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#F8F8FF')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#8884A0')}
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Auth */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {user ? (
            <button
              onClick={() => supabase.auth.signOut()}
              style={{ background: 'none', border: 'none', color: '#555570', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Sign Out
            </button>
          ) : (
            <>
              <Link
                href="/login"
                style={{ color: '#8884A0', fontSize: '14px', fontWeight: 500, textDecoration: 'none', transition: 'color 150ms' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#F8F8FF')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#8884A0')}
              >
                Sign In
              </Link>
              <Link href="/signup" className="btn-primary" style={{ fontSize: '14px', padding: '8px 20px' }}>
                Start Selling →
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
