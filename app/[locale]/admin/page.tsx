import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import Nav from '@/components/Nav'
import AdminWallRow from '@/components/AdminWallRow'
import AdminFilters from '@/components/AdminFilters'
import AdminWallCard from '@/components/AdminWallCard'


type Wall = Awaited<ReturnType<typeof fetchWalls>>[number]

async function fetchWalls() {
  return prisma.wall.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { pseudo: true, name: true, wantsFeature: true } },
      _count: { select: { messages: true } },
    },
  })
}

function dayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0)
  return Math.floor((date.getTime() - start.getTime()) / 86400000)
}

function birthdayDaysUntil(wall: Wall): number {
  const today = new Date()
  const bday = new Date(wall.date)
  const next = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())
  if (next < today) next.setFullYear(today.getFullYear() + 1)
  return Math.floor((next.getTime() - today.getTime()) / 86400000)
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; month?: string; day?: string; sort?: string; view?: string; display?: string }>
}) {
  const session = await getSession()
  if (!session.userId) redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user?.isAdmin) redirect('/dashboard')

  const t = await getTranslations('adminDashboard')
  const { q, month, day, sort = 'recent', view = '', display = 'list' } = await searchParams

  const today = new Date()
  const todayMonth = today.getMonth() + 1
  const todayDay = today.getDate()

  const [totalUsers, totalWalls, totalMessages, totalPushSubs, allWalls] = await Promise.all([
    prisma.user.count(),
    prisma.wall.count(),
    prisma.message.count(),
    prisma.pushSubscription.count(),
    fetchWalls(),
  ])

  // Today's birthdays
  const birthdayToday = allWalls.filter(w => {
    const d = new Date(w.date)
    return d.getMonth() + 1 === todayMonth && d.getDate() === todayDay
  })

  // Apply filters
  let filtered = [...allWalls]

  if (view === 'today') {
    filtered = filtered.filter(w => {
      const d = new Date(w.date)
      return d.getMonth() + 1 === todayMonth && d.getDate() === todayDay
    })
  } else if (view === 'week') {
    filtered = filtered.filter(w => {
      const days = birthdayDaysUntil(w)
      return days <= 7
    })
  } else if (view === 'month30') {
    filtered = filtered.filter(w => {
      const days = birthdayDaysUntil(w)
      return days <= 30
    })
  } else if (view === 'tiktok') {
    filtered = filtered.filter(w => w.user.wantsFeature)
  } else if (view === 'featured') {
    filtered = filtered.filter(w => w.featured)
  }

  if (q) {
    const lq = q.toLowerCase()
    filtered = filtered.filter(w =>
      w.user.pseudo.toLowerCase().includes(lq) ||
      w.user.name.toLowerCase().includes(lq)
    )
  }

  if (month) {
    const m = parseInt(month)
    filtered = filtered.filter(w => new Date(w.date).getMonth() + 1 === m)
    if (day) {
      const d = parseInt(day)
      filtered = filtered.filter(w => new Date(w.date).getDate() === d)
    }
  }

  // Sort
  if (sort === 'birthday') {
    filtered.sort((a, b) => birthdayDaysUntil(a) - birthdayDaysUntil(b))
  } else if (sort === 'messages') {
    filtered.sort((a, b) => b._count.messages - a._count.messages)
  }
  // 'recent' = default DB order (already createdAt desc)

  return (
    <main style={{ minHeight: '100vh' }}>
      <Nav />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'var(--s-8) var(--s-6)' }}>

        <div style={{ marginBottom: 'var(--s-10)', paddingBottom: 'var(--s-6)', borderBottom: '1px solid var(--border)' }}>
          <p className="t-label t-muted" style={{ marginBottom: 'var(--s-1)' }}>{t('label')}</p>
          <h1 className="t-h1">{t('title')}</h1>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '1px', background: 'var(--border)', marginBottom: 'var(--s-12)' }}>
          <StatBox label={t('users')} value={totalUsers} />
          <StatBox label={t('walls')} value={totalWalls} />
          <StatBox label={t('messages')} value={totalMessages} />
          <StatBox label={t('avgMsg')} value={totalWalls ? Math.round(totalMessages / totalWalls) : 0} />
          <StatBox label="Notifs actives" value={totalPushSubs} />
        </div>

