import { cookies } from 'next/headers'

// Thème opt-in (voir DESIGN.md / PRODUCT.md principe "opt-in, jamais imposé").
// Stocké en cookie → lisible au rendu serveur → zéro flash. Défaut = classique.
export const THEME_COOKIE = 'hbd-theme'
export type Theme = 'classic' | 'joyful'

export async function getTheme(): Promise<Theme> {
  const store = await cookies()
  return store.get(THEME_COOKIE)?.value === 'joyful' ? 'joyful' : 'classic'
}
