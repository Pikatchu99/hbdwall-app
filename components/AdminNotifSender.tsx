'use client'
import { Check, X } from 'lucide-react'
import { useState, useMemo } from 'react'

type Subscriber = { userId: string; name: string; pseudo: string }
type Target = 'all' | 'birthday_week' | 'users'

export default function AdminNotifSender({
  subscribers,
  birthdayWeekUserIds,
}: {
  subscribers: Subscriber[]
  birthdayWeekUserIds: string[]
}) {
  const [target, setTarget] = useState<Target>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [customUrl, setCustomUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; sent: number; failed: number } | null>(null)

  function changeTarget(t: Target) {
    setTarget(t)
    setSelectedIds(new Set())
    setSearch('')
    setResult(null)
  }

  const filteredSubs = useMemo(() => {
    const q = search.toLowerCase()
    return q
      ? subscribers.filter(s => s.name.toLowerCase().includes(q) || s.pseudo.toLowerCase().includes(q))
      : subscribers
  }, [subscribers, search])

  function toggleUser(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectAll() { setSelectedIds(new Set(filteredSubs.map(s => s.userId))) }
  function clearAll() { setSelectedIds(new Set()) }

  async function send() {
    setLoading(true)
    setResult(null)

    const payload: Record<string, unknown> = { title, body, target }
    if (customUrl.trim()) payload.url = customUrl.trim()
    if (target === 'birthday_week') payload.userIds = birthdayWeekUserIds
    else if (target === 'users') payload.userIds = Array.from(selectedIds)

    const res = await fetch('/api/admin/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setResult(res.ok ? { ok: true, sent: data.sent, failed: data.failed } : { ok: false, sent: 0, failed: 0 })
    setLoading(false)
  }

  const birthdayWeekSubs = subscribers.filter(s => birthdayWeekUserIds.includes(s.userId))

  const targetCount =
    target === 'all' ? subscribers.length :
    target === 'birthday_week' ? birthdayWeekSubs.length :
    selectedIds.size

  const canSend = !!title && !!body && !loading && targetCount > 0

  const inputStyle = {
    height: '36px',
    padding: '0 var(--s-3)',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    width: '100%',
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>

      {/* Target selector */}
      <div style={{ border: '1px solid var(--border)', padding: 'var(--s-5)' }}>
        <p className="t-label t-muted" style={{ marginBottom: 'var(--s-4)' }}>DESTINATAIRES</p>
        <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap' }}>
          <button onClick={() => changeTarget('all')} className={`btn ${target === 'all' ? 'btn--solid' : 'btn--ghost'}`} style={{ fontSize: '11px' }}>
            Tous · {subscribers.length}
          </button>
          <button onClick={() => changeTarget('birthday_week')} className={`btn ${target === 'birthday_week' ? 'btn--solid' : 'btn--ghost'}`} style={{ fontSize: '11px' }}>
            Anniv cette semaine · {birthdayWeekSubs.length}
          </button>
          <button onClick={() => changeTarget('users')} className={`btn ${target === 'users' ? 'btn--solid' : 'btn--ghost'}`} style={{ fontSize: '11px' }}>
            Sélection manuelle{selectedIds.size > 0 ? ` · ${selectedIds.size}` : ''}
          </button>
        </div>

        {/* Birthday week preview */}
        {target === 'birthday_week' && (
          <div style={{ marginTop: 'var(--s-4)', padding: 'var(--s-3)', border: '1px solid var(--border)', background: 'var(--surface)' }}>
            {birthdayWeekSubs.length === 0 ? (
              <span className="t-caption t-muted">Aucun anniversaire cette semaine parmi les abonnés</span>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)' }}>
                {birthdayWeekSubs.map(s => (
                  <span key={s.userId} className="t-caption">
                    {s.name} <span className="t-muted">@{s.pseudo}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Multi-select */}
        {target === 'users' && (
          <div style={{ marginTop: 'var(--s-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-4)', marginBottom: 'var(--s-3)' }}>
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...inputStyle, width: '200px' }}
              />
              <button onClick={selectAll} className="btn btn--ghost" style={{ fontSize: '10px' }}>Tout cocher</button>
              <button onClick={clearAll} className="btn btn--ghost" style={{ fontSize: '10px' }}>Tout décocher</button>
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)' }}>
              {filteredSubs.map(s => (
                <label
                  key={s.userId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--s-3)',
                    padding: 'var(--s-2) var(--s-3)',
                    cursor: 'pointer',
                    background: selectedIds.has(s.userId) ? 'var(--surface)' : 'transparent',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(s.userId)}
                    onChange={() => toggleUser(s.userId)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span className="t-small">{s.name}</span>
                  <span className="t-caption t-muted">@{s.pseudo}</span>
                </label>
              ))}
              {filteredSubs.length === 0 && (
                <p className="t-caption t-muted" style={{ padding: 'var(--s-3)' }}>Aucun résultat</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Message */}
      <div style={{ border: '1px solid var(--border)', padding: 'var(--s-5)' }}>
        <p className="t-label t-muted" style={{ marginBottom: 'var(--s-4)' }}>MESSAGE</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)', marginBottom: 'var(--s-4)' }}>
          <input
            type="text"
            placeholder="Titre"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Message"
            value={body}
            onChange={e => setBody(e.target.value)}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Lien (optionnel) — ex: /settings#reseaux-sociaux"
            value={customUrl}
            onChange={e => setCustomUrl(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-4)' }}>
          <button
            onClick={send}
            disabled={!canSend}
            className="btn btn--solid"
            style={{ fontSize: '11px' }}
          >
            {loading ? '...' : `Envoyer · ${targetCount} abonné(s) →`}
          </button>
        </div>
        {result && (
          <div style={{ marginTop: 'var(--s-3)', display: 'flex', gap: 'var(--s-4)' }}>
            <span className="t-caption" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--s-1)' }}><Check size={12} /> {result.sent} envoyé(s)</span>
            {result.failed > 0 && (
              <span className="t-caption t-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--s-1)' }}><X size={12} /> {result.failed} échoué(s)</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
