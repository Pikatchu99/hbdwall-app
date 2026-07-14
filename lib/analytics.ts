declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, unknown>) => void }
  }
}

// Propriétés ambiantes attachées à TOUS les events, pour rendre chaque mesure
// segmentable sans threader la locale partout. La locale vient du 1er segment de
// path (next-intl localePrefix 'always' → /fr/… ou /en/…).
function ambientProps(): Record<string, unknown> {
  const seg = window.location.pathname.split('/')[1]
  const locale = seg === 'en' || seg === 'fr' ? seg : 'fr'
  const isMobile = window.matchMedia?.('(max-width: 768px)')?.matches ?? window.innerWidth < 768
  return { locale, isMobile }
}

export function track(event: string, data?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  if (window.location.hostname === 'localhost') return
  // `data` en dernier : un appel peut toujours surcharger une prop ambiante.
  window.umami?.track(event, { ...ambientProps(), ...data })
}
