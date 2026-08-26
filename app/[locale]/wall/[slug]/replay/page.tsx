import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { buildWallReplayInputProps } from '@/lib/wallReplay'
import Nav from '@/components/Nav'
import WallReplayPreview from '@/components/WallReplayPreview'
import RenderTrigger from '@/components/RenderTrigger'

export default async function WallReplayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await getSession()
  if (!session.userId) redirect('/login')

  const wall = await prisma.wall.findUnique({ where: { slug } })
  if (!wall) notFound()

  const me = await prisma.user.findUnique({ where: { id: session.userId }, select: { isAdmin: true } })
  if (wall.userId !== session.userId && !me?.isAdmin) redirect('/dashboard')

  const [featuredMessages, allMessages, lastRenderJob] = await Promise.all([
    prisma.message.findMany({
      where: { wallId: wall.id, isHidden: false },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      take: 4,
      select: { id: true, authorName: true, content: true, photoUrl: true },
    }),
    prisma.message.findMany({
      where: { wallId: wall.id, isHidden: false },
      select: { authorName: true, content: true, photoUrl: true },
    }),
    prisma.renderJob.findFirst({
      where: { wallId: wall.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, status: true, videoUrl: true, errorMessage: true, finishedAt: true },
    }),
  ])

  const inputProps = buildWallReplayInputProps(wall, featuredMessages, allMessages)
  const t = await getTranslations('wallReplay')

  return (
    <main data-theme="joyful" style={{ minHeight: '100vh' }}>
      <Nav />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--s-8) var(--s-6)' }}>
        <div style={{ marginBottom: 'var(--s-6)' }}>
          <Link href={`/wall/${slug}/admin`} className="t-label t-muted" style={{ textDecoration: 'none', display: 'block', marginBottom: 'var(--s-2)' }}>
            {t('back')}
          </Link>
          <h1 className="t-h2">{t('title')}</h1>
          <p className="t-small t-muted" style={{ marginTop: 'var(--s-2)' }}>{t('subtitle')}</p>
        </div>

        <WallReplayPreview inputProps={inputProps} />

        <div style={{ marginTop: 'var(--s-8)', paddingTop: 'var(--s-6)', borderTop: 'var(--border-w) solid var(--border)', display: 'flex', flexDirection: 'column', gap: 'var(--s-3)', alignItems: 'center', textAlign: 'center' }}>
          <p className="t-small t-muted">{t('exportHint')}</p>
          <RenderTrigger
            wallSlug={slug}
            initialJob={lastRenderJob && { ...lastRenderJob, finishedAt: lastRenderJob.finishedAt?.toISOString() ?? null }}
          />
        </div>
      </div>
    </main>
  )
}
