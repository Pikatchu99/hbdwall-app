'use client'
import { useState } from 'react'
import AdminUserWallsModal from './AdminUserWallsModal'

type Wall = {
  id: string
  slug: string
  title: string
  date: string
  featured: boolean
  isActive: boolean
  msgCount: number
}

type User = {
  id: string
  name: string
  pseudo: string
  email: string | null
  tiktokHandle: string | null
  instagramHandle: string | null
  authProvider: string | null
  wantsFeature: boolean
  createdAt: string
  walls: Wall[]
}

export default function AdminUserList({ users }: { users: User[] }) {
  const [selected, setSelected] = useState<User | null>(null)
  const [q, setQ] = useState('')

  const filtered = q
    ? users.filter(u => u.name.toLowerCase().includes(q.toLowerCase()) || u.pseudo.toLowerCase().includes(q.toLowerCase()))
    : users

  return (
    <>
      <div style={{ marginBottom: 'var(--s-4)' }}>
        <input
          className="input"
          type="text"
          placeholder="Rechercher un utilisateur…"
          value={q}
          onChange={e => setQ(e.target.value)}
          style={{ maxWidth: '320px' }}
        />
      </div>

      <div style={{ border: '1px solid var(--border)' }}>
        {filtered.length === 0 && (
          <p className="t-small t-muted" style={{ padding: 'var(--s-6)' }}>Aucun résultat</p>
        )}
        {filtered.map((u, i) => (
          <div
            key={u.id}
            onClick={() => setSelected(u)}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: 'var(--s-3) var(--s-4)',
              borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
              cursor: 'pointer',
            }}
            className="wall-row"
          >
            <div style={{ display: 'flex', gap: 'var(--s-4)', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)' }}>
                  <span className="t-body">{u.name}</span>
                  <span className="t-caption t-muted">@{u.pseudo}</span>
                  {u.authProvider === 'google' && <span className="t-caption" style={{ color: '#4285F4' }}>G</span>}
                </div>
                <div style={{ display: 'flex', gap: 'var(--s-3)', alignItems: 'center' }}>
                  {u.email && <span className="t-caption t-muted">{u.email}</span>}
                  {u.instagramHandle && <span className="t-caption" style={{ color: '#E1306C' }}>ig: {u.instagramHandle}</span>}
                  {u.tiktokHandle && <span className="t-caption" style={{ color: '#7B61FF' }}>tt: {u.tiktokHandle}</span>}
                  {!u.instagramHandle && !u.tiktokHandle && <span className="t-caption t-muted">aucun réseau</span>}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--s-4)', alignItems: 'center' }}>
              <span className="t-caption t-muted">{u.walls.length} mur{u.walls.length !== 1 ? 's' : ''}</span>
              <span className="t-caption t-muted">{u.walls.reduce((s, w) => s + w.msgCount, 0)} msg</span>
              <span className="t-caption t-muted">
                {new Date(u.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className="t-caption t-muted">→</span>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <AdminUserWallsModal user={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
