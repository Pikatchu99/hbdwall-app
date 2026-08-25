// Tokens du thème "Sable Joyeux" (voir app/globals.css [data-theme="joyful"]),
// dupliqués ici en constantes JS : le contexte Chromium headless de Remotion
// ne lit pas les CSS custom properties de l'app.

export const colors = {
  paper: 'oklch(0.97 0.012 300)',
  ink: 'oklch(0.17 0.03 290)',
  muted: 'oklch(0.52 0.035 290)',
  violet: 'oklch(0.60 0.23 295)',
  magenta: 'oklch(0.64 0.26 350)',
  blue: 'oklch(0.60 0.18 250)',
  orange: 'oklch(0.72 0.19 47)',
  yellow: 'oklch(0.90 0.17 100)',
  lime: 'oklch(0.86 0.21 132)',

  tintYellow: 'oklch(0.93 0.09 101)',
  tintLime: 'oklch(0.92 0.11 134)',
  tintViolet: 'oklch(0.91 0.06 300)',
  tintMagenta: 'oklch(0.91 0.07 350)',
  tintBlue: 'oklch(0.92 0.06 245)',
}

export const tints = [colors.tintYellow, colors.tintBlue, colors.tintLime, colors.tintMagenta, colors.tintViolet]

export const line = 3
export const radius = 20
export const shadowSm = `4px 4px 0 ${colors.ink}`
export const shadow = `8px 8px 0 ${colors.ink}`
export const shadowLg = `14px 14px 0 ${colors.ink}`
