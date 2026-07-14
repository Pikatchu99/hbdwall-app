export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { createReader } from '@keystatic/core/reader'
import config from '@/keystatic.config'
import LogoMark from '@/components/LogoMark'
import LocaleSwitcher from '@/components/LocaleSwitcher'
import BlogBento from '@/components/landing/BlogBento'

const BASE_URL = 'https://hbdwall.xyz'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blogIndex' })
  const url = `${BASE_URL}/${locale}/blog`
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
    alternates: { canonical: url, languages: { fr: `${BASE_URL}/fr/blog`, en: `${BASE_URL}/en/blog`, 'x-default': `${BASE_URL}/fr/blog` } },
    openGraph: { title: t('metaTitle'), description: t('metaDesc'), type: 'website', url, siteName: 'hbdwall', locale: locale === 'fr' ? 'fr_FR' : 'en_US' },
    twitter: { card: 'summary', title: t('metaTitle'), description: t('metaDesc') },
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  distance: 'À distance',
  collegues: 'Collègues',
  surprises: 'Surprises',
  messages: 'Messages',
  milestones: 'Milestones',
  souvenirs: 'Souvenirs',
}

export default async function BlogPage() {
  const t = await getTranslations('blogIndex')
  const reader = createReader(process.cwd(), config)
  const allPosts = await reader.collections.blog.all()

  const posts = allPosts
    .filter(p => !p.entry.draft)
    .sort((a, b) => {
      const dateA = a.entry.publishedAt ?? ''
      const dateB = b.entry.publishedAt ?? ''
      return dateB.localeCompare(dateA)
    })

  return (
    <main data-theme="joyful" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--fg)' }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--s-4) var(--s-8)',
        borderBottom: '1px solid var(--border)',
      }}>
        <LogoMark />
        <div style={{ display: 'flex', gap: 'var(--s-3)', alignItems: 'center' }}>
          <LocaleSwitcher />
          <Link href="/register" className="btn btn--solid">Créer un mur</Link>
        </div>
      </nav>

      <header className="blog-index-head">
        <div className="blog-index-head-main">
          <p className="blog-index-kicker">{t('kicker')}</p>
          <h1 className="blog-index-title">{t('title')}</h1>
        </div>
        <p className="blog-index-tag">{t('tagline')}</p>
      </header>

      {posts.length === 0 ? (
        <div style={{ padding: 'var(--s-16) var(--s-8)', color: 'var(--fg-muted)' }}>
          <p className="t-body">Aucun article publié pour l'instant.</p>
        </div>
      ) : (
        <div style={{ padding: 'var(--s-8)', flex: 1 }}>
          <BlogBento priority posts={posts.slice(0, 4).map(p => ({ slug: p.slug, title: p.entry.title, excerpt: p.entry.excerpt ?? '', category: p.entry.category ?? '' }))} />
          {posts.length > 4 && (
            <div className="blog-rest" data-theme="joyful">
              {posts.slice(4).map(p => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="bento-cell blog-rest-card">
                  <Image src={`/blog-images/${p.slug}.jpg`} alt="" fill sizes="(max-width:760px) 100vw, 33vw" className="bento-img" />
                  <span className="bento-shade" />
                  <div className="bento-overlay">
                    <span className="bento-cat">{CATEGORY_LABELS[p.entry.category] ?? 'Idées'}</span>
                    <h3 className="bento-title bento-title--sm">{p.entry.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <footer style={{
        padding: 'var(--s-3) var(--s-8)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span className="t-caption t-muted">HBDWALL · {new Date().getFullYear()}</span>
        <Link href="/" className="t-caption t-muted link">← Retour à l'accueil</Link>
      </footer>
    </main>
  )
}
