export default function LogoMark() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'flex-end', gap: '5px', lineHeight: 1 }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          fontWeight: 400,
          textTransform: 'lowercase',
          letterSpacing: '0.06em',
          color: 'var(--fg-muted)',
          lineHeight: 1.4,
        }}>
          birthday
        </span>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: 900,
          letterSpacing: '-0.03em',
          color: 'var(--fg)',
          lineHeight: 0.9,
        }}>
          Wall
        </span>
      </div>
      <div style={{
        width: '7px',
        height: '7px',
        background: 'var(--accent)',
        flexShrink: 0,
        marginBottom: '3px',
      }} />
    </div>
  )
}
