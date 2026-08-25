import { AbsoluteFill, Img } from 'remotion'
import { colors, tints } from '../theme'
import { round, mono } from '../fonts'
import { HighlightWord } from '../components/HighlightWord'
import { Watermark } from '../components/Watermark'
import { useEnterTransition } from '../components/sceneTransition'
import type { WallReplayMessage } from '../types'

const ROTATIONS = [-1.5, 1, -0.6, 1.2]

export function MessageScene({ message, index }: { message: WallReplayMessage; index: number }) {
  const enter = useEnterTransition()
  const tint = tints[index % tints.length]
  const rotation = ROTATIONS[index % ROTATIONS.length]

  return (
    <AbsoluteFill style={{ background: colors.paper, ...enter }}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 60px' }}>
        <div
          style={{
            background: tint,
            border: `3px solid ${colors.ink}`,
            borderRadius: 24,
            padding: '44px 40px',
            width: '82%',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            boxShadow: `6px 6px 0 ${colors.ink}`,
            transform: `rotate(${rotation}deg)`,
          }}
        >
          {message.photoUrl && (
            <Img
              src={message.photoUrl}
              style={{
                width: 110,
                height: 110,
                objectFit: 'cover',
                border: `2px solid ${colors.ink}`,
                borderRadius: 16,
                boxShadow: `4px 4px 0 ${colors.ink}`,
                alignSelf: 'flex-start',
              }}
            />
          )}
          <p style={{ fontFamily: mono, fontSize: 24, lineHeight: 1.6, color: colors.ink, margin: 0 }}>{message.content}</p>
          {message.authorName && (
            <span style={{ alignSelf: 'flex-end', fontFamily: round, fontWeight: 700, fontSize: 26, color: colors.violet }}>
              — <HighlightWord kind="under" variant={index}>{message.authorName}</HighlightWord>
            </span>
          )}
        </div>
      </AbsoluteFill>
      <Watermark />
    </AbsoluteFill>
  )
}
