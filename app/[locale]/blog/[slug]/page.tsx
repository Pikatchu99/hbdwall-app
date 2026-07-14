export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { createReader } from '@keystatic/core/reader'
import { DocumentRenderer } from '@keystatic/core/renderer'
import config from '@/keystatic.config'
import LogoMark from '@/components/LogoMark'

const CATEGORY_LABELS: Record<string, string> = {
  distance: 'À distance',
  collegues: 'Collègues',
  surprises: 'Surprises',
  messages: 'Messages',
  milestones: 'Milestones',
  souvenirs: 'Souvenirs',
}

type Props = { params: Promise<{ slug: string; locale: string }> }

const BASE_URL = 'https://hbdwall.xyz'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params
  const reader = createReader(process.cwd(), config)
  const post = await reader.collections.blog.read(slug)
  if (!post) return {}

  const url = `${BASE_URL}/${locale}/blog/${slug}`
  const ogImage = `${BASE_URL}/blog-images/${slug}.jpg`

  return {
    title: `${post.title} | hbdwall`,
    description: post.description,
    alternates: {
      canonical: url,
      languages: {
        fr: `${BASE_URL}/fr/blog/${slug}`,
        en: `${BASE_URL}/en/blog/${slug}`,
        'x-default': `${BASE_URL}/fr/blog/${slug}`,
      },
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url,
      siteName: 'hbdwall',
      publishedTime: post.publishedAt ?? undefined,
      authors: ['hbdwall'],
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  }
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug, locale } = await params
  const t = await getTranslations({ locale, namespace: 'article' })
  const reader = createReader(process.cwd(), config)
  const post = await reader.collections.blog.read(slug)

  if (!post || post.draft) notFound()

  const content = await post.content()
  const related = (await reader.collections.blog.all())
    .filter(p => p.slug !== slug && !p.entry.draft)
    .slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt ?? undefined,
    url: `${BASE_URL}/${locale}/blog/${slug}`,
    inLanguage: locale === 'fr' ? 'fr-FR' : 'en-US',
    author: {
      '@type': 'Organization',
      name: 'hbdwall',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'hbdwall',
      url: BASE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/${locale}/blog/${slug}`,
    },
  }

  return (
    <main data-theme="joyful" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--fg)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--s-4) var(--s-8)',
        borderBottom: '1px solid var(--border)',
      }}>
        <LogoMark />
        <div style={{ display: 'flex', gap: 'var(--s-3)', alignItems: 'center' }}>
          <Link href="/blog" className="t-caption t-muted link">{t('back')}</Link>
          <Link href="/register" className="btn btn--solid">{t('create')}</Link>
        </div>
      </nav>

      <article className="article">
        <div className="article-hero">
          <Image src={`/blog-images/${slug}.jpg`} alt={post.title} fill priority sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'center' }} />
        </div>

        <div className="article-grid">
          <div className="article-main">
            <header className="article-head">
              <div className="article-meta">
                <span className="article-cat">{CATEGORY_LABELS[post.category] ?? post.category}</span>
                {post.publishedAt && (
                  <span className="article-date">
                    {new Date(post.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                )}
              </div>
              <h1 className="article-title">{post.title}</h1>
              <p className="article-lead">{post.excerpt}</p>
            </header>

            <div className="blog-content">
              <DocumentRenderer document={content} />
            </div>
          </div>

          <aside className="article-side">
            <div className="article-cta">
              <p className="article-cta-title">{t('ctaTitle')}</p>
              <p className="article-cta-body">{t('ctaBody')}</p>
              <Link href="/register" className="article-cta-btn">{t('ctaBtn')}</Link>
            </div>
            {related.length > 0 && (
              <div className="article-related">
                <p className="article-related-title">{t('related')}</p>
                {related.map(r => (
                  <Link key={r.slug} href={`/blog/${r.slug}`} className="article-related-item">
                    <Image src={`/blog-images/${r.slug}.jpg`} alt="" width={96} height={68} className="article-related-img" />
                    <span className="article-related-name">{r.entry.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </aside>
        </div>
      </article>

      <footer style={{
        padding: 'var(--s-3) var(--s-8)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span className="t-caption t-muted">HBDWALL · {new Date().getFullYear()}</span>
        <Link href="/blog" className="t-caption t-muted link">{t('allArticles')}</Link>
      </footer>

      <style>{`
        .blog-content h2 {
          font-family: var(--font-display);
          font-weight: 900;
          font-size: var(--fs-h2);
          line-height: 1.1;
          margin-top: var(--s-12);
          margin-bottom: var(--s-4);
          letter-spacing: var(--tracking-display);
        }
        .blog-content h3 {
          font-family: var(--font-display);
          font-weight: 900;
          font-size: var(--fs-h3);
          line-height: 1.2;
          margin-top: var(--s-8);
          margin-bottom: var(--s-3);
          letter-spacing: var(--tracking-display);
        }
        .blog-content p {
          font-size: var(--fs-body);
          line-height: 1.8;
          margin-bottom: var(--s-4);
          color: var(--fg);
        }
        .blog-content ul, .blog-content ol {
          padding-left: var(--s-6);
          margin-bottom: var(--s-4);
        }
        .blog-content li {
          font-size: var(--fs-body);
          line-height: 1.7;
          margin-bottom: var(--s-2);
        }
        .blog-content strong {
          font-weight: 700;
        }
        .blog-content em {
          font-style: italic;
          color: var(--fg-muted);
        }
        .blog-content a {
          color: var(--accent);
          text-underline-offset: 3px;
        }
        .blog-content hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: var(--s-8) 0;
        }
        .blog-content blockquote {
          border-left: 3px solid var(--fg);
          padding-left: var(--s-6);
          margin: var(--s-6) 0;
          color: var(--fg-muted);
          font-style: italic;
        }
        .blog-content img {
          width: 100%;
          height: auto;
          margin: var(--s-6) 0;
        }
        @media (max-width: 640px) {
          .blog-content h2 { font-size: var(--fs-h3); margin-top: var(--s-8); }
          .blog-content p { font-size: var(--fs-small); }
        }
      `}</style>
    </main>
  )
}
