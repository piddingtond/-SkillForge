import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', background: '#08080E',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif", padding: '24px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{
          fontSize: '72px', fontWeight: 900, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', marginBottom: '16px',
        }}>
          404
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#F8F8FF', marginBottom: '10px' }}>
          Page not found
        </h1>
        <p style={{ fontSize: '15px', color: '#8884A0', marginBottom: '36px', lineHeight: 1.6 }}>
          The skill or page you're looking for has moved or doesn't exist.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/browse" style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
            color: '#fff', padding: '11px 28px', borderRadius: '8px',
            fontWeight: 700, fontSize: '14px', textDecoration: 'none',
          }}>
            Browse Skills
          </Link>
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
