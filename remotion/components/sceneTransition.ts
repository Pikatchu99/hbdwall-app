import { useCurrentFrame, interpolate } from 'remotion'

export function useEnterTransition(frames = 10) {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [0, frames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const scale = interpolate(frame, [0, frames], [1.03, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return { opacity, transform: `scale(${scale})` }
}
