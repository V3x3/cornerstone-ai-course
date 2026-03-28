'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
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
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  const inputStyle = { background: '#0f3d22', border: '1px solid #1a5c38', padding: '11px 16px', color: '#fff', borderRadius: '6px', fontSize: '13px', outline: 'none', width: '100%' }

  return (
    <main style={{ maxWidth: '440px', margin: '80px auto', padding: '0 24px' }}>
      <a href="/" style={{ fontSize: '13px', color: 'var(--g2)', textDecoration: 'none', display: 'block', marginBottom: '24px' }}>← Back</a>
      <div style={{ background: 'var(--g1)', borderRadius: '12px', padding: '32px 28px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '22px' }}>Welcome back</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required style={inputStyle} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required style={inputStyle} />
          <a href="/forgot-password" style={{ fontSize: '11px', color: '#4a7a5a', textAlign: 'right', textDecoration: 'none' }}>Forgot password?</a>
          {error && <p style={{ fontSize: '12px', color: '#f87171' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ background: 'var(--g3)', color: '#fff', border: 'none', padding: '11px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Logging in…' : 'Log in →'}
          </button>
        </form>
        <p style={{ fontSize: '12px', color: '#4a7a5a', marginTop: '16px' }}>
          No account? <a href="/signup" style={{ color: 'var(--g3)' }}>Enrol free →</a>
        </p>
      </div>
    </main>
  )
}
