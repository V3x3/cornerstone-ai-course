import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isCourseComplete } from '@/lib/progress'

export default async function CertificatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: progress } = await supabase
    .from('lesson_progress').select('module_id, lesson_id').eq('user_id', user.id)
  if (!isCourseComplete(progress ?? [])) redirect('/dashboard')

  const { data: cert } = await supabase
    .from('certificates').select('certificate_number, issued_at').eq('user_id', user.id).single()

  const { data: profile } = await supabase
    .from('profiles').select('email, full_name').eq('id', user.id).single()

  const name = profile?.full_name || profile?.email || 'Learner'
  const certNumber = cert?.certificate_number
  const issuedDate = cert?.issued_at ? new Date(cert.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null

  return (
    <main style={{ maxWidth: '680px', margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
      <a href="/dashboard" style={{ fontSize: '12px', color: 'var(--g2)', textDecoration: 'none', display: 'block', marginBottom: '32px', textAlign: 'left' }}>← Dashboard</a>

      <div style={{ border: '2px solid var(--g2)', borderRadius: '12px', padding: '48px 40px', background: '#fff' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '8px' }}>Certificate of Completion</p>
        <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--g1)', marginBottom: '24px' }}>Cornerstone<sup style={{ fontSize: '11px' }}>EU</sup></div>

        <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '8px' }}>This certifies that</p>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--g1)', marginBottom: '8px', letterSpacing: '-0.5px' }}>{name}</h1>
        <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '32px' }}>has successfully completed</p>

        <div style={{ background: 'var(--bg2)', borderRadius: '8px', padding: '20px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--g2)', marginBottom: '4px' }}>AI Foundations</h2>
          <p style={{ fontSize: '13px', color: 'var(--text3)' }}>4 modules · Critical thinking · Agents · Game theory & Antifragility</p>
        </div>

        {issuedDate && <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '4px' }}>Issued {issuedDate}</p>}
        {certNumber && <p style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'monospace' }}>{certNumber}</p>}
      </div>

      {!certNumber && (
        <form action="/api/certificate" method="POST" style={{ marginTop: '24px' }}>
          <button type="submit" style={{ background: 'var(--g3)', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            Issue my certificate →
          </button>
        </form>
      )}
    </main>
  )
}
