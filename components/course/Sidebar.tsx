import Link from 'next/link'
import type { ProgressRow } from '@/lib/progress'
import { MODULES } from '@/lib/content'
import { calculateModuleProgress } from '@/lib/progress'

interface Props {
  completed: ProgressRow[]
  currentModuleId: number
  currentLessonId: number
}

export default function Sidebar({ completed, currentModuleId, currentLessonId }: Props) {
  return (
    <nav style={{ width: '260px', flexShrink: 0, background: 'var(--bg2)', borderRight: '1px solid #c8e0d0', minHeight: '100vh', padding: '24px 0' }}>
      <div style={{ padding: '0 20px 16px', borderBottom: '1px solid #c8e0d0' }}>
        <Link href="/dashboard" style={{ fontSize: '12px', color: 'var(--g2)', textDecoration: 'none', fontWeight: 500 }}>← Dashboard</Link>
      </div>
      {MODULES.map(module => {
        const pct = calculateModuleProgress(module.id, completed)
        return (
          <div key={module.id} style={{ padding: '16px 20px 8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: module.accentColor, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Module 0{module.id}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text3)' }}>{pct}%</span>
            </div>
            <div style={{ height: '3px', background: '#c8e0d0', borderRadius: '2px', marginBottom: '10px' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: module.accentColor, borderRadius: '2px', transition: 'width 0.3s' }} />
            </div>
            {module.lessons.map(lesson => {
              const done = completed.some(r => r.module_id === module.id && r.lesson_id === lesson.id)
              const active = currentModuleId === module.id && currentLessonId === lesson.id
              return (
                <Link
                  key={lesson.id}
                  href={`/course/${module.id}/${lesson.id}`}
                  style={{
                    display: 'flex', gap: '8px', alignItems: 'flex-start',
                    padding: '6px 8px', borderRadius: '4px', textDecoration: 'none',
                    background: active ? '#fff' : 'transparent',
                    marginBottom: '2px',
                  }}
                >
                  <span style={{ fontSize: '12px', color: done ? 'var(--g3)' : 'var(--text3)', flexShrink: 0, marginTop: '1px' }}>
                    {done ? '✓' : '○'}
                  </span>
                  <span style={{ fontSize: '12px', color: active ? 'var(--g1)' : 'var(--text2)', lineHeight: 1.4 }}>
                    {lesson.title}
                  </span>
                </Link>
              )
            })}
            {pct === 100 && (
              <Link href={`/quiz/${module.id}`} style={{ display: 'block', marginTop: '8px', padding: '6px 8px', background: module.accentColor, color: '#fff', borderRadius: '4px', fontSize: '11px', fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
                Take quiz →
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
