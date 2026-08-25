import { AbsoluteFill } from 'remotion'
import { colors } from '../theme'
import { round, mono } from '../fonts'
import { Balloons } from '../components/Balloons'
import { HighlightWord } from '../components/HighlightWord'
import { Watermark } from '../components/Watermark'
import { useEnterTransition } from '../components/sceneTransition'

export function Intro({ recipientName, wallDateLabel }: { recipientName: string; wallDateLabel: string }) {
  const enter = useEnterTransition()

  return (
    <AbsoluteFill style={{ background: colors.paper, ...enter }}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Balloons />
        <div style={{ fontFamily: mono, fontSize: 22, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.muted }}>
          Mur d&rsquo;anniversaire
        </div>
        <div style={{ fontFamily: round, fontWeight: 800, fontSize: 110, letterSpacing: '-0.01em', lineHeight: 0.95, color: colors.violet }}>
          <HighlightWord kind="circle" variant={0}>{recipientName.toUpperCase()}</HighlightWord>
        </div>
        <div style={{ fontFamily: mono, fontSize: 26, letterSpacing: '0.05em', color: colors.muted }}>{wallDateLabel}</div>
      </AbsoluteFill>
      <Watermark />
    </AbsoluteFill>
  )
}
