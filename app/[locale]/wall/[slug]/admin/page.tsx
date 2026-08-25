import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import Nav from '@/components/Nav'
import AdminClient from '@/components/AdminClient'
import RenderTrigger from '@/components/RenderTrigger'

export default async function AdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await getSession()
  if (!session.userId) redirect('/login')

  const wall = await prisma.wall.findUnique({
    where: { slug },
    include: {
      user: { select: { name: true, pseudo: true } },
      messages: {
        orderBy: [
          { fromPlatform: 'desc' },
          { isPinned: 'desc' },
          { pinnedAt: 'desc' },
          { createdAt: 'desc' },
        ],
      },
    },
  })
  if (!wall) notFound()

  const me = await prisma.user.findUnique({ where: { id: session.userId }, select: { isAdmin: true } })
  if (wall.userId !== session.userId && !me?.isAdmin) redirect('/dashboard')

  const messages = wall.messages.map(m => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
    pinnedAt: m.pinnedAt?.toISOString() ?? null,
    hiddenAt: m.hiddenAt?.toISOString() ?? null,
  }))
  const guestMessageCount = messages.filter(m => !m.fromPlatform).length

  const t = await getTranslations('wallAdmin')

  return (
    <main style={{ minHeight: '100vh' }}>
      <Nav />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--s-8) var(--s-4)' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', marginBottom: 'var(--s-8)' }}>
          <Link href="/dashboard" className="t-small t-muted link">Dashboard</Link>
          <span className="t-small t-muted">·</span>
          <span className="t-small t-muted">{wall.title}</span>
          <span className="t-small t-muted">·</span>
          <span className="t-small">{t('breadcrumbMessages')}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--s-8)', paddingBottom: 'var(--s-6)', borderBottom: 'var(--border-w) solid var(--border)' }}>
          <div>
            <h1 className="t-h2" style={{ marginBottom: 'var(--s-1)' }}>{t('title')}</h1>
            <p className="t-small t-muted">{guestMessageCount} message{guestMessageCount > 1 ? 's' : ''} · {wall.title} · du plus récent au plus ancien</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--s-3)', alignItems: 'flex-start' }}>
            <Link href={`/wall/${slug}/collage`} className="btn btn--solid">{t('collageLink')}</Link>
            <RenderTrigger wallSlug={slug} />
          </div>
        </div>

        <AdminClient wallSlug={slug} initialMessages={messages} canManagePlatform={me?.isAdmin ?? false} />

      </div>
    </main>
  )
}
