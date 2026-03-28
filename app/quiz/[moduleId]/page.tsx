import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getModule } from '@/lib/content'
import { isModuleComplete } from '@/lib/progress'
import QuizShell from '@/components/quiz/QuizShell'
import fs from 'fs'
import path from 'path'

interface Props { params: Promise<{ moduleId: string }> }

export default async function QuizPage({ params }: Props) {
  const { moduleId: mStr } = await params
  const moduleId = parseInt(mStr)
  const module = getModule(moduleId)
  if (!module) redirect('/dashboard')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: progress } = await supabase
    .from('lesson_progress').select('module_id, lesson_id').eq('user_id', user.id)

  if (!isModuleComplete(moduleId, progress ?? [])) {
    redirect(`/course/${moduleId}/1`)
  }

  const quizPath = path.join(process.cwd(), 'content', `module-${moduleId}`, 'quiz.json')
  const quiz = JSON.parse(fs.readFileSync(quizPath, 'utf-8'))

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}>
      <a href={`/course/${moduleId}/1`} style={{ fontSize: '12px', color: 'var(--g2)', textDecoration: 'none', display: 'block', marginBottom: '24px' }}>← Back to module</a>
      <p style={{ fontSize: '11px', fontWeight: 600, color: module.accentColor, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>Module 0{moduleId} · Quiz</p>
      <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--g1)', marginBottom: '8px' }}>{module.title}</h1>
      <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '36px' }}>
        {quiz.questions.length} questions · Pass mark: {quiz.passMark}% · You can retry as many times as you need.
      </p>
      <QuizShell
        moduleId={moduleId}
        questions={quiz.questions}
        passMark={quiz.passMark}
        moduleTitle={module.title}
        accentColor={module.accentColor}
      />
    </div>
  )
}
