'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function ResetForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    let mounted = true
    const code = searchParams.get('code')
    if (!code) { router.replace('/forgot-password'); return }
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (!mounted) return
      if (error) router.replace('/forgot-password')
      else setReady(true)
    })
    return () => { mounted = false }
  }, [searchParams, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    setLoading(false)
    router.push('/dashboard')
  }

  const inputStyle = {
    background: '#0f3d22', border: '1px solid #1a5c38', padding: '11px 16px',
    color: '#fff', borderRadius: '6px', fontSize: '13px', outline: 'none', width: '100%',
  }

  if (!ready) return <p style={{ color: '#7aad8a', fontSize: '13px' }}>Verifying reset link…</p>

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New password (min 8 chars)" required style={inputStyle} />
      <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm new password" required style={inputStyle} />
      {error && <p style={{ fontSize: '12px', color: '#f87171' }}>{error}</p>}
      <button type="submit" disabled={loading} style={{ background: 'var(--g3)', color: '#fff', border: 'none', padding: '11px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
        {loading ? 'Updating…' : 'Update password →'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <main style={{ maxWidth: '440px', margin: '80px auto', padding: '0 24px' }}>
      <div style={{ background: 'var(--g1)', borderRadius: '12px', padding: '32px 28px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '22px' }}>Set new password</h2>
        <Suspense fallback={<p style={{ color: '#7aad8a', fontSize: '13px' }}>Loading…</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </main>
  )
}
