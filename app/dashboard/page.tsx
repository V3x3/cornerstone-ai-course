import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MODULES } from '@/lib/content'
import { isCourseComplete } from '@/lib/progress'
import ModuleProgressCard from '@/components/dashboard/ModuleProgressCard'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: progress } = await supabase
    .from('lesson_progress').select('module_id, lesson_id').eq('user_id', user.id)

  const { data: quizAttempts } = await supabase
    .from('quiz_attempts').select('module_id').eq('user_id', user.id).eq('passed', true)

  const { data: cert } = await supabase
    .from('certificates').select('certificate_number').eq('user_id', user.id).single()

  const { data: profile } = await supabase
    .from('profiles').select('email').eq('id', user.id).single()

  const passedModules = new Set((quizAttempts ?? []).map(a => a.module_id))
  const completed = progress ?? []
  const courseComplete = isCourseComplete(completed) && [1,2,3,4].every(m => passedModules.has(m))

  return (
    <main style={{ maxWidth: '820px', margin: '0 auto', padding: '40px 24px 64px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--g1)' }}>Your progress</h1>
          <p style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '2px' }}>{profile?.email}</p>
        </div>
        <a href="/" style={{ fontSize: '13px', color: 'var(--text3)', textDecoration: 'none' }}>← Home</a>
      </header>

      {courseComplete && (
        <div style={{ background: 'var(--g1)', borderRadius: '10px', padding: '20px 24px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--g3)', fontWeight: 600, marginBottom: '4px' }}>🎉 Course complete!</p>
            {cert ? (
              <p style={{ fontSize: '12px', color: '#7aad8a' }}>Certificate: {cert.certificate_number}</p>
            ) : (
              <p style={{ fontSize: '12px', color: '#7aad8a' }}>Your certificate is ready to collect.</p>
            )}
          </div>
          <Link href="/certificate" style={{ background: 'var(--g3)', color: '#fff', padding: '10px 20px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
            {cert ? 'View certificate' : 'Get certificate →'}
          </Link>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {MODULES.map(m => (
          <ModuleProgressCard
            key={m.id}
            module={m}
            completed={completed}
            quizPassed={passedModules.has(m.id)}
          />
        ))}
      </div>
    </main>
  )
}
