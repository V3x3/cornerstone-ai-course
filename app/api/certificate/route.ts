import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isCourseComplete } from '@/lib/progress'
import { generateCertNumber } from '@/lib/certificate'

export async function POST(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: progress } = await supabase
    .from('lesson_progress').select('module_id, lesson_id').eq('user_id', user.id)
  if (!isCourseComplete(progress ?? [])) {
    return NextResponse.json({ error: 'Course not complete' }, { status: 403 })
  }

  const { data: existing } = await supabase
    .from('certificates').select('certificate_number').eq('user_id', user.id).single()

  if (existing) return NextResponse.json({ certificateNumber: existing.certificate_number })

  const certificateNumber = generateCertNumber()
  const { error } = await supabase
    .from('certificates').insert({ user_id: user.id, certificate_number: certificateNumber })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ certificateNumber })
}
