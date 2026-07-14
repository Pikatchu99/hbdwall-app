// Données structurées (JSON-LD) de la home : Organization + WebSite + WebApplication + FAQPage.
// Sert le SEO (rich results) et le GEO (les IA "comprennent" l'entité et liftent la FAQ).
// Rendu serveur, injecté sur app/[locale]/page.tsx dans les deux thèmes.
import { getTranslations } from 'next-intl/server'
import { SITE_URL, type Locale } from '@/lib/seo'

type Faq = { q: string; a: string }

export default async function JsonLd({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'seo' })
  const faq = t.raw('faq') as Faq[]
  const url = `${SITE_URL}/${locale}`

  const graph = [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'hbdwall',
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      sameAs: ['https://www.instagram.com/hbdwall', 'https://www.tiktok.com/@hbdwall'],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'hbdwall',
      url: SITE_URL,
      inLanguage: locale,
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'WebApplication',
      name: 'hbdwall',
      url,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web',
      description: t('home.description'),
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faq.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ]

  const data = { '@context': 'https://schema.org', '@graph': graph }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
