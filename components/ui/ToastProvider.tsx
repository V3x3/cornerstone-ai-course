'use client'
import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

interface ToastContextValue {
  showToast: (message: string, type: 'success' | 'error') => void
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id)
    if (timer) { clearTimeout(timer); timers.current.delete(id) }
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = ++counter.current
    setToasts(prev => {
      const capped = prev.length >= 3 ? prev.slice(1) : prev
      return [...capped, { id, message, type }]
    })
    const timer = setTimeout(() => dismiss(id), 3000)
    timers.current.set(id, timer)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <style>{`
        @keyframes toast-in {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .toast-item { animation: toast-in 0.2s ease forwards; }
        .toast-container {
          position: fixed; bottom: 24px; right: 24px;
          display: flex; flex-direction: column; gap: 8px;
          z-index: 9999; pointer-events: none;
        }
        @media (max-width: 768px) {
          .toast-container { right: 16px; left: 16px; bottom: 16px; }
        }
      `}</style>
      <div className="toast-container">
        {toasts.map(t => (
          <div
            key={t.id}
            className="toast-item"
            style={{
              background: t.type === 'success' ? '#0a2e1a' : '#2e0a0a',
              border: `1px solid ${t.type === 'success' ? '#22c55e' : '#f87171'}`,
              borderLeft: `4px solid ${t.type === 'success' ? '#22c55e' : '#f87171'}`,
              padding: '12px 16px', borderRadius: '8px', color: '#fff',
              fontSize: '13px', minWidth: '240px', maxWidth: '320px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)', pointerEvents: 'all',
              display: 'flex', alignItems: 'flex-start', gap: '8px',
            }}
          >
            <span style={{ flex: 1, lineHeight: 1.4 }}>{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0, fontSize: '16px', lineHeight: 1 }}
            >×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
