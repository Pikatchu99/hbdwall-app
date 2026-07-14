import { getTranslations } from 'next-intl/server'

// Section définition « C'est quoi un mur d'anniversaire en ligne ? ».
// On-page SEO (h2 + corps mots-clés des 4 clusters) + GEO (définition nette liftable).
// Sur les 2 landings, tokenisée → s'adapte aux thèmes.
export default async function WhatIsSection() {
  const t = await getTranslations('whatIs')
  return (
    <section className="whatis-sec" aria-labelledby="whatis-title">
      <p className="whatis-kicker">{t('kicker')}</p>
      <h2 id="whatis-title" className="whatis-title">{t('title')}</h2>
      <p className="whatis-p">{t('p1')}</p>
      <p className="whatis-p">{t('p2')}</p>
    </section>
  )
}
