// Helpers partagés pour les cartes générées (next/og + Satori) : palette, polices,
// avatar (photo → data URL, sinon mascotte), QR, doodles. Runtime Node uniquement.
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import QRCode from 'qrcode'

// DA "Sable Joyeux" en hex (Satori ne lit pas oklch de façon fiable).
export const PAPER = '#F3F0EA'
export const INK = '#1A1626'
export const VIOLET = '#7C5CFF'
export const YELLOW = '#FFE26A'
export const LIME = '#C7F25E'
export const MAGENTA = '#FF5CA8'
export const BLUE = '#5C9BFF'
export const MUTED = '#8A8597'
export const SITE = 'https://hbdwall.xyz'

const MASCOTS = ['bow', 'heart', 'letter', 'peace']

const FS = 'https://cdn.jsdelivr.net/fontsource/fonts'
const FONT_SIGS = ['wOFF', 'OTTO', 'true', 'ttcf']

async function loadFont(file: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(`${FS}/${file}`)
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    const sig = Buffer.from(buf.slice(0, 4))
    const isTtf = sig[0] === 0x00 && sig[1] === 0x01 && sig[2] === 0x00 && sig[3] === 0x00
    return FONT_SIGS.includes(sig.toString('latin1')) || isTtf ? buf : null
  } catch {
    return null
  }
}

export function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export async function resolveAvatar(image: string | null, pseudo: string): Promise<{ url: string; fit: 'cover' | 'contain' }> {
  if (image) {
    try {
      const r = await fetch(image)
      if (r.ok) {
        const ct = r.headers.get('content-type') || 'image/jpeg'
        const b = Buffer.from(await r.arrayBuffer())
        return { url: `data:${ct};base64,${b.toString('base64')}`, fit: 'cover' }
      }
    } catch {}
  }
  const mascot = MASCOTS[hash(pseudo) % MASCOTS.length]
  const png = await readFile(path.join(process.cwd(), 'public', 'mascots', `mascot-${mascot}.png`))
  return { url: `data:image/png;base64,${png.toString('base64')}`, fit: 'contain' }
}

export function makeQr(url: string): Promise<string> {
  return QRCode.toDataURL(url, { margin: 1, width: 260, color: { dark: INK, light: '#ffffff' } })
}

export type CardFont = { name: string; data: ArrayBuffer; weight: 400 | 700 | 800 | 900; style: 'normal' }

export async function loadCardFonts(): Promise<CardFont[]> {
  const [baloo, inter, mono700, mono400] = await Promise.all([
    loadFont('baloo-2@latest/latin-800-normal.woff'),
    loadFont('inter@latest/latin-900-normal.woff'),
    loadFont('space-mono@latest/latin-700-normal.woff'),
    loadFont('space-mono@latest/latin-400-normal.woff'),
  ])
  return [
    baloo && { name: 'Baloo 2', data: baloo, weight: 800 as const, style: 'normal' as const },
    inter && { name: 'Inter', data: inter, weight: 900 as const, style: 'normal' as const },
    mono700 && { name: 'Space Mono', data: mono700, weight: 700 as const, style: 'normal' as const },
    mono400 && { name: 'Space Mono', data: mono400, weight: 400 as const, style: 'normal' as const },
  ].filter(Boolean) as CardFont[]
}

// Config de la carte selon le thème actif : joyeux (Sable Joyeux) ou classique (Sable).
export type CardTheme = ReturnType<typeof cardTheme>
export function cardTheme(theme: 'classic' | 'joyful') {
  if (theme === 'classic') {
    return {
      kind: 'classic' as const,
      bg: '#EAEAEA', card: '#EAEAEA', ink: '#111111', accent: '#7B61FF', muted: '#888888',
      dateBg: 'transparent', display: 'Space Mono', displayWeight: 700 as const, radius: 0, borderW: 2,
      shadow: 'none', qrShadow: 'none', doodles: false, tilt: false, badgeRadius: 0,
    }
  }
  return {
    kind: 'joyful' as const,
    bg: PAPER, card: '#ffffff', ink: INK, accent: VIOLET, muted: MUTED,
    dateBg: LIME, display: 'Baloo 2', displayWeight: 800 as const, radius: 40, borderW: 7,
    shadow: `18px 18px 0 ${INK}`, qrShadow: `8px 8px 0 ${VIOLET}`, doodles: true, tilt: true, badgeRadius: 999,
  }
}

// ── Doodles festifs (SVG rendus par Satori) ──
type DoodleProps = { s: number; c: string; style?: React.CSSProperties }
export function Star({ s, c, style }: DoodleProps) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" style={{ position: 'absolute', ...style }}>
      <path d="M12 1.5l2.9 6.6 7.1.6-5.4 4.7 1.7 7L12 17.7 5.7 20.4l1.7-7L2 8.7l7.1-.6z" fill={c} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}
export function Spark({ s, c, style }: DoodleProps) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" style={{ position: 'absolute', ...style }}>
      <path d="M12 0c1 6.5 5.5 11 12 12-6.5 1-11 5.5-12 12-1-6.5-5.5-11-12-12C6.5 11 11 6.5 12 0z" fill={c} stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}
export function Heart({ s, c, style }: DoodleProps) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" style={{ position: 'absolute', ...style }}>
      <path d="M12 21C12 21 3 14.5 3 8.2 3 5.3 5.2 3.2 8 3.2c1.8 0 3.3 1 4 2.3.7-1.3 2.2-2.3 4-2.3 2.8 0 5 2.1 5 5 0 6.3-9 12.8-9 12.8z" fill={c} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

// Phrase "criée" en gros : chaque lettre inclinée + décalée en hauteur + couleur
// alternée (effet hand-lettering joyeux). Couleurs lisibles sur fond clair.
const SHOUT_COLORS = [INK, VIOLET, MAGENTA, BLUE, INK]
const SHOUT_ROT = [-9, 6, -5, 8, -4, 5, -8, 4, -6, 7]
const SHOUT_OFF = [8, -7, 10, -4, 6, -9, 3, -6, 9, -5]
export function Shout({ text, size, align = 'center' }: { text: string; size: number; align?: 'center' | 'flex-start' }) {
  const sf = size / 70 // décalage vertical proportionnel à la taille
  let k = -1
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: align, width: '100%' }}>
      {[...text].map((ch, i) => {
        if (ch === ' ') return <span key={i} style={{ width: size * 0.32, display: 'flex' }} />
        k++
        return (
          <span
            key={i}
            style={{
              fontFamily: 'Baloo 2', fontWeight: 800, fontSize: size, lineHeight: 1, display: 'flex',
              color: SHOUT_COLORS[k % SHOUT_COLORS.length], padding: '0 1px',
              transform: `rotate(${SHOUT_ROT[k % SHOUT_ROT.length]}deg) translateY(${(SHOUT_OFF[k % SHOUT_OFF.length] * sf).toFixed(1)}px)`,
            }}
          >
            {ch}
          </span>
        )
      })}
    </div>
  )
}