{/* Anniversaires aujourd'hui */}
        {birthdayToday.length > 0 && (
          <div style={{ marginBottom: 'var(--s-10)', padding: 'var(--s-5)', border: '2px solid #7B61FF' }}>
            <p className="t-label" style={{ marginBottom: 'var(--s-4)', color: '#7B61FF' }}>
              {t('todayBirthdays')} - {birthdayToday.length}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
              {birthdayToday.map(w => (
                <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 'var(--s-3)', alignItems: 'center' }}>
                    <span className="t-small">{w.user.name}</span>
                    <span className="t-caption t-muted">@{w.user.pseudo}</span>
                    {w.user.wantsFeature && (
                      <span className="t-caption" style={{ color: '#7B61FF' }}>TikTok</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'center' }}>
                    <span className="t-caption t-muted">{w._count.messages} msg</span>
                    <Link href={`/wall/${w.slug}`} className="btn btn--ghost" style={{ fontSize: '10px', padding: 'var(--s-1) var(--s-2)' }}>→</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

{/* Links */}
        <div style={{ marginBottom: 'var(--s-8)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--s-3)' }}>
          <Link href="/admin/users" className="btn btn--ghost" style={{ fontSize: '11px' }}>
            Utilisateurs →
          </Link>
          <Link href="/admin/messages" className="btn btn--ghost" style={{ fontSize: '11px' }}>
            {t('recentMessages')} →
          </Link>
          <Link href="/admin/notifications" className="btn btn--ghost" style={{ fontSize: '11px' }}>
            Notifications →
          </Link>
          <Link href="/admin/instagram" className="btn btn--ghost" style={{ fontSize: '11px' }}>
            Instagram →
          </Link>
        </div>

        {/* Main layout : sidebar + results */}
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 'var(--s-8)', alignItems: 'start' }}>

          {/* Sidebar filtres */}
          <div style={{ position: 'sticky', top: 'var(--s-6)' }}>
            <Suspense>
              <AdminFilters total={filtered.length} />
            </Suspense>
          </div>

          {/* Zone résultats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-8)' }}>

            {/* Walls */}
            <div>
              {filtered.length === 0 ? (
                <p className="t-small t-muted" style={{ padding: 'var(--s-6)', border: '1px solid var(--border)' }}>{t('noResults')}</p>
              ) : display === 'mosaic' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--s-3)' }}>
                  {filtered.map(w => (
                    <AdminWallCard
                      key={w.id}
                      id={w.id}
                      userId={w.userId}
                      slug={w.slug}
                      title={w.title}
                      pseudo={w.user.pseudo}
                      name={w.user.name}
                      wallDate={w.date.toISOString()}
                      msgCount={w._count.messages}
                      featured={w.featured}
                      daysUntilBirthday={birthdayDaysUntil(w)}
                      wantsFeature={w.user.wantsFeature}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ border: '1px solid var(--border)' }}>
                  {filtered.map((w, i) => (
                    <AdminWallRow
                      key={w.id}
                      id={w.id}
                      userId={w.userId}
                      slug={w.slug}
                      title={w.title}
                      pseudo={w.user.pseudo}
                      name={w.user.name}
                      wallDate={w.date.toISOString()}
                      msgCount={w._count.messages}
                      createdAt={w.createdAt.toISOString()}
                      featured={w.featured}
                      daysUntilBirthday={birthdayDaysUntil(w)}
                      wantsFeature={w.user.wantsFeature}
                      isLast={i === filtered.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ flex: 1, background: 'var(--bg)', padding: 'var(--s-6)', textAlign: 'center' }}>
      <p className="t-h2">{value}</p>
      <p className="t-caption t-muted" style={{ marginTop: 'var(--s-1)' }}>{label}</p>
    </div>
  )
}
