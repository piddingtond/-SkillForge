'use client'

import Link from 'next/link'
import Nav from '@/components/Nav'

const SELLER_FEATURES = [
  { icon: '∅', label: 'Zero listing fees', desc: 'List as many skills as you want, completely free.' },
  { icon: '15%', label: 'Commission on sale only', desc: 'We earn only when you earn — 15% per successful sale.' },
  { icon: '⚡', label: 'Fast payouts', desc: 'Stripe Connect transfers to your bank within 24 hours of a sale.' },
  { icon: '🌐', label: 'Cross-platform reach', desc: 'Skills work across Claude, OpenAI, Hermes, OpenClaw, and local LLMs.' },
]

const BUYER_FEATURES = [
  { icon: '🔒', label: 'Buyer protection', desc: 'Every purchase is covered. If a skill does not match its description, we make it right.' },
  { icon: '⬇️', label: 'Instant delivery', desc: 'Skills are delivered immediately after purchase — no waiting.' },
  { icon: '♾️', label: 'Yours to keep', desc: 'One purchase, permanent access. No subscriptions, no renewals.' },
  { icon: '🔁', label: 'Cross-runtime', desc: 'Use your purchased skill on any compatible AI runtime.' },
]

const FAQ = [
  {
    q: 'Are there any listing fees?',
    a: 'No. Listing is completely free. SkillForge earns only when you make a sale — 15% commission, nothing before that.',
  },
  {
    q: 'When do sellers get paid?',
    a: 'Payouts are processed within 24 hours of a sale via Stripe Connect, directly to your registered bank account.',
  },
  {
    q: 'What does the 15% commission cover?',
    a: 'Payment processing, buyer protection, hosting, and marketplace reach. Stripe takes ~2.9% + 30p of that; the rest funds the platform.',
  },
  {
    q: 'Can sellers offer free skills?',
    a: 'Yes. Free skills have no commission. They\'re a great way to build downloads, reviews, and your Forge Score.',
  },
  {
    q: 'Do buyers need to subscribe to anything?',
    a: 'No. Buyers pay per skill, once. No subscriptions, no recurring charges.',
  },
  {
    q: 'What runtimes does SkillForge support?',
    a: 'Claude, OpenAI, Hermes, OpenClaw, and local LLMs. Cross-platform compatibility is a core feature of the marketplace.',
  },
  {
    q: 'Is there a Skill Composer?',
    a: 'Coming soon. The Skill Composer lets you chain skills together into pipelines — sequential, selective, or layered — and test them before deploying.',
  },
]

export default function PricingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#08080E', fontFamily: "'Inter', sans-serif" }}>
      <Nav />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '64px 24px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '72px' }}>
          <p style={{
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: '#7C3AED', marginBottom: '14px',
          }}>
            Simple, honest pricing
          </p>
          <h1 style={{
            fontSize: '44px', fontWeight: 900, letterSpacing: '-0.03em',
            lineHeight: 1.1, marginBottom: '16px',
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Free to list.
            </span>
            <br />
            <span style={{ color: '#F8F8FF' }}>We earn when you earn.</span>
          </h1>
          <p style={{ fontSize: '18px', color: '#8884A0', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
            No monthly fees. No upfront costs. SkillForge takes 15% only when a buyer
            purchases your skill — and nothing until then.
          </p>
        </div>

        {/* Commission model callout */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(6,182,212,0.06) 100%)',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: '16px', padding: '40px 48px', marginBottom: '64px',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'radial-gradient(circle at 60% 0%, rgba(124,58,237,0.08) 0%, transparent 60%)',
            pointerEvents: 'none',
          }} />
          <p style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7C3AED', marginBottom: '10px' }}>
            The model
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '52px', fontWeight: 900, color: '#F8F8FF', letterSpacing: '-0.04em' }}>£0</div>
              <div style={{ fontSize: '13px', color: '#8884A0', marginTop: '4px' }}>to list a skill</div>
            </div>
            <div style={{ fontSize: '32px', color: '#252535', fontWeight: 300 }}>+</div>
            <div>
              <div style={{
                fontSize: '52px', fontWeight: 900, letterSpacing: '-0.04em',
                background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                15%
              </div>
              <div style={{ fontSize: '13px', color: '#8884A0', marginTop: '4px' }}>only on a sale</div>
            </div>
          </div>
          <p style={{ fontSize: '14px', color: '#8884A0', maxWidth: '440px', margin: '0 auto' }}>
            That 15% covers payment processing, buyer protection, hosting, and marketplace reach.
            Stripe's cut (~2.9% + 30p) comes out of that — so the platform margin is well below 15%.
          </p>
        </div>

        {/* For sellers */}
        <div style={{ marginBottom: '64px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7C3AED', marginBottom: '10px' }}>
            For sellers
          </p>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#F8F8FF', marginBottom: '6px', letterSpacing: '-0.02em' }}>
            Build once. Sell to anyone.
          </h2>
          <p style={{ fontSize: '14px', color: '#8884A0', marginBottom: '28px' }}>
            Upload your skill, set your price in GBP, and reach buyers across every major AI runtime.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {SELLER_FEATURES.map(f => (
              <div key={f.label} style={{
                background: '#0F0F1A', border: '1px solid #252535',
                borderRadius: '12px', padding: '22px',
              }}>
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>{f.icon}</div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#F8F8FF', marginBottom: '5px' }}>{f.label}</p>
                <p style={{ fontSize: '12px', color: '#8884A0', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* For buyers */}
        <div style={{ marginBottom: '64px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#06B6D4', marginBottom: '10px' }}>
            For buyers
          </p>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#F8F8FF', marginBottom: '6px', letterSpacing: '-0.02em' }}>
            Pay once. Own it.
          </h2>
          <p style={{ fontSize: '14px', color: '#8884A0', marginBottom: '28px' }}>
            No subscriptions, no recurring charges. Buy a skill, get it instantly, use it forever.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {BUYER_FEATURES.map(f => (
              <div key={f.label} style={{
                background: '#0F0F1A', border: '1px solid #252535',
                borderRadius: '12px', padding: '22px',
              }}>
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>{f.icon}</div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#F8F8FF', marginBottom: '5px' }}>{f.label}</p>
                <p style={{ fontSize: '12px', color: '#8884A0', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: '64px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#F8F8FF', marginBottom: '24px', letterSpacing: '-0.02em' }}>
            Frequently asked
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ.map(({ q, a }) => (
              <div key={q} style={{
                background: '#0F0F1A', border: '1px solid #252535',
                borderRadius: '12px', padding: '20px 24px',
              }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#F8F8FF', marginBottom: '6px' }}>{q}</p>
                <p style={{ fontSize: '13px', color: '#8884A0', lineHeight: 1.65 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          background: '#0F0F1A', border: '1px solid #252535',
          borderRadius: '16px', padding: '40px', textAlign: 'center',
        }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#F8F8FF', marginBottom: '10px', letterSpacing: '-0.02em' }}>
            Ready to start?
          </h2>
          <p style={{ fontSize: '14px', color: '#8884A0', marginBottom: '24px' }}>
            Create an account and list your first skill in minutes. No card required.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn-primary" style={{ fontSize: '15px', padding: '13px 32px' }}>
              Create account →
            </Link>
            <Link href="/browse" className="btn-secondary" style={{ fontSize: '15px', padding: '13px 32px' }}>
              Browse skills
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
