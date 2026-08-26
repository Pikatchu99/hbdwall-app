import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'
import { colors } from '../theme'
import { round, mono } from '../fonts'
import { Watermark } from '../components/Watermark'
import { useEnterTransition } from '../components/sceneTransition'
import type { WordCount } from '../types'

const WORD_COLORS = [colors.violet, colors.magenta, colors.blue, colors.orange]
const ROTATIONS = [-4, 3, -2, 5, -3, 2, -5, 4]
const MIN_SIZE = 24
const MAX_SIZE = 84

export function WallBuild({ wordCloud }: { wordCloud: WordCount[] }) {
  const enter = useEnterTransition()
  const frame = useCurrentFrame()

  const maxCount = wordCloud[0]?.count ?? 1
  const minCount = wordCloud[wordCloud.length - 1]?.count ?? 1
  const range = Math.max(maxCount - minCount, 1)

  return (
    <AbsoluteFill style={{ background: colors.paper, ...enter }}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 28, padding: '0 70px' }}>
        <div style={{ fontFamily: mono, fontSize: 20, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.muted }}>
          Ton mur, en mots
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '4px 18px', maxHeight: 900 }}>
          {wordCloud.map((w, i) => {
            const scale = Math.sqrt((w.count - minCount) / range)
            const size = MIN_SIZE + (MAX_SIZE - MIN_SIZE) * scale
            const delay = 6 + i * 3
            const opacity = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
            const pop = interpolate(frame, [delay, delay + 12], [0.6, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
            return (
              <span
                key={w.word}
                style={{
                  fontFamily: round,
                  fontWeight: 800,
                  fontSize: size,
                  lineHeight: 1,
                  color: WORD_COLORS[i % WORD_COLORS.length],
                  opacity,
                  transform: `scale(${pop}) rotate(${ROTATIONS[i % ROTATIONS.length]}deg)`,
                  display: 'inline-block',
                }}
              >
                {w.word}
              </span>
            )
          })}
        </div>
      </AbsoluteFill>
      <Watermark />
    </AbsoluteFill>
  )
}
