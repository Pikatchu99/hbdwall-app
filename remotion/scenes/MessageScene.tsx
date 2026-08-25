import { AbsoluteFill, Img } from 'remotion'
import { colors, tints } from '../theme'
import { round, mono } from '../fonts'
import { HighlightWord } from '../components/HighlightWord'
import { Watermark } from '../components/Watermark'
import { useEnterTransition } from '../components/sceneTransition'
import type { WallReplayMessage } from '../types'

const ROTATIONS = [-1.5, 1, -0.6, 1.2]

function Author({ name, index }: { name: string; index: number }) {
  return (
    <span style={{ alignSelf: 'flex-end', fontFamily: round, fontWeight: 700, fontSize: 26, color: colors.violet }}>
      — <HighlightWord kind="under" variant={index}>{name}</HighlightWord>
    </span>
  )
}

export function MessageScene({ message, index }: { message: WallReplayMessage; index: number }) {
  const enter = useEnterTransition()
  const tint = tints[index % tints.length]
  const rotation = ROTATIONS[index % ROTATIONS.length]

  // Message avec photo : la photo occupe l'essentiel de la hauteur dispo
  // (au lieu d'une vignette perdue dans une carte texte à moitié vide).
  if (message.photoUrl) {
    return (
      <AbsoluteFill style={{ background: colors.paper, ...enter }}>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 56px' }}>
          <div
            style={{
              background: tint,
              border: `3px solid ${colors.ink}`,
              borderRadius: 24,
              padding: '26px 26px 32px',
              width: '86%',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              boxShadow: `6px 6px 0 ${colors.ink}`,
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <Img
              src={message.photoUrl}
              style={{
                width: '100%',
                aspectRatio: '4 / 5',
                objectFit: 'cover',
                border: `2px solid ${colors.ink}`,
                borderRadius: 16,
              }}
            />
            <p style={{ fontFamily: mono, fontSize: 22, lineHeight: 1.55, color: colors.ink, margin: 0 }}>{message.content}</p>
            {message.authorName && <Author name={message.authorName} index={index} />}
          </div>
        </AbsoluteFill>
        <Watermark />
      </AbsoluteFill>
    )
  }

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
          <p style={{ fontFamily: mono, fontSize: 24, lineHeight: 1.6, color: colors.ink, margin: 0 }}>{message.content}</p>
          {message.authorName && <Author name={message.authorName} index={index} />}
        </div>
      </AbsoluteFill>
      <Watermark />
    </AbsoluteFill>
  )
}
