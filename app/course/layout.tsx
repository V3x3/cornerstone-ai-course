import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/course/Sidebar'
import MobileNav from '@/components/course/MobileNav'

export default async function CourseLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('module_id, lesson_id')
    .eq('user_id', user.id)

  return (
    <>
      <style>{`
        .course-sidebar { display: flex; }
        .course-mobile-nav { display: none; }
        @media (max-width: 768px) {
          .course-sidebar { display: none; }
          .course-mobile-nav { display: block; }
        }
      `}</style>

      {/* Mobile nav — visible on small screens only */}
      <div className="course-mobile-nav">
        <MobileNav completed={progress ?? []} />
      </div>

      {/* Desktop layout */}
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <div className="course-sidebar">
          <Sidebar completed={progress ?? []} />
        </div>
        <main style={{ flex: 1, padding: '40px 48px', maxWidth: '720px' }}>
          {children}
        </main>
      </div>
    </>
  )
}
