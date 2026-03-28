'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

  const allAnswered = questions.every(q => answers[q.id] !== undefined)

  async function handleSubmit() {
    setLoading(true)
    const res = await fetch('/api/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleId, answers }),
    })
    const data = await res.json()
    setResult(data)
    setLoading(false)
    router.refresh()
  }

  if (result) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>{result.passed ? '🎉' : '📚'}</div>
        <h2 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--g1)', marginBottom: '8px' }}>
          {result.score}%
        </h2>
        <p style={{ fontSize: '15px', color: result.passed ? 'var(--g2)' : 'var(--text2)', marginBottom: '24px' }}>
          {result.passed ? `You passed! (pass mark: ${result.passMark}%)` : `Not quite — pass mark is ${result.passMark}%. Try again.`}
        </p>
        {result.passed && moduleId < 4 && (
          <a href={`/course/${moduleId + 1}/1`} style={{ display: 'inline-block', background: 'var(--g3)', color: '#fff', padding: '12px 28px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
            Start Module 0{moduleId + 1} →
          </a>
        )}
        {result.passed && moduleId === 4 && (
          <a href="/certificate" style={{ display: 'inline-block', background: 'var(--g3)', color: '#fff', padding: '12px 28px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
            Get your certificate →
          </a>
        )}
        {!result.passed && (
          <button onClick={() => setResult(null)} style={{ background: 'var(--bg2)', color: 'var(--g2)', border: '1px solid var(--g2)', padding: '12px 28px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            Retry quiz
          </button>
        )}
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
          fontSize: '13px', fontWeight: 600, cursor: allAnswered ? 'pointer' : 'default',
        }}
      >
        {loading ? 'Submitting…' : 'Submit answers →'}
      </button>
    </div>
  )
}
