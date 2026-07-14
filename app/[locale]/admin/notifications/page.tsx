import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import Nav from '@/components/Nav'
import AdminNotifSender from '@/components/AdminNotifSender'

function birthdayDaysUntil(date: Date): number {
  const today = new Date()
  const next = new Date(today.getFullYear(), date.getMonth(), date.getDate())
  if (next < today) next.setFullYear(today.getFullYear() + 1)
  return Math.floor((next.getTime() - today.getTime()) / 86400000)
}

export default async function AdminNotificationsPage() {
  const session = await getSession()
  if (!session.userId) redirect('/login')

  const me = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!me?.isAdmin) redirect('/dashboard')

  const usersWithSubs = await prisma.user.findMany({
    where: { pushSubscriptions: { some: {} } },
    select: {
      id: true,
      name: true,
      pseudo: true,
      pushSubscriptions: { select: { id: true, createdAt: true } },
      walls: { select: { date: true }, where: { isBirthday: true } },
    },
    orderBy: { pseudo: 'asc' },
  })

  const subscribers = usersWithSubs.map(u => ({
    userId: u.id,
    name: u.name,
    pseudo: u.pseudo,
  }))

  const birthdayWeekUserIds = usersWithSubs
    .filter(u => u.walls.some(w => birthdayDaysUntil(new Date(w.date)) <= 7))
    .map(u => u.id)

  const logs = await prisma.notificationLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return (
    <main style={{ minHeight: '100vh' }}>
      <Nav />
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: 'var(--s-8) var(--s-6)' }}>

        <div style={{ marginBottom: 'var(--s-6)' }}>
          <Link href="/admin" className="t-caption t-muted">← Admin</Link>
        </div>

        <div style={{ marginBottom: 'var(--s-8)', paddingBottom: 'var(--s-6)', borderBottom: '1px solid var(--border)' }}>
          <p className="t-label t-muted" style={{ marginBottom: 'var(--s-1)' }}>ADMIN</p>
          <h1 className="t-h1">Notifications</h1>
          <p className="t-small t-muted" style={{ marginTop: 'var(--s-2)' }}>
            {subscribers.length} abonné(s) actif(s)
          </p>
        </div>

        <AdminNotifSender subscribers={subscribers} birthdayWeekUserIds={birthdayWeekUserIds} />

        {/* Subscriber list */}
        {usersWithSubs.length > 0 && (
          <div style={{ marginTop: 'var(--s-8)', padding: 'var(--s-5)', border: '1px solid var(--border)' }}>
            <p className="t-label t-muted" style={{ marginBottom: 'var(--s-4)' }}>ABONNÉS ACTIFS</p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {usersWithSubs.map((u, i) => {
                const days = u.walls.length > 0
                  ? Math.min(...u.walls.map(w => birthdayDaysUntil(new Date(w.date))))
                  : null
                return (
                  <div
                    key={u.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 'var(--s-3) 0',
                      borderBottom: i < usersWithSubs.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'baseline' }}>
                      <span className="t-small">{u.name}</span>
                      <span className="t-caption t-muted">@{u.pseudo}</span>
                      <span className="t-caption t-muted">· {u.pushSubscriptions.length} appareil(s)</span>
                    </div>
                    {days !== null && (
                      <span className="t-caption t-muted">
                        {days === 0 ? 'aujourd\'hui' : `J-${days}`}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {usersWithSubs.length === 0 && (
          <p className="t-small t-muted" style={{ marginTop: 'var(--s-8)' }}>
            Aucun utilisateur abonné aux notifications pour l'instant.
          </p>
        )}

        {/* Historique */}
        <div style={{ marginTop: 'var(--s-10)', padding: 'var(--s-5)', border: '1px solid var(--border)' }}>
          <p className="t-label t-muted" style={{ marginBottom: 'var(--s-4)' }}>HISTORIQUE · {logs.length}</p>
          {logs.length === 0 ? (
            <p className="t-caption t-muted">Aucune notification envoyée pour l'instant.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {logs.map((log, i) => (
                <div
                  key={log.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 'var(--s-4)',
                    padding: 'var(--s-3) 0',
                    borderBottom: i < logs.length - 1 ? '1px solid var(--border)' : 'none',
                    alignItems: 'start',
                  }}
                >
                  <div>
                    <p className="t-small" style={{ marginBottom: '2px' }}>{log.title}</p>
                    <p className="t-caption t-muted">{log.body}</p>
                    <div style={{ display: 'flex', gap: 'var(--s-3)', marginTop: 'var(--s-1)' }}>
                      <span className="t-caption t-muted">{log.target}</span>
                      <span className="t-caption">✓ {log.sent}</span>
                      {log.failed > 0 && <span className="t-caption t-muted">✕ {log.failed}</span>}
                    </div>
                  </div>
                  <span className="t-caption t-muted" style={{ whiteSpace: 'nowrap' }}>
                    {new Date(log.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
