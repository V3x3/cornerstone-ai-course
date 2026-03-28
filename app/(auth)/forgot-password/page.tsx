'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  const inputStyle = {
    background: '#0f3d22', border: '1px solid #1a5c38', padding: '11px 16px',
    color: '#fff', borderRadius: '6px', fontSize: '13px', outline: 'none', width: '100%',
  }

  return (
    <main style={{ maxWidth: '440px', margin: '80px auto', padding: '0 24px' }}>
      <a href="/login" style={{ fontSize: '13px', color: 'var(--g2)', textDecoration: 'none', display: 'block', marginBottom: '24px' }}>← Back to login</a>
      <div style={{ background: 'var(--g1)', borderRadius: '12px', padding: '32px 28px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Reset your password</h2>
        {sent ? (
          <p style={{ fontSize: '14px', color: '#7aad8a', lineHeight: 1.6 }}>
            Check your email — we sent a reset link to <strong style={{ color: '#fff' }}>{email}</strong>.
          </p>
        ) : (
          <>
            <p style={{ fontSize: '13px', color: '#7aad8a', marginBottom: '22px' }}>
              Enter your email and we&apos;ll send you a reset link.
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" required style={inputStyle}
              />
              {error && <p style={{ fontSize: '12px', color: '#f87171' }}>{error}</p>}
              <button
                type="submit" disabled={loading}
                style={{ background: 'var(--g3)', color: '#fff', border: 'none', padding: '11px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                {loading ? 'Sending…' : 'Send reset link →'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
