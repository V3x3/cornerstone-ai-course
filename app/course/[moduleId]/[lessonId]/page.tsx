import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LessonContent from '@/components/course/LessonContent'
import MarkCompleteButton from '@/components/course/MarkCompleteButton'
import { getModule, getLesson, MODULES } from '@/lib/content'

interface Props {
  params: Promise<{ moduleId: string; lessonId: string }>
}

export async function generateStaticParams() {
  return MODULES.flatMap(m =>
    m.lessons.map(l => ({
      moduleId: String(m.id),
      lessonId: String(l.id),
    }))
  )
}

export default async function LessonPage({ params }: Props) {
  const { moduleId: mStr, lessonId: lStr } = await params
  const moduleId = parseInt(mStr)
  const lessonId = parseInt(lStr)

  const module = getModule(moduleId)
  const lesson = getLesson(moduleId, lessonId)
  if (!module || !lesson) redirect('/dashboard')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('module_id, lesson_id')
    .eq('user_id', user.id)

  const completed = progress ?? []
  const isComplete = completed.some(p => p.module_id === moduleId && p.lesson_id === lessonId)
  const moduleLessonCount = module.lessons.length
  const completedInModule = completed.filter(p => p.module_id === moduleId).length

  const nextLesson = getLesson(moduleId, lessonId + 1)
  const nextHref = nextLesson ? `/course/${moduleId}/${lessonId + 1}` : null

  return (
    <div>
      <p style={{ fontSize: '11px', fontWeight: 600, color: module.accentColor, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>
        Module 0{moduleId} · Lesson {lessonId}
      </p>
      <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--g1)', marginBottom: '32px', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
        {lesson.title}
      </h1>
      <LessonContent moduleId={moduleId} lessonId={lessonId} />
      <MarkCompleteButton
        moduleId={moduleId} lessonId={lessonId}
        isComplete={isComplete}
        nextHref={nextHref}
        moduleLessonCount={moduleLessonCount}
        completedInModule={completedInModule}
      />
    </div>
  )
}
