'use client'
import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'
import MessageForm from './MessageForm'
import { track } from '@/lib/analytics'

function ScrollableContent({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => setHasMore(el.scrollHeight - el.scrollTop > el.clientHeight + 2)
    check()
    el.addEventListener('scroll', check, { passive: true })
    return () => el.removeEventListener('scroll', check)
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      <div ref={ref} style={{ maxHeight: '240px', overflowY: 'auto', scrollbarWidth: 'none' }}>
        {children}
      </div>
      {hasMore && (
        <div aria-hidden style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '40px',
          background: 'linear-gradient(to bottom, transparent, var(--bg))',
          pointerEvents: 'none',
        }} />
      )}
    </div>
  )
}

interface Message {
  id: string
  authorName: string | null
  content: string
  photoUrl: string | null
  fromPlatform: boolean
  isPinned: boolean
  pinnedAt: string | null
  createdAt: string
}

interface Props {
  wallSlug: string
  initialMessages: Message[]
  ownerName: string
  isAdmin?: boolean
  isOwner?: boolean
  instagramPostUrl?: string | null  // kept for admin UI only
}

const ROTATIONS = [-1.5, 1, -0.5, 1.5, -1, 0.5, -1.5, 1, 0, -0.5]
const PIN_COLORS = ['#7B61FF', '#111111', '#CCCCCC', '#111111', '#7B61FF', '#CCCCCC']
// Teintes "sticker" tournantes pour les messages invités (joyeux ; sans effet en classique).
const TINTS = ['tint-yellow', 'tint-lime', 'tint-violet', 'tint-magenta', 'tint-blue']

