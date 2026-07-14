// Doodles du design system "Sable Joyeux" (voir DESIGN.md).
// SVG hand-drawn, recolorables via la prop `color`. Décoratifs → aria-hidden.
// Utilisés sur toute surface joyeuse (landing, et à terme l'app sous [data-theme="joyful"]).

export function Sparkle({ size = 28, color = 'var(--v-yellow)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 1c.8 6.5 3.5 9.2 10 10-6.5.8-9.2 3.5-10 10-.8-6.5-3.5-9.2-10-10C8.5 10.2 11.2 7.5 12 1Z"
        fill={color} stroke="#0d0b14" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

export function Heart({ size = 28, color = 'var(--v-magenta)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 21S3 14.5 3 8.8C3 5.6 5.5 3.5 8.2 3.5c1.7 0 3 .9 3.8 2 .8-1.1 2.1-2 3.8-2C18.5 3.5 21 5.6 21 8.8 21 14.5 12 21 12 21Z"
        fill={color} stroke="#0d0b14" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

export function Star({ size = 28, color = 'var(--v-lime)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 18.6 6.1 20.8l1.2-6.6L2.5 9l6.6-.9L12 2Z"
        fill={color} stroke="#0d0b14" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

export function Confetti({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden>
      <rect x="4" y="6" width="6" height="6" rx="1.5" transform="rotate(20 7 9)" fill="var(--v-violet)" stroke="#0d0b14" strokeWidth="1.6" />
      <rect x="26" y="4" width="6" height="6" rx="1.5" transform="rotate(-15 29 7)" fill="var(--v-lime)" stroke="#0d0b14" strokeWidth="1.6" />
      <rect x="28" y="24" width="6" height="6" rx="1.5" transform="rotate(30 31 27)" fill="var(--v-orange)" stroke="#0d0b14" strokeWidth="1.6" />
      <rect x="5" y="25" width="6" height="6" rx="1.5" transform="rotate(-25 8 28)" fill="var(--v-blue)" stroke="#0d0b14" strokeWidth="1.6" />
      <path d="M18 1v6M1 18h6M29 18h6M18 29v6" stroke="#0d0b14" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}
