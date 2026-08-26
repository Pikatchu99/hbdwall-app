import { useCurrentFrame, useVideoConfig, random, interpolate } from 'remotion'

const COLORS = ['#8E4CFF', '#F04FA4', '#FFD23F', '#8FD14F', '#4C8EFF', '#FF8A3D']
const COUNT = 40
const GRAVITY = 0.85 // px par frame²

// Particules déterministes (via random(seed) de Remotion, pas Math.random —
// nécessaire pour que le rendu frame par frame reste reproductible).
// Physique en pixels/frame directement (pas de double conversion via les
// secondes) pour un vrai burst rapide façon confetti, pas un mouvement lent.
export function Confetti() {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()

  const particles = Array.from({ length: COUNT }, (_, i) => {
    const seed = `confetti-${i}`
    const vx = (random(seed + '-vx') - 0.5) * 32 // -16..16 px/frame
    const vy0 = -(8 + random(seed + '-vy') * 10) // -8..-18 px/frame (vers le haut)

    const x = width / 2 + vx * frame
    const y = height * 0.32 + vy0 * frame + 0.5 * GRAVITY * frame * frame
    const rot = random(seed + '-rot') * 360 + frame * (random(seed + '-spin') * 14 - 7)
    const size = 7 + random(seed + '-size') * 7
    const color = COLORS[i % COLORS.length]
    const opacity = interpolate(frame, [0, 8, 42, 55], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
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
