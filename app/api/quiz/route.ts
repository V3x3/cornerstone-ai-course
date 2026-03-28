import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import fs from 'fs'
import path from 'path'

interface QuizData {
  questions: { id: number; correct: number }[]
  passMark: number
}

export async function POST(req: NextRequest) {
  const { moduleId, answers } = await req.json() as { moduleId: number; answers: Record<number, number> }

  if (!moduleId || moduleId < 1 || moduleId > 4) {
    return NextResponse.json({ error: 'Invalid moduleId' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const quizPath = path.join(process.cwd(), 'content', `module-${moduleId}`, 'quiz.json')
  const quiz: QuizData = JSON.parse(fs.readFileSync(quizPath, 'utf-8'))

  const correct = quiz.questions.filter(q => answers[q.id] === q.correct).length
  const score = Math.round((correct / quiz.questions.length) * 100)
  const passed = score >= quiz.passMark

  await supabase.from('quiz_attempts').insert({ user_id: user.id, module_id: moduleId, score, passed })

  return NextResponse.json({ score, passed, passMark: quiz.passMark })
}
