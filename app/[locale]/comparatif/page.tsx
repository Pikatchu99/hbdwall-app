import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import LogoMark from '@/components/LogoMark'
import LocaleSwitcher from '@/components/LocaleSwitcher'

const BASE_URL = 'https://hbdwall.xyz'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'compare' })
  const url = `${BASE_URL}/${locale}/comparatif`
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
    alternates: { canonical: url, languages: { fr: `${BASE_URL}/fr/comparatif`, en: `${BASE_URL}/en/comparatif`, 'x-default': `${BASE_URL}/fr/comparatif` } },
    openGraph: { title: t('metaTitle'), description: t('metaDesc'), type: 'article', url, siteName: 'hbdwall', locale: locale === 'fr' ? 'fr_FR' : 'en_US' },
  }
}

type Row = { c: string; wall: string; card: string; pot: string }

export default async function ComparePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'compare' })
  const th = t.raw('th') as Row
  const rows = t.raw('rows') as Row[]

  return (
    <main data-theme="joyful" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--fg)' }}>
      <nav className="compare-nav">
        <Link href="/" aria-label="hbdwall"><LogoMark /></Link>
        <div style={{ display: 'flex', gap: 'var(--s-3)', alignItems: 'center' }}>
          <LocaleSwitcher />
          <Link href="/register" className="btn btn--solid">{t('create')}</Link>
        </div>
      </nav>

      <article className="compare">
        <header className="compare-head">
          <p className="compare-kicker">{t('kicker')}</p>
          <h1 className="compare-h1">{t('h1')}</h1>
          <p className="compare-intro">{t('intro')}</p>
        </header>

        <h2 className="compare-tabletitle">{t('tableTitle')}</h2>
        <div className="compare-tablewrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th>{th.c}</th>
                <th className="is-wall">{th.wall}</th>
                <th>{th.card}</th>
                <th>{th.pot}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <th scope="row">{r.c}</th>
                  <td className="is-wall">{r.wall}</td>
                  <td>{r.card}</td>
                  <td>{r.pot}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="compare-sections">
          <section><h2>{t('s1Title')}</h2><p>{t('s1Body')}</p></section>
          <section><h2>{t('s2Title')}</h2><p>{t('s2Body')}</p></section>
          <section><h2>{t('s3Title')}</h2><p>{t('s3Body')}</p></section>
        </div>

        <div className="compare-verdict">
          <h2 className="compare-verdict-title">{t('verdictTitle')}</h2>
          <p className="compare-verdict-body">{t('verdictBody')}</p>
          <Link href="/register" className="compare-cta">{t('cta')}</Link>
        </div>
      </article>

      <footer className="compare-foot">
        <span>hbdwall · {new Date().getFullYear()}</span>
        <Link href="/" className="link">{locale === 'fr' ? '← Accueil' : '← Home'}</Link>
      </footer>
    </main>
  )
}
