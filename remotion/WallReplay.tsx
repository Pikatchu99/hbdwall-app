import { Sequence } from 'remotion'
import { Intro } from './scenes/Intro'
import { Stats } from './scenes/Stats'
import { MessageScene } from './scenes/MessageScene'
import { WallBuild } from './scenes/WallBuild'
import { Outro } from './scenes/Outro'
import type { WallReplayInputProps } from './types'

export const FPS = 30
export const INTRO_FRAMES = 100
export const STATS_FRAMES = 80
export const MESSAGE_FRAMES = 100
export const BUILD_FRAMES = 110
export const OUTRO_FRAMES = 130

export function getDurationInFrames(messageCount: number) {
  return INTRO_FRAMES + STATS_FRAMES + messageCount * MESSAGE_FRAMES + BUILD_FRAMES + OUTRO_FRAMES
}

export function WallReplay({ recipientName, wallDateLabel, stats, messages, socials }: WallReplayInputProps) {
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
        <WallBuild />
      </Sequence>
      <Sequence from={outroAt} durationInFrames={OUTRO_FRAMES}>
        <Outro recipientName={recipientName} socials={socials} />
      </Sequence>
    </>
  )
}
