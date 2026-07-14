'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ShareBlock from './ShareBlock'

// Teintes "sticker" tournantes (joyeux uniquement ; sans effet en classique).
const TINTS = ['', 'tint-yellow', 'tint-lime', 'tint-violet', 'tint-magenta']

interface Message {
  id: string
  authorName: string | null
  content: string
  photoUrl: string | null
  fromPlatform: boolean
  isPinned: boolean
  pinnedAt: string | null
  isHidden: boolean
  hiddenAt: string | null
  hiddenByRole: string | null
  createdAt: string
}

interface Props {
  wallSlug: string
  initialMessages: Message[]
  canManagePlatform?: boolean
}

function sortMessages(messages: Message[]) {
  return [...messages].sort((a, b) => {
    if (a.fromPlatform !== b.fromPlatform) return a.fromPlatform ? -1 : 1
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export default function AdminClient({ wallSlug, initialMessages, canManagePlatform = false }: Props) {
  const t = useTranslations('wallAdmin')
  const [messages, setMessages] = useState(() => sortMessages(initialMessages))
  const [busy, setBusy] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [error, setError] = useState('')
  const pinnedCount = messages.filter(m => m.isPinned && !m.fromPlatform).length
  const guestMessageCount = messages.filter(m => !m.fromPlatform).length

  async function handleAction(id: string, action: 'pin' | 'unpin' | 'hide' | 'unhide') {
    setBusy(`${action}:${id}`)
    setError('')
    const res = await fetch(`/api/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    if (res.ok) {
      const updated = await res.json()
      setMessages(msgs => {
        const next = msgs.map(m => {
          return m.id === id ? { ...m, ...updated, createdAt: new Date(updated.createdAt).toISOString() } : m
        })
        return sortMessages(next)
      })
    } else {
      const body = await res.json().catch(() => null)
      setError(body?.error || t('actionError'))
    }
    setBusy(null)
  }

  async function handleDelete(id: string) {
    setBusy(`delete:${id}`)
    setError('')
    const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' })
    if (res.ok) setMessages(msgs => msgs.filter(m => m.id !== id))
    else {
      const body = await res.json().catch(() => null)
      setError(body?.error || t('actionError'))
    }
    setBusy(null)
  }

  if (guestMessageCount === 0) {
    return (
      <div style={{ padding: 'var(--s-16) 0', maxWidth: '520px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--s-6)' }}>
          <p className="t-body" style={{ marginBottom: 'var(--s-2)' }}>{t('noMessages')}</p>
          <p className="t-small t-muted">{t('shareEmptyHint')}</p>
        </div>
        <ShareBlock slug={wallSlug} />
      </div>
    )
  }

  return (
    <>
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={lightbox}
            alt=""
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', display: 'block' }}
          />
        </div>
      )}

      {error && <p className="t-small" style={{ color: 'var(--accent)', marginBottom: 'var(--s-4)' }}>{error}</p>}

      <div className="admin-grid">
        {messages.map((msg, i) => (
          <div key={msg.id} style={{ position: 'relative', breakInside: 'avoid', marginBottom: 'var(--s-5)', opacity: msg.isHidden ? 0.55 : 1 }}>
            {/* Pin */}
            <div style={{
              position: 'absolute', top: '-4px', left: '50%',
              transform: 'translateX(-50%)',
              width: '8px', height: '8px',
              background: msg.isPinned ? 'var(--accent)' : 'var(--fg)', zIndex: 1,
            }} />

            <div className={`msg-card ${TINTS[i % TINTS.length]}${msg.isPinned ? ' is-pinned' : ''}`}>
              <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap', marginBottom: msg.isPinned || msg.isHidden ? 'var(--s-3)' : 0 }}>
                {msg.isPinned && <span className="t-caption" style={{ color: 'var(--accent)' }}>{t('pinned')}</span>}
                {msg.isHidden && <span className="t-caption t-muted">{t('hidden')}</span>}
              </div>
              {msg.photoUrl && (
                <img
                  src={msg.photoUrl}
                  alt=""
                  onClick={() => setLightbox(msg.photoUrl!)}
                  style={{ display: 'block', width: '100%', aspectRatio: '4/5', objectFit: 'cover', marginBottom: 'var(--s-4)', cursor: 'zoom-in' }}
                />
              )}
              <p className="t-body" style={{ marginBottom: 'var(--s-3)' }}>{msg.content}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="t-label t-muted">{msg.authorName || t('anonymous')}</span>
                <span className="t-caption t-muted">
                  {new Date(msg.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap', marginTop: 'var(--s-4)' }}>
                {!msg.isHidden && !msg.fromPlatform && (
                  <button
                    onClick={() => handleAction(msg.id, msg.isPinned ? 'unpin' : 'pin')}
                    disabled={busy !== null || (!msg.isPinned && pinnedCount >= 3)}
                    className="btn btn--ghost"
                    style={{ fontSize: '11px' }}
                  >
                    {busy === `${msg.isPinned ? 'unpin' : 'pin'}:${msg.id}` ? '...' : msg.isPinned ? t('unpin') : pinnedCount >= 3 ? t('pinLimit') : t('pin')}
                  </button>
                )}
                {(!msg.fromPlatform || canManagePlatform) && (
                  <button
                    onClick={() => handleAction(msg.id, msg.isHidden ? 'unhide' : 'hide')}
                    disabled={busy !== null}
                    className="btn btn--ghost"
                    style={{ fontSize: '11px' }}
                  >
                    {busy === `${msg.isHidden ? 'unhide' : 'hide'}:${msg.id}` ? '...' : msg.isHidden ? t('unhide') : t('hide')}
                  </button>
                )}
                {(!msg.fromPlatform || canManagePlatform) && (
                <button
                  onClick={() => handleDelete(msg.id)}
                  disabled={busy !== null}
                  className="btn btn--ghost"
                  style={{ fontSize: '11px' }}
                >
                  {busy === `delete:${msg.id}` ? '...' : t('delete')}
                </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
