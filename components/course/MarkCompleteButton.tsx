'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  moduleId: number
  lessonId: number
  isComplete: boolean
  nextHref: string | null
}

export default function MarkCompleteButton({ moduleId, lessonId, isComplete, nextHref }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleClick() {
    if (isComplete) { if (nextHref) router.push(nextHref); return }
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
      }
    } catch (e) { console.error('[progress fetch error]', e) }
    setLoading(false)
    if (nextHref) router.push(nextHref)
    else router.refresh()
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        background: isComplete ? 'var(--bg2)' : 'var(--g3)',
        color: isComplete ? 'var(--g2)' : '#fff',
        border: isComplete ? '1px solid var(--g2)' : 'none',
        padding: '12px 28px', borderRadius: '6px',
        fontSize: '13px', fontWeight: 600, cursor: 'pointer',
        marginTop: '40px',
      }}
    >
      {loading ? 'Saving…' : isComplete ? (nextHref ? 'Next lesson →' : 'Take the quiz →') : 'Mark complete →'}
    </button>
  )
}
