import { useCurrentFrame, useVideoConfig, random, interpolate } from 'remotion'

const COLORS = ['#8E4CFF', '#F04FA4', '#FFD23F', '#8FD14F', '#4C8EFF', '#FF8A3D']
const COUNT = 40

// Particules déterministes (via random(seed) de Remotion, pas Math.random —
// nécessaire pour que le rendu frame par frame reste reproductible).
export function Confetti() {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const t = frame / fps

  const particles = Array.from({ length: COUNT }, (_, i) => {
    const seed = `confetti-${i}`
    const angle = random(seed + '-angle') * Math.PI - Math.PI / 2 - Math.PI / 4
    const speed = 3.2 + random(seed + '-speed') * 3
    const vx = Math.cos(angle) * speed
    const vy = Math.sin(angle) * speed - 2
    const gravity = 5.5
    const x = width / 2 + vx * t * fps * 0.5
    const y = height * 0.3 + vy * t * fps * 0.5 + 0.5 * gravity * (t * fps * 0.5) ** 2 * 0.02
    const rot = random(seed + '-rot') * 360 + t * (random(seed + '-spin') * 200 - 100)
    const size = 6 + random(seed + '-size') * 6
    const color = COLORS[i % COLORS.length]
    const opacity = interpolate(t, [0, 1.4, 1.8], [1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    return { x, y, rot, size, color, opacity }
  })

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            opacity: p.opacity,
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  )
}
