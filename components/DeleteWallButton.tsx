'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteWallButton({ slug }: { slug: string }) {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    await fetch(`/api/walls/${slug}`, { method: 'DELETE' })
    router.refresh()
  }

  if (confirm) {
    return (
      <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
        <button className="btn btn--ghost" style={{ fontSize: '12px', color: 'var(--accent)' }} onClick={handleDelete} disabled={loading}>
          {loading ? '…' : 'Confirmer'}
        </button>
        <button className="btn btn--ghost" style={{ fontSize: '12px' }} onClick={() => setConfirm(false)}>
          Annuler
        </button>
      </div>
    )
  }

  return (
    <button
      className="btn btn--ghost"
      style={{ fontSize: '12px', color: 'var(--accent)' }}
      onClick={() => setConfirm(true)}
    >
      Supprimer
    </button>
  )
}
