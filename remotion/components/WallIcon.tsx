import { colors } from '../theme'
import { display } from '../fonts'

// Reproduit l'icône réelle de l'app (public/icon-192.png) : un "W" sur une
// tuile encre, avec le petit carré violet en accent — pas un logo inventé.
export function WallIcon({ size = 20 }: { size?: number }) {
  const dotSize = size * 0.32
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: colors.ink,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: size * 0.1,
        flexShrink: 0,
      }}
    >
      <span style={{ fontFamily: display, fontWeight: 900, fontSize: size * 0.6, color: colors.paper, lineHeight: 1, letterSpacing: '-0.02em' }}>
        W
      </span>
      <div
        style={{
          position: 'absolute',
          top: -dotSize * 0.3,
          right: -dotSize * 0.3,
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize * 0.25,
          background: colors.violet,
        }}
      />
    </div>
  )
}
