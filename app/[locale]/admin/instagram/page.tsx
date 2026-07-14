import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import Nav from '@/components/Nav'
import InstagramCRUD from '@/components/InstagramCRUD'

export default async function AdminInstagramPage() {
  const session = await getSession()
  if (!session.userId) redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user?.isAdmin) redirect('/dashboard')

  const today = new Date()
  const todayMonth = today.getMonth() + 1
  const todayDay = today.getDate()

  const [posts, walls] = await Promise.all([
    prisma.instagramPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: { walls: { select: { slug: true, title: true, user: { select: { pseudo: true, name: true } } } } },
    }),
    prisma.wall.findMany({
      orderBy: { date: 'asc' },
      include: { user: { select: { pseudo: true, name: true } } },
    }),
  ])

  const allWalls = walls.map(w => {
    const d = new Date(w.date)
    const next = new Date(today.getFullYear(), d.getMonth(), d.getDate())
    if (next < today) next.setFullYear(today.getFullYear() + 1)
    const daysUntil = Math.floor((next.getTime() - today.getTime()) / 86400000)
    return {
      slug: w.slug,
      pseudo: w.user.pseudo,
      name: w.user.name,
      isToday: daysUntil === 0,
      daysUntil,
    }
  }).sort((a, b) => a.daysUntil - b.daysUntil)

  const serializedPosts = posts.map(p => ({ ...p, createdAt: p.createdAt.toISOString() }))

  return (
    <main style={{ minHeight: '100vh' }}>
      <Nav />
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: 'var(--s-12) var(--s-6)' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-4)', marginBottom: 'var(--s-10)', paddingBottom: 'var(--s-6)', borderBottom: '1px solid var(--border)' }}>
          <Link href="/admin" className="t-small t-muted link">← Admin</Link>
          <div>
            <p className="t-label t-muted">INSTAGRAM</p>
            <h1 className="t-h1">Posts</h1>
          </div>
        </div>

        <InstagramCRUD initialPosts={serializedPosts} allWalls={allWalls} />

      </div>
    </main>
  )
}
