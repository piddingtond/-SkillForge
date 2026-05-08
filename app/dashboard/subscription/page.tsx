'use client'

import Link from 'next/link'
import Nav from '@/components/Nav'

const TIERS = [
  {
    label: 'Free Listing',
    rate: '0%',
    desc: 'List as many skills as you want at no cost.',
    features: ['Unlimited listings', 'All categories', 'Basic analytics', 'Standard search placement'],
    highlight: false,
  },
  {
    label: 'Commission on Sale',
    rate: '15%',
    desc: 'SkillForge takes 15% only when you make a sale. Nothing until then.',
    features: ['Bank transfer payout', 'Request when balance hits £10', 'Buyer protection included', 'Sales dashboard'],
    highlight: true,
  },
]

const FAQ = [
  {
    q: 'When do I get paid?',
    a: 'Request a payout from your dashboard once your balance reaches £10. We process bank transfers within 3 business days.',
  },
  {
    q: 'Are there any listing fees?',
    a: 'No. Listing is completely free. SkillForge earns only when you earn — 15% commission per sale.',
  },
  {
    q: 'What does the 15% cover?',
    a: 'Payment processing, buyer protection, hosting, and marketplace reach. Stripe takes ~2.9% of that, the rest funds the platform.',
  },
  {
    q: 'Can I offer free skills?',
    a: 'Yes. Free skills have no commission. They\'re a great way to build downloads and boost your Forge Score.',
  },
  {
    q: 'What runtimes does SkillForge support?',
    a: 'Claude, OpenAI, Hermes, OpenClaw, and local LLMs. Cross-platform skills are highlighted in the marketplace.',
  },
]

export default function CommissionPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#08080E', fontFamily: "'Inter', sans-serif" }}>
      <Nav />

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '56px 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#7C3AED', marginBottom: '12px',
          }}>
            How SkillForge Works
          </p>
          <h1 style={{
            fontSize: '36px', fontWeight: 800, letterSpacing: '-0.03em',
            color: '#F8F8FF', marginBottom: '14px',
          }}>
            Free to list. Commission on sale.
          </h1>
          <p style={{ fontSize: '16px', color: '#8884A0', maxWidth: '520px', margin: '0 auto', lineHeight: 1.65 }}>
            No monthly fees. No upfront costs. SkillForge takes 15% only when a buyer purchases your skill — we earn when you earn.
          </p>
        </div>

        {/* Model cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '56px' }}>
          {TIERS.map(tier => (
            <div key={tier.label} style={{
              background: tier.highlight
                ? 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(6,182,212,0.05) 100%)'
                : '#15151F',
              border: `1px solid ${tier.highlight ? 'rgba(124,58,237,0.35)' : '#252535'}`,
              borderRadius: '14px', padding: '32px',
              boxShadow: tier.highlight ? '0 0 40px rgba(124,58,237,0.1)' : 'none',
              position: 'relative',
            }}>
              {tier.highlight && (
                <div style={{
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
                  color: '#F8F8FF', fontSize: '11px', fontWeight: 800,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  padding: '4px 14px', borderRadius: '999px',
                }}>
                  How it works
                </div>
              )}
              <div style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '6px' }}>
                <span style={{
                  background: tier.highlight ? 'linear-gradient(135deg, #7C3AED, #06B6D4)' : 'none',
                  WebkitBackgroundClip: tier.highlight ? 'text' : 'unset',
                  WebkitTextFillColor: tier.highlight ? 'transparent' : '#F8F8FF',
                  backgroundClip: tier.highlight ? 'text' : 'unset',
                  color: tier.highlight ? undefined : '#F8F8FF',
                }}>
                  {tier.rate}
                </span>
              </div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#F8F8FF', marginBottom: '8px' }}>{tier.label}</p>
              <p style={{ fontSize: '13px', color: '#8884A0', lineHeight: 1.6, marginBottom: '20px' }}>{tier.desc}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tier.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#8884A0' }}>
                    <span style={{ color: '#10B981', flexShrink: 0 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#F8F8FF', marginBottom: '24px', letterSpacing: '-0.02em' }}>
            Frequently asked
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {FAQ.map(({ q, a }) => (
              <div key={q} style={{
                background: '#15151F', border: '1px solid #252535',
                borderRadius: '12px', padding: '20px 24px',
              }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#F8F8FF', marginBottom: '8px' }}>{q}</p>
                <p style={{ fontSize: '14px', color: '#8884A0', lineHeight: 1.65 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link href="/dashboard/upload" className="btn-primary" style={{ fontSize: '15px', padding: '13px 32px' }}>
            List your first skill →
          </Link>
          <p style={{ marginTop: '12px', fontSize: '13px', color: '#555570' }}>
            <Link href="/dashboard" style={{ color: '#555570', textDecoration: 'none' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#8884A0')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#555570')}
            >
              ← Back to dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
