'use client'
// Bascule de thème avec une SEULE animation : un voile spatial couvre l'écran
// instantanément (zéro flash), on recharge, et la nouvelle page joue le voyage
// dans l'espace à l'arrivée (overlay rendu dès le SSR via le cookie hbd-warp).
// Respecte prefers-reduced-motion (bascule instantanée).

import { track } from '@/lib/analytics'

type Theme = 'classic' | 'joyful'
const YEAR = 60 * 60 * 24 * 365

export function switchTheme(theme: Theme) {
  track('theme-switch', { to: theme })
  document.cookie = `hbd-theme=${theme}; path=/; max-age=${YEAR}; samesite=lax`
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) { location.reload(); return }
  document.cookie = `hbd-warp=${theme}; path=/; max-age=15; samesite=lax`
  // Voile (même fond que l'overlay d'arrivée) → continuité visuelle au reload.
  const cover = document.createElement('div')
  cover.style.cssText = 'position:fixed;inset:0;z-index:9999;background:radial-gradient(circle at 50% 50%,#160e33 0%,#0a0716 70%);transition:opacity .12s'
  document.body.appendChild(cover)
  setTimeout(() => location.reload(), 90)
}
