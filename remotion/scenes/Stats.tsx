import { AbsoluteFill } from 'remotion'
import { colors } from '../theme'
import { round, mono } from '../fonts'
import { HighlightWord } from '../components/HighlightWord'
import { Watermark } from '../components/Watermark'
import { useEnterTransition } from '../components/sceneTransition'

interface Props {
  stats: { messageCount: number; authorCount: number; photoCount: number }
}

export function Stats({ stats }: Props) {
  const enter = useEnterTransition()

  return (
    <AbsoluteFill style={{ background: colors.violet, ...enter }}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center', color: '#fff' }}>
        <div style={{ fontFamily: mono, fontSize: 22, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
          Messages reçus
        </div>
        <div style={{ fontFamily: round, fontWeight: 800, fontSize: 145, color: colors.yellow, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          <HighlightWord kind="circle" variant={1} color="#fff">{stats.messageCount}</HighlightWord>
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
          <StatCell value={stats.authorCount} label="Proches" />
          <StatCell value={stats.photoCount} label="Photos" />
        </div>
      </AbsoluteFill>
      <Watermark />
    </AbsoluteFill>
  )
}

function StatCell({ value, label }: { value: number; label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        background: 'rgba(255,255,255,0.14)',
        border: '2px solid rgba(255,255,255,0.5)',
        borderRadius: 24,
        padding: '16px 24px',
      }}
    >
      <div style={{ fontFamily: round, fontWeight: 800, fontSize: 36, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontFamily: mono, fontSize: 16, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>{label}</div>
    </div>
  )
}
