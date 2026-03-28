import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/course/Sidebar'

export default async function CourseLayout({ children, params }: {
  children: React.ReactNode
  params: Promise<{ moduleId?: string; lessonId?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('module_id, lesson_id')
    .eq('user_id', user.id)

  const p = await params
  const moduleId = parseInt(p.moduleId ?? '1')
  const lessonId = parseInt(p.lessonId ?? '1')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar completed={progress ?? []} currentModuleId={moduleId} currentLessonId={lessonId} />
      <main style={{ flex: 1, padding: '40px 48px', maxWidth: '720px' }}>
        {children}
      </main>
    </div>
  )
}
