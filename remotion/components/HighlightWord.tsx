import { useCurrentFrame, interpolate } from 'remotion'
import { colors } from '../theme'

const CIRCLE_PATHS = [
  'M12,55 C8,32 28,10 52,9 C77,8 95,28 91,52 C95,75 74,93 49,94 C24,95 8,77 12,55 Z',
  'M10,48 C14,24 34,6 58,10 C82,14 94,36 88,58 C94,80 70,96 46,92 C22,88 6,70 10,48 Z',
]
const UNDER_PATHS = [
  'M2,20 Q15,6 28,20 Q41,34 54,20 Q67,6 80,20 Q90,29 98,22',
  'M3,18 Q18,32 33,16 Q48,2 63,18 Q78,32 97,17',
]

interface Props {
  kind: 'circle' | 'under'
  variant?: number
  delay?: number
  color?: string
  children: React.ReactNode
}

// Doodle qui se dessine progressivement autour d'un mot, façon annotation
// dessinée à la main — utilisé pour mettre en avant un mot-clé par scène.
export function HighlightWord({ kind, variant = 0, delay = 12, color = colors.violet, children }: Props) {
  const frame = useCurrentFrame()
  const dashoffset = interpolate(frame, [delay, delay + 22], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const path = kind === 'circle' ? CIRCLE_PATHS[variant % CIRCLE_PATHS.length] : UNDER_PATHS[variant % UNDER_PATHS.length]
  const box = kind === 'circle' ? { inset: '-24% -16%' } : { left: '-6%', right: '-6%', bottom: '-55%', height: '45%' }

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {children}
      <svg
        viewBox={kind === 'circle' ? '0 0 100 100' : '0 0 100 40'}
        preserveAspectRatio="none"
        style={{ position: 'absolute', pointerEvents: 'none', overflow: 'visible', ...box }}
      >
        <path
          d={path}
          pathLength={1}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={1}
          strokeDashoffset={dashoffset}
        />
      </svg>
    </span>
  )
}
