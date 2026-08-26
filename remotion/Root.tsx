import { Composition } from 'remotion'
import { WallReplay, FPS, getDurationInFrames } from './WallReplay'
import type { WallReplayInputProps } from './types'
import './fonts'

const defaultProps: WallReplayInputProps = {
  wallSlug: 'exemple',
  recipientName: 'Léa',
  wallDateLabel: '14 mars',
  stats: { messageCount: 0, authorCount: 0, photoCount: 0 },
  messages: [],
  wordCloud: [],
  socials: { instagram: 'instagram.com/hbdwall', tiktok: 'tiktok.com/@hbdwall' },
}

export function RemotionRoot() {
  return (
    <Composition
      id="WallReplay"
      component={WallReplay}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={defaultProps}
      durationInFrames={getDurationInFrames(0)}
      calculateMetadata={({ props }) => ({
        durationInFrames: getDurationInFrames(props.messages.length),
      })}
    />
  )
}
