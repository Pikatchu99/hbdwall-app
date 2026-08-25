import { AbsoluteFill } from 'remotion'
import { colors } from '../theme'
import { round, mono } from '../fonts'
import { HighlightWord } from '../components/HighlightWord'
import { WallIcon } from '../components/WallIcon'
import { Confetti } from '../components/Confetti'
import { useEnterTransition } from '../components/sceneTransition'

interface Props {
  recipientName: string
  socials: { instagram: string; tiktok: string }
}

export function Outro({ recipientName, socials }: Props) {
  const enter = useEnterTransition()

  return (
    <AbsoluteFill style={{ background: colors.paper, ...enter }}>
      <Confetti />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 28, textAlign: 'center' }}>
        <div
          style={{
            fontFamily: round,
            fontWeight: 800,
            fontSize: 48,
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
            color: colors.ink,
            background: colors.yellow,
            padding: '0.2em 0.3em',
            borderRadius: 16,
          }}
        >
          Joyeux anniversaire <HighlightWord kind="under" variant={0}>{recipientName}</HighlightWord>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <WallIcon size={64} />
            <span style={{ fontFamily: round, fontWeight: 800, fontSize: 44, color: colors.ink, letterSpacing: '-0.01em' }}>hbdwall</span>
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            <SocialPill label={`Instagram · ${socials.instagram}`} />
            <SocialPill label={`TikTok · ${socials.tiktok}`} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

function SocialPill({ label }: { label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: '#fff',
        border: `2px solid ${colors.ink}`,
        borderRadius: 999,
        padding: '10px 20px',
        fontFamily: mono,
        fontWeight: 700,
        fontSize: 17,
        color: colors.ink,
        boxShadow: `3px 3px 0 ${colors.ink}`,
      }}
    >
      {label}
    </span>
  )
}
