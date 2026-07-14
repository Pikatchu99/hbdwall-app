import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Gift } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { findEdition, currentYear } from '@/lib/edition'
import Nav from '@/components/Nav'
import ShareBlock from '@/components/ShareBlock'
import DescriptionEditor from '@/components/DescriptionEditor'
import DeleteWallButton from '@/components/DeleteWallButton'
import FeatureToggle from '@/components/FeatureToggle'
import PushNotifToggle from '@/components/PushNotifToggle'
import LinkGoogleBanner from '@/components/LinkGoogleBanner'
import WhatsNewModal from '@/components/WhatsNewModal'
import ShareCard from '@/components/ShareCard'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session.userId) redirect('/login')

  const me = await prisma.user.findUnique({ where: { id: session.userId }, select: { isAdmin: true, wantsFeature: true, name: true, email: true, authProvider: true } })
  if (me?.isAdmin) redirect('/admin')

  const walls = await prisma.wall.findMany({
    where: { userId: session.userId },
    include: { _count: { select: { messages: true } } },
    orderBy: { createdAt: 'asc' },
  })

  if (walls.length === 0) redirect('/create')

  const primary = walls[0]
  const others = walls.slice(1)
  const t = await getTranslations('dashboard')

  // Wishlist du wall principal, édition courante.
  const primaryEdition = await findEdition(primary.id, currentYear())
  const wishlistItems = primaryEdition
    ? await prisma.wishlistItem.findMany({
        where: { editionId: primaryEdition.id },
        orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      })
    : []
  const editionCount = await prisma.edition.count({ where: { wallId: primary.id } })

  return (
    <main style={{ minHeight: '100vh' }}>
      <Nav />

      {me?.authProvider === 'pin' && <LinkGoogleBanner />}
      <WhatsNewModal />

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: 'var(--s-12) var(--s-4)' }}>

        <p className="t-label t-muted" style={{ marginBottom: 'var(--s-2)' }}>{t('yourWall')}</p>
        <h1 className="t-h1" style={{ marginBottom: 'var(--s-1)' }}>{primary.title}</h1>
        <p className="t-small t-muted" style={{ marginBottom: 'var(--s-2)' }}>
          {new Date(primary.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <div style={{ marginBottom: 'var(--s-12)' }}>
          <DescriptionEditor slug={primary.slug} initial={primary.description ?? null} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--s-4)', marginBottom: 'var(--s-8)' }}>
          <Link href="/settings" className="t-small t-muted link">{t('settings')}</Link>
          <Link href="/nouveautes" className="t-small t-muted link">{t('whatsNew')}</Link>
        </div>

        <div className="dash-grid" style={{ marginBottom: 'var(--s-12)' }}>
          {/* Colonne principale : partage + stats/actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-8)' }}>
            <ShareCard slug={primary.slug} />
          </div>

          {/* Colonne secondaire : stats/actions + wishlist + toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--s-3)', marginBottom: 'var(--s-6)', paddingBottom: 'var(--s-6)', borderBottom: 'var(--border-w) solid var(--border)' }}>
                <span className="t-h1">{primary._count.messages}</span>
                <span className="t-body t-muted">
                  {primary._count.messages !== 1 ? t('messagesPlural') : t('messagesSingular')}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 'var(--s-3)', flexWrap: 'wrap' }}>
                <Link href={`/wall/${primary.slug}/admin`} className="btn btn--solid">
                  {t('manageMessages')}
                </Link>
                <Link href={`/wall/${primary.slug}/collage`} className="btn btn--ghost">
                  {t('generateCollage')}
                </Link>
                {editionCount > 1 && (
                  <Link href={`/wall/${primary.slug}/years`} className="btn btn--ghost">
                    {t('pastEditions')}
                  </Link>
                )}
              </div>
            </div>

            <Link
              href={`/wall/${primary.slug}/wishlist`}
              className="card tint-yellow"
              style={{ display: 'block', textDecoration: 'none', color: 'var(--fg)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--s-4)' }}>
                <div>
                  <p className="t-label" style={{ marginBottom: 'var(--s-2)', display: 'flex', alignItems: 'center', gap: 'var(--s-2)' }}>
                    <Gift size={14} aria-hidden /> {t('wishlistLabel')}
                  </p>
                  <p className="t-small t-muted">
                    {wishlistItems.length > 0
                      ? `${t('wishlistCount', { count: wishlistItems.length })} · ${t('wishlistSeenBy')}`
                      : t('wishlistHint')}
                  </p>
                </div>
                <span className="t-small link" style={{ flexShrink: 0 }}>{t('wishlistManage')}</span>
              </div>
            </Link>

            <PushNotifToggle hideWhenActive />
            <FeatureToggle />
          </div>
        </div>

        {others.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--s-8)', marginBottom: 'var(--s-6)' }}>
            <p className="t-label t-muted" style={{ marginBottom: 'var(--s-4)' }}>{t('otherWalls')}</p>
            {others.map(w => (
              <div key={w.id} style={{ padding: 'var(--s-3) 0', borderBottom: '1px solid var(--border)' }}>
                <div className="wall-row" style={{ marginBottom: 'var(--s-2)' }}>
                  <div>
                    <span className="t-body">{w.title}</span>
                    <span className="t-caption t-muted" style={{ marginLeft: 'var(--s-3)' }}>{w._count.messages} msg</span>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
                    <Link href={`/wall/${w.slug}/admin`} className="btn btn--ghost">{t('manage')}</Link>
                    <DeleteWallButton slug={w.slug} />
                  </div>
                </div>
                <ShareBlock slug={w.slug} recipientName={w.recipientName} date={w.date.toISOString()} isOwn={false} />
              </div>
            ))}
          </div>
        )}

        <div style={{ paddingTop: 'var(--s-4)', borderTop: '1px solid var(--border)' }}>
          <Link href="/create" className="btn btn--ghost" style={{ textAlign: 'center', width: '100%' }}>{t('createAnother')}</Link>
        </div>

      </div>
    </main>
  )
}
