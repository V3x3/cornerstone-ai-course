'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import type { ProgressRow } from '@/lib/progress'
import { MODULES, getLesson } from '@/lib/content'

interface Props {
  completed: ProgressRow[]
}

export default function MobileNav({ completed }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close drawer on navigation
  useEffect(() => { setOpen(false) }, [pathname])

  // Derive current lesson title for the top bar
  const parts = pathname.split('/')
  const moduleId = parseInt(parts[2] ?? '1')
  const lessonId = parseInt(parts[3] ?? '1')
  const lesson = getLesson(moduleId, lessonId)
  const module = MODULES.find(m => m.id === moduleId)

  return (
    <>
      <style>{`
        .mobile-nav-bar { display: none; }
        .mobile-nav-overlay { display: none; }
        @media (max-width: 768px) {
          .mobile-nav-bar {
            display: flex;
            position: sticky;
            top: 0;
            z-index: 100;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            background: var(--bg2);
            border-bottom: 1px solid #c8e0d0;
          }
          .mobile-nav-overlay {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 200;
          }
        }
      `}</style>

      {/* Sticky top bar — mobile only */}
      <div className="mobile-nav-bar">
        <button
          onClick={() => setOpen(true)}
          style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--g1)', padding: '0 4px' }}
          aria-label="Open navigation"
        >
          ☰
        </button>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--g1)' }}>
          {module ? `Module 0${moduleId}` : ''}{lesson ? ` · ${lesson.title}` : ''}
        </span>
        <Link href="/dashboard" style={{ fontSize: '12px', color: 'var(--g2)', textDecoration: 'none' }}>← Dashboard</Link>
      </div>

      {/* Overlay drawer */}
      {open && (
        <div className="mobile-nav-overlay">
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }}
          />
          {/* Drawer */}
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0, width: '280px',
            background: 'var(--bg2)', overflowY: 'auto', zIndex: 1,
          }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px', borderBottom: '1px solid #c8e0d0' }}>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--g1)' }}
                aria-label="Close navigation"
              >
                ✕
              </button>
            </div>
            <Sidebar completed={completed} />
          </div>
        </div>
      )}
    </>
  )
}
