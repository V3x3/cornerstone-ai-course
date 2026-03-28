'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Spinner from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/ToastProvider'

interface Props {
  moduleId: number
  lessonId: number
  isComplete: boolean
  nextHref: string | null
  moduleLessonCount: number
  completedInModule: number
}

export default function MarkCompleteButton({
  moduleId, lessonId, isComplete, nextHref,
  moduleLessonCount, completedInModule,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(isComplete)
  const [pulsing, setPulsing] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()

  async function handleClick() {
    if (done) { if (nextHref) router.push(nextHref); return }
    setLoading(true)
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, lessonId }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        console.error('[progress]', res.status, body)
        showToast("Couldn't save progress — please try again", 'error')
        setLoading(false)
        return
      }
      const newCount = completedInModule + 1
      showToast(`Lesson complete — ${newCount}/${moduleLessonCount} done in this module`, 'success')
      setDone(true)
      setPulsing(true)
      setTimeout(() => {
        setPulsing(false)
        setLoading(false)
        if (nextHref) router.push(nextHref)
        else router.refresh()
      }, 400)
      return
    } catch (e) {
      console.error('[progress fetch error]', e)
      showToast("Couldn't save progress — please try again", 'error')
      setLoading(false)
      return
    }
  }

  return (
    <>
      <style>{`
        @keyframes complete-pulse {
          0%   { box-shadow: 0 0 0 0    rgba(34,197,94,0.5); }
          100% { box-shadow: 0 0 0 14px rgba(34,197,94,0);   }
        }
        .btn-pulse { animation: complete-pulse 0.4s ease-out forwards; }
      `}</style>
      <button
        onClick={handleClick}
        disabled={loading}
        className={pulsing ? 'btn-pulse' : ''}
        style={{
          background: 'var(--g3)',
          color: '#fff',
          border: 'none',
          padding: '12px 28px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          marginTop: '40px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          opacity: loading ? 0.8 : 1,
        }}
      >
        {loading ? (
          <><Spinner size="sm" /> Saving…</>
        ) : done ? (
          nextHref ? '✓  Next lesson →' : '✓  Take the quiz →'
        ) : (
          'Mark complete →'
        )}
      </button>
    </>
  )
}
