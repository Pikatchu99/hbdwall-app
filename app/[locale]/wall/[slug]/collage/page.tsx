import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import Nav from '@/components/Nav'
import CollageCanvas from '@/components/CollageCanvas'

export default async function CollagePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ type?: string }>
}) {
  const { slug } = await params
  const { type } = await searchParams
  const [t, session] = await Promise.all([getTranslations('collage'), getSession()])

  const wall = await prisma.wall.findUnique({
    where: { slug },
    include: {
      user: { select: { name: true, pseudo: true } },
      messages: { where: { isHidden: false }, orderBy: { createdAt: 'asc' } },
    },
  })
  if (!wall) notFound()

  const colType = type === 'images' || type === 'mixed' ? type : 'words'

  const messages = wall.messages.map(m => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }))

  return (
    <main data-theme="joyful" style={{ minHeight: '100vh' }}>
      <Nav />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--s-8)' }}>
        <div style={{ marginBottom: 'var(--s-8)' }}>
          <Link href={`/wall/${slug}/admin`} className="t-label t-muted" style={{ textDecoration: 'none', display: 'block', marginBottom: 'var(--s-2)' }}>
            {t('back')}
          </Link>
          <h1 className="t-h2" style={{ wordBreak: 'break-word' }}>{wall.title}</h1>
        </div>

        <CollageCanvas
          messages={messages}
          wallTitle={wall.title}
          ownerName={`@${wall.user.pseudo}`}
          recipientName={wall.recipientName ?? wall.user.name}
          isOwn={session.userId === wall.userId}
          defaultType={colType as 'words' | 'images' | 'mixed'}
        />
      </div>
    </main>
  )
}
