import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { currentYear } from '@/lib/edition'
import Nav from '@/components/Nav'

// Teintes festives tournantes par édition (joyeux uniquement ; sans effet en classique).
const YEAR_TINTS = ['tint-violet', 'tint-magenta', 'tint-yellow', 'tint-lime', 'tint-blue']

export default async function YearsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const t = await getTranslations('years')

  const wall = await prisma.wall.findUnique({
    where: { slug },
    include: { user: { select: { name: true } } },
  })
  if (!wall) notFound()

  const editions = await prisma.edition.findMany({
    where: { wallId: wall.id },
    orderBy: { year: 'desc' },
  })

  // Comptes par édition — on ne compte que les messages d'invités (pas le seed plateforme).
  const msgCounts = await prisma.message.groupBy({
    by: ['editionId'],
    where: { wallId: wall.id, isHidden: false, fromPlatform: false, editionId: { not: null } },
    _count: { _all: true },
  })
  const photoMsgs = await prisma.message.findMany({
    where: {
      wallId: wall.id,
      isHidden: false,
      fromPlatform: false,
      editionId: { not: null },
      photoUrl: { not: null },
    },
    select: { editionId: true, photoUrl: true },
    orderBy: { createdAt: 'desc' },
  })

  const countByEdition = new Map<string, number>()
  for (const c of msgCounts) if (c.editionId) countByEdition.set(c.editionId, c._count._all)

  const photoCountByEdition = new Map<string, number>()
  const coverByEdition = new Map<string, string>()
  for (const m of photoMsgs) {
    if (!m.editionId) continue
    photoCountByEdition.set(m.editionId, (photoCountByEdition.get(m.editionId) ?? 0) + 1)
    if (m.photoUrl && !coverByEdition.has(m.editionId)) coverByEdition.set(m.editionId, m.photoUrl)
  }

  const session = await getSession()
  const isOwner = !!session.userId && session.userId === wall.userId
  const thisYear = currentYear()

  return (
    <main data-theme="joyful" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <div style={{ padding: 'var(--s-4) var(--s-6) 0' }}>
        <Link href={`/wall/${slug}`} className="t-label link" style={{ textDecoration: 'none' }}>
          {t('back')}
        </Link>
      </div>

      <header style={{
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
        padding: 'var(--s-16) var(--s-6) var(--s-8)',
      }}>
        <p className="t-label t-muted" style={{ marginBottom: 'var(--s-2)', letterSpacing: 'var(--tracking-label)' }}>
          {isOwner ? t('ownerKicker') : t('guestKicker', { name: wall.user.name })}
        </p>
        <p className="t-body t-muted">{t('editions', { count: editions.length })}</p>
      </header>

      <div style={{
        flex: 1,
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
        padding: '0 var(--s-6) var(--s-16)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--s-6)',
      }}>
        {editions.length === 0 && (
          <p className="t-body t-muted">{t('empty')}</p>
        )}

        {editions.map((e, i) => {
          const count = countByEdition.get(e.id) ?? 0
          const photos = photoCountByEdition.get(e.id) ?? 0
          const cover = coverByEdition.get(e.id)
          const isCurrent = e.year === thisYear
          return (
            <Link
              key={e.id}
              href={`/wall/${slug}?year=${e.year}`}
              className={`years-edition ${YEAR_TINTS[i % YEAR_TINTS.length]}`}
            >
              {cover && (
                <img
                  src={cover}
                  alt=""
                  aria-hidden
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'grayscale(1) contrast(1.05)',
                    opacity: 0.18,
                    pointerEvents: 'none',
                  }}
                />
              )}
              <div style={{ position: 'relative' }}>
                <p
                  className="t-label"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: 'var(--tracking-label)',
                    marginBottom: 'var(--s-3)',
                    display: 'flex',
                    gap: 'var(--s-3)',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <span>{count} {t('messagesLabel')} · {photos} {t('photosLabel')}</span>
                  {isCurrent && (
                    <span style={{
                      color: 'var(--accent-ink)',
                      background: 'var(--accent)',
                      padding: '2px 8px',
                    }}>
                      {t('open')}
                    </span>
                  )}
                </p>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: 'var(--fs-display-xl)',
                  lineHeight: 'var(--leading-display)',
                  letterSpacing: 'var(--tracking-display)',
                }}>
                  {e.year}
                </div>
                <span className="t-small link" style={{ display: 'inline-block', marginTop: 'var(--s-3)' }}>
                  {t('view')} →
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
