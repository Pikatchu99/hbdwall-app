export const dynamic = 'force-dynamic'

import type { MetadataRoute } from 'next'
import { createReader } from '@keystatic/core/reader'
import config from '@/keystatic.config'

const BASE_URL = 'https://hbdwall.xyz'
const LOCALES = ['fr', 'en'] as const

function languagesFor(path: string) {
  return {
    fr: `${BASE_URL}/fr${path}`,
    en: `${BASE_URL}/en${path}`,
    'x-default': `${BASE_URL}/fr${path}`,
  }
}

// Une entrée par locale (URLs préfixées /fr, /en) + alternates hreflang.
// `path` avec slash initial pour les sous-pages, '' pour la home.
function localizedEntries(
  path: string,
  opts: { changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number; lastModified?: Date },
): MetadataRoute.Sitemap {
  return LOCALES.map(loc => ({
    url: `${BASE_URL}/${loc}${path}`,
    lastModified: opts.lastModified ?? new Date(),
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
    alternates: { languages: languagesFor(path) },
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls: MetadataRoute.Sitemap = [
    ...localizedEntries('', { changeFrequency: 'weekly', priority: 1 }),
    ...localizedEntries('/blog', { changeFrequency: 'weekly', priority: 0.9 }),
    ...localizedEntries('/comparatif', { changeFrequency: 'monthly', priority: 0.7 }),
    ...localizedEntries('/cgu', { changeFrequency: 'yearly', priority: 0.3 }),
    ...localizedEntries('/privacy', { changeFrequency: 'yearly', priority: 0.3 }),
  ]

  try {
    const reader = createReader(process.cwd(), config)
    const posts = await reader.collections.blog.all()

    const blogUrls = posts
      .filter(p => !p.entry.draft)
      .flatMap(post =>
        localizedEntries(`/blog/${post.slug}`, {
          changeFrequency: 'monthly',
          priority: 0.8,
          lastModified: post.entry.publishedAt ? new Date(post.entry.publishedAt) : new Date(),
        }),
      )

    return [...staticUrls, ...blogUrls]
  } catch {
    return staticUrls
  }
}
