import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { findEdition, currentYear } from '@/lib/edition'
import WallClient from '@/components/WallClient'
import WishlistButton from '@/components/WishlistButton'
import Avatar from '@/components/Avatar'
import BirthdayCountdown from '@/components/BirthdayCountdown'
import InstagramCard from '@/components/InstagramCard'

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params
  const wall = await prisma.wall.findUnique({
    where: { slug },
    include: { user: { select: { pseudo: true, name: true } } },
  })
  if (!wall) return {}
  const pseudo = wall.user.pseudo
  const name = wall.user.name
  const isFr = locale === 'fr'
  const title = `@${pseudo}'s birthday`
  const description = isFr
    ? `Laisse un mot à ${name} pour son anniversaire. Ça prend 30 secondes.`
    : `Leave a note for ${name}'s birthday. Takes 30 seconds.`
  return {
    title,
    description,
    openGraph: { title: `@${pseudo}'s birthday - ${wall.title}`, description, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function WallPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ year?: string }>
}) {
  const { slug } = await params
  const { year: yearParam } = await searchParams
  const t = await getTranslations('wall')

  const wall = await prisma.wall.findUnique({
    where: { slug },
    include: {
      user: { select: { name: true, pseudo: true, image: true } },
      instagramPost: { select: { url: true } },
    },
  })
  if (!wall) notFound()

  // Quelle édition consulte-t-on ? ?year= ou, par défaut, l'année en cours.
  const viewingYear = yearParam ? parseInt(yearParam, 10) : currentYear()
  const isCurrentYear = viewingYear === currentYear()
  const edition = await findEdition(wall.id, viewingYear)

  // Messages de l'édition consultée. Sur l'année en cours, on inclut aussi les
  // messages orphelins (editionId null) par sécurité, si le backfill n'a pas tourné.
  const wallMessages = (isCurrentYear || edition)
    ? await prisma.message.findMany({
        where: {
          wallId: wall.id,
          isHidden: false,
          OR: [
            ...(edition ? [{ editionId: edition.id }] : []),
            ...(isCurrentYear ? [{ editionId: null }] : []),
          ],
        },
        orderBy: [
          { fromPlatform: 'desc' },
          { isPinned: 'desc' },
          { pinnedAt: 'desc' },
          { createdAt: 'desc' },
        ],
      })
    : []

  // Wishlist de l'édition consultée (chaque édition a la sienne).
  const wishlistItems = edition
    ? await prisma.wishlistItem.findMany({
        where: { editionId: edition.id },
        orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      })
    : []

  const session = await getSession()
  let isAdmin = false
  if (session.userId) {
    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { isAdmin: true } })
    isAdmin = user?.isAdmin ?? false
  }
  const isOwner = !!session.userId && session.userId === wall.userId

  const messages = wallMessages.map(m => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
    pinnedAt: m.pinnedAt?.toISOString() ?? null,
  }))

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--s-4) var(--s-6)',
        borderBottom: 'var(--border-w) solid var(--border)',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span className="t-label">BIRTHDAYWALL</span>
        </Link>
        <Link href={`/register?from=${slug}`} className="btn btn--ghost" style={{ fontSize: '10px' }}>
          {t('createMine')}
        </Link>
      </nav>

      {!isCurrentYear && (
        <div style={{
          maxWidth: '780px',
          margin: '0 auto',
          width: '100%',
          padding: 'var(--s-4) var(--s-6)',
          borderBottom: 'var(--border-w) solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--s-4)',
          flexWrap: 'wrap',
        }}>
          <p className="t-small">{t('archiveBanner', { year: viewingYear })}</p>
          <Link href={`/wall/${slug}`} className="t-small link">{t('backToCurrent')}</Link>
        </div>
      )}

      <div style={{
        padding: 'var(--s-16) var(--s-6) var(--s-8)',
        borderBottom: 'var(--border-w) solid var(--border)',
        maxWidth: '780px',
        margin: '0 auto',
        width: '100%',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--s-4)', marginBottom: 'var(--s-4)', flexWrap: 'wrap' }}>
          <p className="t-label t-muted" style={{ margin: 0 }}>
            {new Date(wall.date).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'long',
            })}
          </p>
          <WishlistButton
            ownerName={wall.user.name}
            items={wishlistItems.map(i => ({ id: i.id, title: i.title, url: i.url, price: i.price }))}
          />
        </div>
        <BirthdayCountdown date={wall.date.toISOString()} name={wall.user.name} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', marginBottom: 'var(--s-3)', flexWrap: 'wrap' }}>
          <Avatar name={wall.user.pseudo} src={wall.user.image} size={64} />
          <h1 className="t-h1">@{wall.user.pseudo}'s birthday</h1>
        </div>

        <p className="t-body t-muted">
          {wall.description || t('leaveMessage')}
        </p>

        {wall.instagramPost?.url && (
          <div style={{ marginTop: 'var(--s-6)' }}>
            <InstagramCard postUrl={wall.instagramPost.url} />
          </div>
        )}
      </div>

      <div style={{ flex: 1, maxWidth: '780px', margin: '0 auto', width: '100%', padding: 'var(--s-8) var(--s-6)' }}>
        <WallClient
          wallSlug={slug}
          initialMessages={messages}
          ownerName={wall.user.name}
          isAdmin={isAdmin}
          isOwner={isOwner}
          instagramPostUrl={wall.instagramPost?.url}
        />
      </div>

      <footer className="wall-footer" style={{
        borderTop: 'var(--border-w) solid var(--fg)',
        padding: 'var(--s-8) var(--s-6)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 'var(--s-4)',
      }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--fs-h3)', lineHeight: 1.15, marginBottom: 'var(--s-2)' }}>{t('footerTitle')}</p>
          <p className="t-small t-muted">{t('footerSubtitle')}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--s-3)', flexShrink: 0 }}>
          <Link href={`/register?from=${slug}`} className="btn btn--solid">{t('footerCta')}</Link>
          <div style={{ display: 'flex', gap: 'var(--s-4)', alignItems: 'center' }}>
            <Link href="/cgu" className="t-caption t-muted link">CGU</Link>
            <Link href="/privacy" className="t-caption t-muted link">Confidentialité</Link>
            <a href="https://www.instagram.com/hbdwall" target="_blank" rel="noopener noreferrer" className="t-caption t-muted link" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
              Instagram
            </a>
            <a href="https://www.tiktok.com/@hbdwall" target="_blank" rel="noopener noreferrer" className="t-caption t-muted link" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <img src="/vecteezy_tiktok-logo-icon_21495942.png" alt="TikTok" width={16} height={16} style={{ flexShrink: 0, borderRadius: '50%' }} />
              TikTok
            </a>
          </div>
        </div>
      </footer>

    </main>
  )
}
