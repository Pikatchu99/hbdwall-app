'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X, Check, Star } from 'lucide-react'

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
  wantsFeature: boolean
  walls: Wall[]
}

export default function AdminUserWallsModal({ user, onClose }: { user: User; onClose: () => void }) {
  const router = useRouter()
  const [deletingWall, setDeletingWall] = useState<string | null>(null)
  const [deletingUser, setDeletingUser] = useState(false)
  const [walls, setWalls] = useState(user.walls)

  async function deleteWall(slug: string) {
    await fetch(`/api/walls/${slug}`, { method: 'DELETE' })
    setWalls(w => w.filter(x => x.slug !== slug))
    setDeletingWall(null)
  }

  async function deleteUser() {
    await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
    onClose()
    router.refresh()
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, padding: 'var(--s-4)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg)', border: '1px solid var(--border)',
          width: '100%', maxWidth: '560px', maxHeight: '80vh',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: 'var(--s-5) var(--s-6)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p className="t-label">{user.name}</p>
            <p className="t-caption t-muted" style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-1)' }}>
              @{user.pseudo}{user.wantsFeature ? <><Check size={11} /> TikTok</> : ''}
            </p>
          </div>
          <button onClick={onClose} className="btn btn--ghost" style={{ display: 'flex', alignItems: 'center', padding: 'var(--s-1)' }}><X size={16} /></button>
        </div>

        {/* Walls list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--s-4) var(--s-6)' }}>
          {walls.length === 0 ? (
            <p className="t-small t-muted">Aucun mur</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-1)' }}>
              {walls.map(w => (
                <div key={w.id} style={{ padding: 'var(--s-3) 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--s-3)' }}>
                  <div>
                    <p className="t-small">{w.title}</p>
                    <p className="t-caption t-muted">
                      {new Date(w.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                      {' · '}{w.msgCount} msg
                      {w.featured ? <><Star size={10} fill="currentColor" /> featured</> : ''}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--s-2)', flexShrink: 0 }}>
                    <Link href={`/wall/${w.slug}/admin`} className="btn btn--ghost" style={{ fontSize: '11px' }}>Gérer</Link>
                    {deletingWall === w.slug ? (
                      <>
                        <button className="btn btn--ghost" style={{ fontSize: '11px', color: 'var(--accent)' }} onClick={() => deleteWall(w.slug)}>Confirmer</button>
                        <button className="btn btn--ghost" style={{ fontSize: '11px' }} onClick={() => setDeletingWall(null)}>Annuler</button>
                      </>
                    ) : (
                      <button className="btn btn--ghost" style={{ fontSize: '11px', color: 'var(--accent)' }} onClick={() => setDeletingWall(w.slug)}>Supprimer</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — danger zone */}
        <div style={{ padding: 'var(--s-4) var(--s-6)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
          {deletingUser ? (
            <div style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'center' }}>
              <span className="t-caption t-muted">Supprimer le compte et tous ses murs ?</span>
              <button className="btn btn--ghost" style={{ fontSize: '11px', color: 'var(--accent)' }} onClick={deleteUser}>Confirmer</button>
              <button className="btn btn--ghost" style={{ fontSize: '11px' }} onClick={() => setDeletingUser(false)}>Annuler</button>
            </div>
          ) : (
            <button className="btn btn--ghost" style={{ fontSize: '11px', color: 'var(--accent)' }} onClick={() => setDeletingUser(true)}>
              Supprimer l'utilisateur
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
