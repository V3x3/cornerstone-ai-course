const STATS = [
  { value: 'Free', label: 'Always' },
  { value: '4', label: 'Modules' },
  { value: '~45 min', label: 'Per module' },
  { value: 'Self-paced', label: 'No deadlines' },
  { value: 'Certificate', label: 'On completion' },
]

export default function Stats() {
  return (
    <ul style={{
      display: 'flex', background: 'var(--bg2)',
      border: '1px solid var(--g2)', borderRadius: '8px',
      marginBottom: '2.5rem', overflow: 'hidden', listStyle: 'none', padding: 0,
    }}>
      {STATS.map((s, i) => (
        <li key={s.label} style={{
          flex: 1, padding: '18px 12px', textAlign: 'center',
          borderRight: i < STATS.length - 1 ? '1px solid #c8e0d0' : 'none',
        }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--g2)' }}>{s.value}</div>
          <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 500 }}>{s.label}</div>
        </li>
      ))}
    </ul>
  )
}
