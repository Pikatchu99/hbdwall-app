import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import Nav from '@/components/Nav'
import AdminUserList from '@/components/AdminUserList'

export default async function AdminUsersPage() {
  const session = await getSession()
  if (!session.userId) redirect('/login')

  const me = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!me?.isAdmin) redirect('/dashboard')

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      pseudo: true,
      email: true,
      tiktokHandle: true,
      instagramHandle: true,
      authProvider: true,
      wantsFeature: true,
      createdAt: true,
      walls: {
        select: {
          id: true,
          slug: true,
          title: true,
          date: true,
          featured: true,
          isActive: true,
          _count: { select: { messages: true } },
        },
      },
    },
  })

  const serialized = users.map(u => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    walls: u.walls.map(w => ({
      ...w,
      date: w.date.toISOString(),
      msgCount: w._count.messages,
    })),
  }))

  return (
    <main style={{ minHeight: '100vh' }}>
      <Nav />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'var(--s-8) var(--s-6)' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--s-8)', paddingBottom: 'var(--s-6)', borderBottom: '1px solid var(--border)' }}>
          <div>
            <p className="t-label t-muted" style={{ marginBottom: 'var(--s-1)' }}>ADMIN</p>
            <h1 className="t-h1">Utilisateurs — {users.length}</h1>
          </div>
          <Link href="/admin" className="btn btn--ghost" style={{ fontSize: '12px' }}>← Retour</Link>
        </div>

        <AdminUserList users={serialized} />

      </div>
    </main>
  )
}
