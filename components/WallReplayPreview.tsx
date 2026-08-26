'use client'
import { Player } from '@remotion/player'
import { WallReplay, FPS, getDurationInFrames } from '@/remotion/WallReplay'
import type { WallReplayInputProps } from '@/remotion/types'

const PREVIEW_WIDTH = 360
const PREVIEW_HEIGHT = Math.round((PREVIEW_WIDTH * 1920) / 1080)

export default function WallReplayPreview({ inputProps }: { inputProps: WallReplayInputProps }) {
  return (
    <div style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT, margin: '0 auto' }}>
      <Player
        component={WallReplay}
        inputProps={inputProps}
        durationInFrames={getDurationInFrames(inputProps.messages.length)}
        fps={FPS}
        compositionWidth={1080}
        compositionHeight={1920}
        style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}
        controls
        loop
        autoPlay
      />
    </div>
  )
}
