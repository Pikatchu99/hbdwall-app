import { colors } from '../theme'
import { round } from '../fonts'
import { WallIcon } from './WallIcon'

export function Watermark() {
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 28,
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: '#fff',
        border: `2px solid ${colors.ink}`,
        borderRadius: 999,
        padding: '6px 14px 6px 6px',
        boxShadow: `3px 3px 0 ${colors.ink}`,
      }}
    >
      <WallIcon size={22} />
      <span style={{ fontFamily: round, fontWeight: 800, fontSize: 14, color: colors.ink, letterSpacing: '-0.01em' }}>hbdwall</span>
    </div>
  )
}
