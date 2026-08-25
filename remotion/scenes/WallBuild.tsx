import { AbsoluteFill, Img, useCurrentFrame, interpolate } from 'remotion'
import { colors, tints } from '../theme'
import { round } from '../fonts'
import { HighlightWord } from '../components/HighlightWord'
import { Watermark } from '../components/Watermark'
import { useEnterTransition } from '../components/sceneTransition'
import type { WallReplayTile } from '../types'

export function WallBuild({ tiles }: { tiles: WallReplayTile[] }) {
  const enter = useEnterTransition()
  const frame = useCurrentFrame()

  return (
    <AbsoluteFill style={{ background: colors.paper, ...enter }}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, width: '78%' }}>
          {tiles.map((tile, i) => {
            const delay = 4 + i * 3
            const scale = interpolate(frame, [delay, delay + 10], [0.5, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
            const opacity = interpolate(frame, [delay, delay + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
            const tint = tints[i % tints.length]
            const initial = tile.authorName?.trim()?.[0]?.toUpperCase() ?? '♥'
            return (
              <div
                key={tile.id}
                style={{
                  position: 'relative',
                  aspectRatio: '1',
                  background: tile.photoUrl ? undefined : tint,
                  border: `2px solid ${colors.ink}`,
                  borderRadius: 14,
                  boxShadow: `3px 3px 0 ${colors.ink}`,
                  opacity,
                  transform: `scale(${scale})`,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {tile.photoUrl ? (
                  <Img src={tile.photoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontFamily: round, fontWeight: 800, fontSize: 40, color: colors.ink, opacity: 0.55 }}>{initial}</span>
                )}
              </div>
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
