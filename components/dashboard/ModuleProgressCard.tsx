import Link from 'next/link'
import type { Module } from '@/lib/content'
import { calculateModuleProgress, isModuleComplete } from '@/lib/progress'
import type { ProgressRow } from '@/lib/progress'

interface Props {
  module: Module
  completed: ProgressRow[]
  quizPassed: boolean
}

export default function ModuleProgressCard({ module, completed, quizPassed }: Props) {
  const pct = calculateModuleProgress(module.id, completed)
  const allLessonsDone = isModuleComplete(module.id, completed)

  return (
    <div style={{ background: '#fff', border: '1px solid var(--bg2)', borderLeft: `4px solid ${module.accentColor}`, borderRadius: '10px', padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <p style={{ fontSize: '10px', fontWeight: 600, color: module.accentColor, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Module 0{module.id}</p>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--g1)', lineHeight: 1.2 }}>{module.title}</h3>
        </div>
        {quizPassed && <span style={{ fontSize: '10px', background: '#dcfce7', color: 'var(--g2)', padding: '3px 8px', borderRadius: '20px', fontWeight: 600 }}>✓ Complete</span>}
      </div>

      <div style={{ height: '6px', background: 'var(--bg2)', borderRadius: '3px', marginBottom: '8px' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: module.accentColor, borderRadius: '3px', transition: 'width 0.3s' }} />
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '14px' }}>
        {completed.filter(r => r.module_id === module.id).length} / {module.lessons.length} lessons complete
      </p>

      <div style={{ display: 'flex', gap: '8px' }}>
        <Link href={`/course/${module.id}/1`} style={{ fontSize: '12px', fontWeight: 500, color: 'var(--g2)', textDecoration: 'none', background: 'var(--bg2)', padding: '6px 14px', borderRadius: '4px' }}>
          {pct === 0 ? 'Start' : pct === 100 ? 'Review' : 'Continue'}
        </Link>
        {allLessonsDone && !quizPassed && (
          <Link href={`/quiz/${module.id}`} style={{ fontSize: '12px', fontWeight: 600, color: '#fff', textDecoration: 'none', background: module.accentColor, padding: '6px 14px', borderRadius: '4px' }}>
            Take quiz →
          </Link>
        )}
      </div>
    </div>
  )
}
