import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import Nav from '@/components/Nav'

export default async function AdminMessagesPage() {
  const session = await getSession()
  if (!session.userId) redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user?.isAdmin) redirect('/dashboard')

  const messages = await prisma.message.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      wall: { select: { slug: true, title: true, user: { select: { pseudo: true } } } },
    },
  })

  return (
    <main style={{ minHeight: '100vh' }}>
      <Nav />
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'var(--s-8) var(--s-4)' }}>

        <div style={{ marginBottom: 'var(--s-8)', paddingBottom: 'var(--s-6)', borderBottom: '1px solid var(--border)' }}>
          <Link href="/admin" className="t-label t-muted" style={{ textDecoration: 'none', display: 'block', marginBottom: 'var(--s-3)' }}>
            ← ADMIN
          </Link>
          <h1 className="t-h1">Messages récents</h1>
          <p className="t-caption t-muted" style={{ marginTop: 'var(--s-2)' }}>{messages.length} messages</p>
        </div>

        <div style={{ border: '1px solid var(--border)' }}>
          {messages.map((m, i) => (
            <div key={m.id} style={{
              padding: 'var(--s-4)',
              borderBottom: i < messages.length - 1 ? '1px solid var(--border)' : 'none',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 'var(--s-4)',
              alignItems: 'start',
            }}>
              <div>
                <p className="t-small" style={{ marginBottom: 'var(--s-2)' }}>{m.content}</p>
                <p className="t-caption t-muted">
                  {m.authorName || 'Anonyme'} · @{m.wall.user.pseudo} ·{' '}
                  {new Date(m.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <Link href={`/wall/${m.wall.slug}`} className="btn btn--ghost" style={{ fontSize: '10px', padding: 'var(--s-1) var(--s-2)', flexShrink: 0 }}>
                {m.wall.title} →
              </Link>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}
