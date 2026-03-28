import type { Module } from '@/lib/content'

interface Props {
  module: Module
  index: number
}

export default function ModuleCard({ module, index }: Props) {
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--bg2)',
      borderLeft: `4px solid ${module.accentColor}`,
      borderRadius: '10px', padding: '22px 24px', marginBottom: '10px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 600, color: module.accentColor, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '5px' }}>
            Module 0{module.id}
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--g1)', letterSpacing: '-0.2px', lineHeight: 1.25 }}>
            {module.title}
          </h3>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text3)', whiteSpace: 'nowrap', paddingTop: '2px' }}>
          {module.lessons.length} lessons
        </span>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.7 }}>
        {module.description}
      </p>
    </div>
  )
}
