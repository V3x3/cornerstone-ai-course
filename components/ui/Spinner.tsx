export default function Spinner({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const px = size === 'sm' ? 16 : 32
  const strokeW = 2
  const r = (px / 2) - strokeW - 1
  const cx = px / 2
  const cy = px / 2
  const circumference = 2 * Math.PI * r
  const dashArray = circumference * 0.75  // 270° arc visible

  return (
    <>
      <style precedence="default">{`
        @keyframes spin-ring {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        .spinner-ring {
          transform-origin: ${cx}px ${cy}px;
          animation: spin-ring 0.8s linear infinite;
        }
      `}</style>
      <svg
        width={px}
        height={px}
        viewBox={`0 0 ${px} ${px}`}
        style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
        aria-label="Loading"
        role="img"
      >
        <circle
          className="spinner-ring"
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#22c55e"
          strokeWidth={strokeW}
          strokeDasharray={`${dashArray} ${circumference}`}
          strokeLinecap="round"
        />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#22c55e"
          fontSize={size === 'sm' ? 6 : 13}
          style={{ fontFamily: 'Georgia, serif', userSelect: 'none' }}
          aria-hidden="true"
        >∞</text>
      </svg>
    </>
  )
}
