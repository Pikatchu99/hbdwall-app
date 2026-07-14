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
  createdAt: string
  featured: boolean
  daysUntilBirthday: number
  wantsFeature: boolean
  isLast: boolean
}

export default function AdminWallRow({ id, userId, slug, title, pseudo, name, wallDate, msgCount, createdAt, featured: initialFeatured, daysUntilBirthday, wantsFeature, isLast }: Props) {
  const [copied, setCopied] = useState(false)
  const [featured, setFeatured] = useState(initialFeatured)
  const [loading, setLoading] = useState(false)
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
    else setDeleting(false)
    setConfirm(false)
  }

  return (
    <div style={{
      padding: 'var(--s-4)',
      borderBottom: isLast ? 'none' : '1px solid var(--border)',
      background: featured ? 'rgba(123,97,255,0.04)' : undefined,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--s-3)',
    }}>

      {/* Infos */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--s-4)', minWidth: 0 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)', marginBottom: 'var(--s-1)' }}>
            {featured && <div style={{ width: 6, height: 6, background: '#7B61FF', flexShrink: 0 }} />}
            <p className="t-small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title}
            </p>
          </div>
          <p className="t-caption t-muted">
            @{pseudo} · {msgCount} msg · {new Date(createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </p>
        </div>

        {/* Identité + countdown */}
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)', justifyContent: 'flex-end', marginBottom: 'var(--s-1)' }}>
            {wantsFeature && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '8px', color: '#7B61FF', textTransform: 'uppercase' }}>TikTok</span>}
            <p className="t-caption">{name}</p>
          </div>
          <p className="t-caption t-muted" style={{ marginBottom: 'var(--s-1)' }}>
            {new Date(wallDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
          </p>
          <CountdownBadge days={daysUntilBirthday} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={copyLink} className="btn btn--ghost" style={{ fontSize: '10px', padding: 'var(--s-1) var(--s-2)' }}>
          {copied ? <Check size={12} /> : 'Copier'}
        </button>
        <button
          onClick={toggleFeature}
          disabled={loading}
          className={`btn ${featured ? 'btn--solid' : 'btn--ghost'}`}
          style={{ fontSize: '10px', padding: 'var(--s-1) var(--s-2)' }}
        >
          <Star size={12} fill={featured ? 'currentColor' : 'none'} />
        </button>
        <Link href={`/wall/${slug}`} className="btn btn--ghost" style={{ fontSize: '10px', padding: 'var(--s-1) var(--s-2)', display: 'inline-flex', alignItems: 'center' }}>
          <ArrowRight size={12} />
        </Link>
        <Link href={`/wall/${slug}/admin`} className="btn btn--ghost" style={{ fontSize: '10px', padding: 'var(--s-1) var(--s-2)' }}>
          Admin
        </Link>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--s-2)' }}>
          {confirm ? (
            <>
              <button onClick={deleteUser} disabled={deleting} className="btn btn--solid" style={{ fontSize: '10px', padding: 'var(--s-1) var(--s-2)', background: '#111' }}>
                {deleting ? '...' : 'Confirmer'}
              </button>
              <button onClick={() => setConfirm(false)} className="btn btn--ghost" style={{ fontSize: '10px', padding: 'var(--s-1) var(--s-2)' }}>
                Annuler
              </button>
            </>
          ) : (
            <>
              <button onClick={resetPin} disabled={resetting} className="btn btn--ghost" style={{ fontSize: '10px', padding: 'var(--s-1) var(--s-2)', color: '#999' }}>
                {resetDone ? `PIN: ${resetDone}` : resetting ? '...' : 'Reset PIN'}
              </button>
              <button onClick={() => setConfirm(true)} className="btn btn--ghost" style={{ fontSize: '10px', padding: 'var(--s-1) var(--s-2)', color: '#999' }}>
                Suppr.
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  )
}
