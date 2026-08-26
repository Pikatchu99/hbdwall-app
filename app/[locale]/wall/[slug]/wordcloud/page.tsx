import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { buildWordCloud } from '@/lib/wordCloud'
import Nav from '@/components/Nav'
import WordCloudCanvas from '@/components/WordCloudCanvas'

export default async function WordCloudPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await getSession()
  if (!session.userId) redirect('/login')

  const wall = await prisma.wall.findUnique({
    where: { slug },
    include: { messages: { where: { isHidden: false }, select: { content: true } } },
  })
  if (!wall) notFound()

  const me = await prisma.user.findUnique({ where: { id: session.userId }, select: { isAdmin: true } })
  if (wall.userId !== session.userId && !me?.isAdmin) redirect('/dashboard')

  const words = buildWordCloud(wall.messages.map(m => m.content))
  const t = await getTranslations('wordcloud')

  return (
    <main style={{ minHeight: '100vh' }}>
      <Nav />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--s-8)' }}>
        <div style={{ marginBottom: 'var(--s-8)' }}>
          <Link href={`/wall/${slug}/admin`} className="t-label t-muted" style={{ textDecoration: 'none', display: 'block', marginBottom: 'var(--s-2)' }}>
            {t('back')}
          </Link>
          <h1 className="t-h2">{t('title')}</h1>
        </div>

        <WordCloudCanvas
          words={words}
          recipientName={wall.recipientName ?? wall.title}
        />
      </div>
    </main>
  )
}
