'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Star, ArrowRight } from 'lucide-react'

function CountdownBadge({ days }: { days: number }) {
  if (days === 0) return (
    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#FFFFFF', background: '#7B61FF', padding: '2px 6px' }}>
      Aujourd'hui !
    </span>
  )
  if (days <= 7) return (
    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#FFFFFF', background: '#111111', padding: '2px 6px' }}>
      J-{days}
    </span>
  )
  if (days <= 30) return (
    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '9px', letterSpacing: '0.06em', color: '#111111', background: '#EAEAEA', border: '1px solid #CCCCCC', padding: '2px 6px' }}>
      J-{days}
    </span>
  )
  return (
    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '9px', color: '#AAAAAA' }}>
      J-{days}
    </span>
  )
}

interface Props {
  id: string
  userId: string
  slug: string
  title: string
  pseudo: string
  name: string
  wallDate: string
  msgCount: number
  featured: boolean
  daysUntilBirthday: number
  wantsFeature: boolean
}

export default function AdminWallCard({ id, userId, slug, title, pseudo, name, wallDate, msgCount, featured: initialFeatured, daysUntilBirthday, wantsFeature }: Props) {
  const [featured, setFeatured] = useState(initialFeatured)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [resetDone, setResetDone] = useState<string | null>(null)
  const router = useRouter()

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/wall/${slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function toggleFeature() {
    setLoading(true)
    const method = featured ? 'DELETE' : 'POST'
    const res = await fetch(`/api/admin/walls/${id}/feature`, { method })
    if (res.ok) setFeatured(!featured)
    setLoading(false)
  }

  async function resetPin() {
    setResetting(true)
    const res = await fetch(`/api/admin/users/${userId}/reset-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '0000' }),
    })
    if (res.ok) setResetDone('0000')
    setResetting(false)
  }

  async function deleteUser() {
    setDeleting(true)
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
    else { setDeleting(false); setConfirm(false) }
  }


  return (
    <div style={{
      border: '1px solid var(--border)',
      background: featured ? 'rgba(123,97,255,0.04)' : 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--s-3)',
      padding: 'var(--s-4)',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'center', marginBottom: 'var(--s-1)' }}>
            {featured && <div style={{ width: 6, height: 6, background: '#7B61FF', flexShrink: 0 }} />}
            <p className="t-small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</p>
          </div>
          <p className="t-caption t-muted">@{pseudo}</p>
        </div>
        <CountdownBadge days={daysUntilBirthday} />
      </div>

      {/* Identity */}
      <div style={{ padding: 'var(--s-3)', background: 'rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p className="t-caption" style={{ marginBottom: 'var(--s-1)' }}>{name}</p>
          <p className="t-caption t-muted">{new Date(wallDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--s-1)' }}>
          <p className="t-caption t-muted">{msgCount} msg</p>
          {wantsFeature && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '8px', color: '#7B61FF', textTransform: 'uppercase' }}>TikTok</span>}
        </div>
      </div>

      {/* Actions */}
      {confirm ? (
        <div style={{ display: 'flex', gap: 'var(--s-1)' }}>
          <button onClick={deleteUser} disabled={deleting} className="btn btn--solid" style={{ fontSize: '10px', padding: 'var(--s-1) var(--s-2)', background: '#111', flex: 1 }}>
            {deleting ? '...' : 'Confirmer'}
          </button>
          <button onClick={() => setConfirm(false)} className="btn btn--ghost" style={{ fontSize: '10px', padding: 'var(--s-1) var(--s-2)', flex: 1 }}>
            Annuler
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 'var(--s-1)', flexWrap: 'wrap' }}>
          <button onClick={copyLink} className="btn btn--ghost" style={{ fontSize: '10px', padding: 'var(--s-1) var(--s-2)', display: 'inline-flex', alignItems: 'center' }}>{copied ? <Check size={12} /> : 'Copier'}</button>
          <button onClick={toggleFeature} disabled={loading} className={`btn ${featured ? 'btn--solid' : 'btn--ghost'}`} style={{ fontSize: '10px', padding: 'var(--s-1) var(--s-2)', display: 'inline-flex', alignItems: 'center' }}><Star size={12} fill={featured ? 'currentColor' : 'none'} /></button>
          <Link href={`/wall/${slug}`} className="btn btn--ghost" style={{ fontSize: '10px', padding: 'var(--s-1) var(--s-2)', display: 'inline-flex', alignItems: 'center' }}><ArrowRight size={12} /></Link>
          <Link href={`/wall/${slug}/admin`} className="btn btn--ghost" style={{ fontSize: '10px', padding: 'var(--s-1) var(--s-2)' }}>Admin</Link>
          <button onClick={resetPin} disabled={resetting} className="btn btn--ghost" style={{ fontSize: '10px', padding: 'var(--s-1) var(--s-2)', color: '#999' }}>
            {resetDone ? `PIN: ${resetDone}` : resetting ? '...' : 'Reset PIN'}
          </button>
          <button onClick={() => setConfirm(true)} className="btn btn--ghost" style={{ fontSize: '10px', padding: 'var(--s-1) var(--s-2)', color: '#999' }}>Suppr.</button>
        </div>
      )}
    </div>
  )
}
