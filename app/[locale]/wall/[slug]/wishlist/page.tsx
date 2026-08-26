import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { getCurrentEdition, currentYear } from '@/lib/edition'
import Nav from '@/components/Nav'
import WishlistManager from '@/components/WishlistManager'

export default async function WishlistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await getSession()
  if (!session.userId) redirect('/login')

  const wall = await prisma.wall.findUnique({
    where: { slug },
    include: { user: { select: { name: true, pseudo: true } } },
  })
  if (!wall) notFound()

  const me = await prisma.user.findUnique({ where: { id: session.userId }, select: { isAdmin: true } })
  if (wall.userId !== session.userId && !me?.isAdmin) redirect('/dashboard')

  // find-or-create : le propriétaire gère l'édition de l'année en cours.
  const edition = await getCurrentEdition(wall.id)
  const items = await prisma.wishlistItem.findMany({
    where: { editionId: edition.id },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
  })

  const t = await getTranslations('wishlist')

  return (
    <main data-theme="joyful" style={{ minHeight: '100vh' }}>
      <Nav />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--s-12) var(--s-6)' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', marginBottom: 'var(--s-12)', flexWrap: 'wrap' }}>
          <Link href="/dashboard" className="t-small t-muted link">Dashboard</Link>
          <span className="t-small t-muted">·</span>
          <span className="t-small t-muted">{wall.title}</span>
          <span className="t-small t-muted">·</span>
          <span className="t-small">{t('ownerKicker')}</span>
        </div>

        <p className="t-label t-muted" style={{ marginBottom: 'var(--s-3)', letterSpacing: 'var(--tracking-label)' }}>
          {t('ownerKicker')} · {currentYear()}
        </p>
        <h1 className="t-h1" style={{ marginBottom: 'var(--s-3)' }}>{t('pageTitle')}</h1>
        <p className="t-body t-muted" style={{ marginBottom: 'var(--s-16)', maxWidth: '520px' }}>{t('pageSubtitle')}</p>

        <WishlistManager
          slug={slug}
          ownerName={wall.user.name}
          initialItems={items.map(i => ({ id: i.id, title: i.title, url: i.url, price: i.price }))}
        />
      </div>
    </main>
  )
}
