import { useCurrentFrame, useVideoConfig } from 'remotion'
import { colors } from '../theme'

export function Balloons() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const sway = Math.sin((frame / fps) * Math.PI) * 4

  return (
    <svg
      width={78}
      height={94}
      viewBox="0 0 100 120"
      style={{
        transform: `rotate(${sway}deg)`,
        transformOrigin: '50% 15%',
        filter: `drop-shadow(3px 3px 0 ${colors.ink})`,
        marginBottom: 4,
      }}
    >
      <path d="M35 66 Q29 82 37 90 Q45 98 39 108" fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" />
      <path d="M65 70 Q71 85 63 93 Q55 100 61 108" fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" />
      <ellipse cx={35} cy={34} rx={25} ry={31} fill={colors.magenta} stroke={colors.ink} strokeWidth={3} strokeLinejoin="round" />
      <path d="M31 61 L35 67 L39 61 Z" fill={colors.ink} />
      <ellipse cx={64} cy={38} rx={27} ry={33} fill={colors.yellow} stroke={colors.ink} strokeWidth={3} strokeLinejoin="round" />
      <path d="M59 68 L64 74 L69 68 Z" fill={colors.ink} />
      <ellipse cx={27} cy={21} rx={6} ry={10} fill="rgba(255,255,255,.45)" />
      <ellipse cx={56} cy={24} rx={6.5} ry={11} fill="rgba(255,255,255,.4)" />
    </svg>
  )
}
