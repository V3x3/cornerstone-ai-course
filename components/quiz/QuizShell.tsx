'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Spinner from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/ToastProvider'
import { MODULES } from '@/lib/content'

interface Question {
  id: number
  question: string
  options: string[]
  correct: number
}

interface Props {
  moduleId: number
  questions: Question[]
  passMark: number
  moduleTitle: string
  accentColor: string
}

export default function QuizShell({ moduleId, questions, passMark, moduleTitle, accentColor }: Props) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [result, setResult] = useState<{ score: number; passed: boolean; passMark: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()

  const allAnswered = questions.every(q => answers[q.id] !== undefined)

  useEffect(() => {
    if (!result) return
    if (result.passed) {
      showToast(`Module ${moduleId} complete! Well done.`, 'success')
    } else {
      showToast(`Score: ${result.score}% — you need ${result.passMark}% to pass. Try again!`, 'error')
    }
  }, [result])

  async function handleSubmit() {
    setLoading(true)
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, answers }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        console.error('[quiz]', res.status, body)
        showToast("Couldn't submit quiz — please try again", 'error')
        setLoading(false)
        return
      }
      const data = await res.json()
      setResult(data)
      setLoading(false)
      if (data.passed) router.refresh()
    } catch (e) {
      console.error('[quiz fetch error]', e)
      showToast("Couldn't submit quiz — please try again", 'error')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', gap: '16px' }}>
        <Spinner />
        <p style={{ fontSize: '13px', color: 'var(--text3)' }}>Checking answers…</p>
      </div>
    )
  }

  if (result) {
    const nextModule = MODULES.find(m => m.id === moduleId + 1)
    const isFinalModule = !nextModule

    if (result.passed) {
      return (
        <div style={{ background: 'var(--bg2)', border: '1px solid #c8e0d0', borderRadius: '10px', padding: '28px 24px', maxWidth: '480px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--g3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span aria-hidden="true" style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>✓</span>
            </div>
            <div>
              <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--g1)', marginBottom: '4px' }}>
                Module {moduleId} complete
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text2)' }}>
                You scored {result.score}% — above the pass mark ({result.passMark}%)
              </p>
            </div>
          </div>

          {!isFinalModule && nextModule && (
            <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid #a3d9b5', borderLeft: '3px solid var(--g3)', borderRadius: '6px', padding: '12px 14px', marginBottom: '20px', fontSize: '13px', color: 'var(--text2)' }}>
              {nextModule.title} unlocked →
            </div>
          )}
          {isFinalModule && (
            <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid #a3d9b5', borderLeft: '3px solid var(--g3)', borderRadius: '6px', padding: '12px 14px', marginBottom: '20px', fontSize: '13px', color: 'var(--text2)' }}>
              Course complete — your certificate is ready →
            </div>
          )}

          {!isFinalModule && (
            <Link
              href={`/course/${moduleId + 1}/1`}
              style={{ display: 'block', background: 'var(--g3)', color: '#fff', padding: '12px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}
            >
              Start Module {moduleId + 1} →
            </Link>
          )}
          {isFinalModule && (
            <Link
              href="/certificate"
              style={{ display: 'block', background: 'var(--g3)', color: '#fff', padding: '12px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}
            >
              Get your certificate →
            </Link>
          )}
        </div>
      )
    }

    return (
      <div style={{ background: 'var(--bg2)', border: '1px solid #c8e0d0', borderRadius: '10px', padding: '28px 24px', maxWidth: '480px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span aria-hidden="true" style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>✗</span>
          </div>
          <div>
            <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--g1)', marginBottom: '4px' }}>Not quite</p>
            <p style={{ fontSize: '13px', color: 'var(--text2)' }}>
              You scored {result.score}% — you need {result.passMark}% to pass
            </p>
          </div>
        </div>
        <button
          onClick={() => { setResult(null); setAnswers({}) }}
          style={{ background: 'var(--g3)', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', width: '100%' }}
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div>
      {questions.map((q, qi) => (
        <div key={q.id} style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--g1)', marginBottom: '14px', lineHeight: 1.5 }}>
            {qi + 1}. {q.question}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {q.options.map((option, oi) => {
              const selected = answers[q.id] === oi
              return (
                <button
                  key={oi}
                  onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                  style={{
                    textAlign: 'left', padding: '12px 16px', borderRadius: '6px', cursor: 'pointer',
                    background: selected ? accentColor : 'var(--bg2)',
                    color: selected ? '#fff' : 'var(--text2)',
                    border: `1px solid ${selected ? accentColor : '#c8e0d0'}`,
                    fontSize: '13px', fontWeight: selected ? 500 : 400, transition: 'all 0.15s',
                  }}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      <button
        onClick={handleSubmit}
        disabled={!allAnswered || loading}
        style={{
          background: allAnswered ? 'var(--g3)' : 'var(--bg2)',
          color: allAnswered ? '#fff' : 'var(--text3)',
          border: 'none', padding: '12px 28px', borderRadius: '6px',
          fontSize: '13px', fontWeight: 600, cursor: allAnswered ? 'pointer' : 'not-allowed',
          display: 'inline-flex', alignItems: 'center', gap: '8px',
        }}
      >
        Submit answers →
      </button>
    </div>
  )
}
