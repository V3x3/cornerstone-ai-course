import Link from 'next/link'

export default function Hero() {
  return (
    <section style={{ marginBottom: '2.5rem' }}>
      <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--g3)', marginBottom: '12px' }}>
        Cornerstone EU · Open Education
      </p>
      <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--g1)', lineHeight: 1.15, letterSpacing: '-0.5px', marginBottom: '14px' }}>
        Learn to think — and build —<br />
        <span style={{ color: 'var(--g3)' }}>with AI.</span>
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--text2)', lineHeight: 1.7, maxWidth: '500px', marginBottom: '24px' }}>
        A free course for young European professionals. 5 modules. Self-paced. No prior knowledge required.
        Certificate of completion issued by Cornerstone EU.
      </p>
      <Link
        href="/signup"
        style={{
          display: 'inline-block', background: 'var(--g3)', color: '#fff',
          padding: '12px 28px', fontSize: '13px', fontWeight: 600,
          borderRadius: '6px', textDecoration: 'none', letterSpacing: '0.2px',
        }}
      >
        Enrol Free →
      </Link>
    </section>
  )
}
