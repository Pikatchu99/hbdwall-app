import { Sequence, Audio, staticFile, interpolate, useVideoConfig } from 'remotion'
import { Intro } from './scenes/Intro'
import { Stats } from './scenes/Stats'
import { MessageScene } from './scenes/MessageScene'
import { WallBuild } from './scenes/WallBuild'
import { Outro } from './scenes/Outro'
import type { WallReplayInputProps } from './types'

export const FPS = 30
export const INTRO_FRAMES = 75
export const STATS_FRAMES = 65
export const MESSAGE_FRAMES = 80
export const BUILD_FRAMES = 85
export const OUTRO_FRAMES = 100

export function getDurationInFrames(messageCount: number) {
  return INTRO_FRAMES + STATS_FRAMES + messageCount * MESSAGE_FRAMES + BUILD_FRAMES + OUTRO_FRAMES
}

export function WallReplay({ recipientName, wallDateLabel, stats, messages, wordCloud, socials }: WallReplayInputProps) {
  const { durationInFrames } = useVideoConfig()
  let from = 0

  const introAt = from
  from += INTRO_FRAMES
  const statsAt = from
  from += STATS_FRAMES
  const messageStarts = messages.map(() => {
    const at = from
    from += MESSAGE_FRAMES
    return at
  })
  const buildAt = from
  from += BUILD_FRAMES
  const outroAt = from

  return (
    <>
      <Sequence from={introAt} durationInFrames={INTRO_FRAMES}>
        <Intro recipientName={recipientName} wallDateLabel={wallDateLabel} />
      </Sequence>
      <Sequence from={statsAt} durationInFrames={STATS_FRAMES}>
        <Stats stats={stats} />
      </Sequence>
      {messages.map((message, i) => (
        <Sequence key={message.id} from={messageStarts[i]} durationInFrames={MESSAGE_FRAMES}>
          <MessageScene message={message} index={i} />
        </Sequence>
      ))}
      <Sequence from={buildAt} durationInFrames={BUILD_FRAMES}>
        <WallBuild wordCloud={wordCloud} />
      </Sequence>
      <Sequence from={outroAt} durationInFrames={OUTRO_FRAMES}>
        <Outro recipientName={recipientName} socials={socials} />
      </Sequence>
      <Audio
        src={staticFile('audio/wall-replay-theme.mp3')}
        loop
        volume={f => interpolate(f, [durationInFrames - 20, durationInFrames], [0.5, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
      />
    </>
  )
}
