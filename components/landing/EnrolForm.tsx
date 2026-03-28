'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function EnrolForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div style={{ background: 'var(--g1)', borderRadius: '12px', padding: '32px 28px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '6px', letterSpacing: '-0.3px' }}>
        Ready to start? <span style={{ color: 'var(--g3)' }}>It&apos;s free.</span>
      </h2>
      <p style={{ fontSize: '13px', color: '#7aad8a', marginBottom: '22px', lineHeight: 1.6 }}>
        Self-paced. No deadlines. A certificate that proves you&apos;re ahead of the curve.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '440px' }}>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com" required
          style={{ background: '#0f3d22', border: '1px solid #1a5c38', padding: '11px 16px', color: '#fff', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
        />
        <input
          type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Create a password" required minLength={8}
          style={{ background: '#0f3d22', border: '1px solid #1a5c38', padding: '11px 16px', color: '#fff', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
        />
        {error && <p style={{ fontSize: '12px', color: '#f87171' }}>{error}</p>}
        <button
          type="submit" disabled={loading}
          style={{ background: 'var(--g3)', color: '#fff', border: 'none', padding: '11px 22px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.3px' }}
        >
          {loading ? 'Creating account…' : 'Enrol Free →'}
        </button>
      </form>
      <p style={{ fontSize: '11px', color: '#4a7a5a', marginTop: '10px' }}>No spam. Unsubscribe anytime. Certificate issued by Cornerstone EU · Luxembourg.</p>
    </div>
  )
}
