import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'
import { colors, tints } from '../theme'
import { round } from '../fonts'
import { HighlightWord } from '../components/HighlightWord'
import { Watermark } from '../components/Watermark'
import { useEnterTransition } from '../components/sceneTransition'

const TILE_COUNT = 12

export function WallBuild() {
  const enter = useEnterTransition()
  const frame = useCurrentFrame()

  return (
    <AbsoluteFill style={{ background: colors.paper, ...enter }}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, width: '78%' }}>
          {Array.from({ length: TILE_COUNT }, (_, i) => {
            const delay = 6 + i * 4
            const scale = interpolate(frame, [delay, delay + 12], [0.5, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
            const opacity = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
            return (
              <div
                key={i}
                style={{
                  aspectRatio: '1',
                  background: tints[i % tints.length],
                  border: `2px solid ${colors.ink}`,
                  borderRadius: 14,
                  boxShadow: `3px 3px 0 ${colors.ink}`,
                  opacity,
                  transform: `scale(${scale})`,
                }}
              />
            )
          })}
        </div>
        <div style={{ fontFamily: round, fontWeight: 800, fontSize: 30, letterSpacing: '-0.01em', color: colors.violet }}>
          <HighlightWord kind="under" variant={1}>TON MUR</HighlightWord>, AU COMPLET
        </div>
      </AbsoluteFill>
      <Watermark />
    </AbsoluteFill>
  )
}
