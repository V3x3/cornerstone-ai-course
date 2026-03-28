import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLessonCount } from '@/lib/content'

export async function POST(req: NextRequest) {
  const { moduleId, lessonId } = await req.json()

  if (!moduleId || moduleId < 1 || moduleId > 4) {
    return NextResponse.json({ error: 'Invalid moduleId' }, { status: 400 })
  }
  const maxLesson = getLessonCount(moduleId)
  if (!lessonId || lessonId < 1 || lessonId > maxLesson) {
    return NextResponse.json({ error: 'Invalid lessonId' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Ensure profile row exists (FK guard)
  await supabase.from('profiles').upsert({ id: user.id, email: user.email ?? '' }, { onConflict: 'id' })

  const { error } = await supabase
    .from('lesson_progress')
    .upsert({ user_id: user.id, module_id: moduleId, lesson_id: lessonId }, { onConflict: 'user_id,module_id,lesson_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
