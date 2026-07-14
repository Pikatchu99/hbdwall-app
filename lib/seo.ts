// Helpers SEO partagés : URL du site + alternates hreflang/canonical.
// Les URLs sont préfixées par locale (/fr, /en) — la racine et les chemins bare
// redirigent vers /fr (vérifié). Canonical = la version préfixée de la locale courante.

export const SITE_URL = 'https://hbdwall.xyz'
export const LOCALES = ['fr', 'en'] as const
export type Locale = (typeof LOCALES)[number]

const OG_LOCALE: Record<Locale, string> = { fr: 'fr_FR', en: 'en_US' }
export const ogLocale = (locale: Locale) => OG_LOCALE[locale]

// `path` sans locale ni slash initial. '' = home, 'blog' = /{locale}/blog, etc.
export function localizedAlternates(locale: Locale, path = '') {
  const suffix = path ? `/${path}` : ''
  return {
    canonical: `${SITE_URL}/${locale}${suffix}`,
    languages: {
      fr: `${SITE_URL}/fr${suffix}`,
      en: `${SITE_URL}/en${suffix}`,
      'x-default': `${SITE_URL}/fr${suffix}`,
    },
  }
}