export default function WallClient({ wallSlug, initialMessages, ownerName, isAdmin = false, isOwner = false, instagramPostUrl: initialInstagramUrl = null }: Props) {
  const [messages, setMessages] = useState(initialMessages)
  const [adminContent, setAdminContent] = useState('')
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminDone, setAdminDone] = useState(false)
  const [adminError, setAdminError] = useState('')
  const adminFileRef = useRef<HTMLInputElement>(null)
  const [adminFile, setAdminFile] = useState<File | null>(null)
  const [igUrl, setIgUrl] = useState(initialInstagramUrl ?? '')
  const [igSaving, setIgSaving] = useState(false)
  const [igSaved, setIgSaved] = useState(false)
  const t = useTranslations('wall')

  // Haut du funnel invité : un visiteur a ouvert un wall partagé.
  useEffect(() => {
    track('wall_viewed', { wallSlug, isOwner, isAdmin })
  }, [wallSlug, isOwner, isAdmin])

  async function handleIgSave(e: React.FormEvent) {
    e.preventDefault()
    setIgSaving(true)
    try {
      await fetch(`/api/walls/${wallSlug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instagramPostUrl: igUrl || null }),
      })
      setIgSaved(true)
      setTimeout(() => setIgSaved(false), 2000)
    } finally {
      setIgSaving(false)
    }
  }

  async function handleAdminSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!adminContent.trim()) return
    setAdminLoading(true)
    setAdminError('')
    try {
      const fd = new FormData()
      fd.append('content', adminContent)
      fd.append('authorName', 'hbdwall')
      if (adminFile) fd.append('photo', adminFile)
      const res = await fetch(`/api/walls/${wallSlug}/messages`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Erreur')
      setAdminContent('')
      setAdminFile(null)
      setAdminDone(true)
      refresh()
    } catch {
      setAdminError('Erreur lors de l\'envoi')
    } finally {
      setAdminLoading(false)
    }
  }

  async function refresh() {
    const res = await fetch(`/api/walls/${wallSlug}/messages`)
    if (res.ok) setMessages(await res.json())
  }

  const platformMessages = messages.filter(m => m.fromPlatform)
  const pinnedMessages = messages.filter(m => m.isPinned && !m.fromPlatform)
  const regularMessages = messages.filter(m => !m.fromPlatform && !m.isPinned)

  return (
    <div>
      {!isAdmin && (
        <div id="leave-message" style={{ marginBottom: 'var(--s-12)' }}>
          <h2 className="t-h2" style={{ marginBottom: 'var(--s-2)' }}>{t('leaveMessage')}</h2>
          <p className="t-body t-muted" style={{ marginBottom: 'var(--s-6)' }}>
            {t('leaveMessageSubtitle')}
          </p>
          <div style={{ maxWidth: '480px' }}>
            <MessageForm wallSlug={wallSlug} recipientName={ownerName} onSuccess={refresh} isOwner={isOwner} />
          </div>
        </div>
      )}


      {messages.length > 0 && (
        <div style={{ borderTop: 'var(--border-w) solid var(--border)', paddingTop: 'var(--s-8)' }}>
          <p className="t-label t-muted" style={{ marginBottom: 'var(--s-8)' }}>
            {messages.length} MESSAGE{messages.length > 1 ? 'S' : ''}
          </p>

          <div style={{ columns: '3 220px', columnGap: 'var(--s-6)' }}>
            {[...platformMessages, ...pinnedMessages, ...regularMessages].map((msg, i) => {
              const isPlatform = msg.fromPlatform
              const isPinned = msg.isPinned
              const rotationIndex = isPlatform || isPinned ? 0 : i
              return (
                <div
                  key={msg.id}
                  style={{
                    breakInside: 'avoid',
                    marginBottom: 'var(--s-6)',
                    transform: isPlatform || isPinned ? 'none' : `rotate(${ROTATIONS[rotationIndex % ROTATIONS.length]}deg)`,
                    transformOrigin: 'center top',
                    position: 'relative',
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '8px',
                    height: '8px',
                    background: isPlatform || isPinned ? 'var(--accent)' : PIN_COLORS[i % PIN_COLORS.length],
                    zIndex: 1,
                  }} />

                  <div className={`msg-card ${isPlatform || isPinned ? 'is-pinned' : TINTS[i % TINTS.length]}`}>
                    {isPinned && (
                      <p style={{
                        fontSize: 10,
                        letterSpacing: '0.2em',
                        color: 'var(--accent)',
                        marginBottom: 'var(--s-3)',
                        fontFamily: 'var(--font-mono)',
                      }}>
                        {t('pinnedMessage')}
                      </p>
                    )}
                    {isPlatform && (
                      <p style={{
                        fontSize: 10,
                        letterSpacing: '0.2em',
                        color: 'var(--accent)',
                        marginBottom: 'var(--s-3)',
                        fontFamily: 'var(--font-mono)',
                      }}>
                        DE HBDWALL
                      </p>
                    )}
                    {msg.photoUrl && (
                      <img
                        src={msg.photoUrl}
                        alt=""
                        className="img-bw"
                        style={{ display: 'block', width: '100%', aspectRatio: '4/5', objectFit: 'cover', marginBottom: 'var(--s-4)' }}
                      />
                    )}
                    <ScrollableContent>
                      <p className="t-body" style={{ marginBottom: 'var(--s-3)' }}>{msg.content}</p>
                    </ScrollableContent>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      {!isPlatform && (
                        <span className="t-label t-muted">{msg.authorName || t('anonymous')}</span>
                      )}
                      <span className="t-caption t-muted" style={{ marginLeft: 'auto' }}>
                        {new Date(msg.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {isAdmin && (
        <div style={{
          marginTop: 'var(--s-16)',
          borderTop: 'var(--border-w) solid var(--fg)',
          paddingTop: 'var(--s-6)',
          background: 'var(--fg)',
          padding: 'var(--s-6)',
          borderRadius: 'var(--radius)',
        }}>
          <p style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--accent)', marginBottom: 'var(--s-2)', fontFamily: 'var(--font-mono)' }}>
            HBDWALL
          </p>
          <p className="t-label" style={{ color: 'var(--fg-inverted)', marginBottom: 'var(--s-6)' }}>
            Laisser un message de la plateforme
          </p>
          <form onSubmit={handleIgSave} style={{ display: 'flex', gap: 'var(--s-3)', marginBottom: 'var(--s-6)', maxWidth: 480 }}>
            <input
              className="input"
              type="url"
              placeholder="https://www.instagram.com/p/..."
              value={igUrl}
              onChange={e => setIgUrl(e.target.value)}
              style={{ flex: 1, background: 'rgba(255,255,255,0.08)', color: 'var(--fg-inverted)', borderColor: 'rgba(255,255,255,0.2)' }}
            />
            <button className="btn btn--ghost" type="submit" disabled={igSaving} style={{ color: 'var(--fg-inverted)', borderColor: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
              {igSaved ? <Check size={14} /> : igSaving ? '...' : 'Lier'}
            </button>
          </form>

          {adminDone ? (
            <div>
              <p className="t-body" style={{ color: 'var(--fg-inverted)', marginBottom: 'var(--s-4)', display: 'flex', alignItems: 'center', gap: 'var(--s-2)' }}>Message posté <Check size={14} /></p>
              <button className="btn btn--ghost" style={{ color: 'var(--fg-inverted)', borderColor: 'var(--fg-inverted)' }} onClick={() => setAdminDone(false)}>
                + Autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)', maxWidth: 480 }}>
              <textarea
                className="input"
                placeholder="Ton message..."
                rows={3}
                value={adminContent}
                onChange={e => setAdminContent(e.target.value)}
                required
                style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--fg-inverted)', borderColor: 'rgba(255,255,255,0.2)' }}
              />
              <div style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'center' }}>
                <input
                  ref={adminFileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => setAdminFile(e.target.files?.[0] || null)}
                />
                <button type="button" className="btn btn--ghost" style={{ color: 'var(--fg-inverted)', borderColor: 'rgba(255,255,255,0.2)', fontSize: 11 }} onClick={() => adminFileRef.current?.click()}>
                  {adminFile ? `✓ ${adminFile.name}` : '+ Photo'}
                </button>
                {adminFile && (
                  <button type="button" className="btn btn--ghost" style={{ color: 'var(--fg-inverted)', borderColor: 'rgba(255,255,255,0.2)' }} onClick={() => setAdminFile(null)}>×</button>
                )}
              </div>
              {adminError && <p className="t-small" style={{ color: 'var(--accent)' }}>{adminError}</p>}
              <button className="btn btn--solid" type="submit" disabled={adminLoading} style={{ alignSelf: 'flex-start' }}>
                {adminLoading ? 'Envoi...' : 'Poster →'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
