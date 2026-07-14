'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

export type WishlistItem = {
  id: string
  title: string
  url: string | null
  price: string | null
}

// Expérience dédiée propriétaire : éditeur à gauche + aperçu live (ce que verront
// les invités) à droite, partageant le même état → l'aperçu se met à jour en direct.
export default function WishlistManager({
  slug,
  ownerName,
  initialItems,
}: {
  slug: string
  ownerName: string
  initialItems: WishlistItem[]
}) {
  const t = useTranslations('wishlist')
  const [items, setItems] = useState<WishlistItem[]>(initialItems)
  const [adding, setAdding] = useState(initialItems.length === 0)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)

  async function add(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    const res = await fetch(`/api/walls/${slug}/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, url, price }),
    })
    if (res.ok) {
      const item = await res.json()
      setItems(prev => [...prev, item])
      setTitle('')
      setUrl('')
      setPrice('')
      setAdding(false)
    }
    setLoading(false)
  }

  async function remove(id: string) {
    const prev = items
    setItems(items.filter(i => i.id !== id))
    const res = await fetch(`/api/walls/${slug}/wishlist/${id}`, { method: 'DELETE' })
    if (!res.ok) setItems(prev)
  }

  return (
    <div className="wishlist-manager-grid" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: 'var(--s-12)',
      alignItems: 'start',
    }}>
      {/* Éditeur */}
      <div>
        <p className="t-label t-muted" style={{ marginBottom: 'var(--s-6)', letterSpacing: 'var(--tracking-label)' }}>
          {t('editorLabel')}
        </p>

        {items.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--s-6)', display: 'flex', flexDirection: 'column' }}>
            {items.map(item => (
              <li
                key={item.id}
                style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--s-3)', padding: 'var(--s-3) 0', borderTop: 'var(--border-w) solid var(--border)' }}
              >
                <span style={{ color: 'var(--accent)', flexShrink: 0 }}>→</span>
                <span className="t-body" style={{ flex: 1 }}>
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="link">{item.title}</a>
                  ) : (
                    item.title
                  )}
                </span>
                {item.price && (
                  <span className="t-small t-muted" style={{ fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{item.price}</span>
                )}
                <button
                  onClick={() => remove(item.id)}
                  className="t-caption t-muted link"
                  style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {t('remove')}
                </button>
              </li>
            ))}
          </ul>
        )}

        {adding ? (
          <form onSubmit={add} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
            <input
              className="input"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t('fieldTitlePlaceholder')}
              autoFocus
              required
            />
            <div style={{ display: 'flex', gap: 'var(--s-3)' }}>
              <input
                className="input"
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder={t('fieldUrlPlaceholder')}
                style={{ flex: 2 }}
              />
              <input
                className="input"
                type="text"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder={t('fieldPricePlaceholder')}
                style={{ flex: 1 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 'var(--s-3)', alignItems: 'center' }}>
              <button className="btn btn--solid" type="submit" disabled={loading || !title.trim()}>
                {loading ? t('saving') : t('save')}
              </button>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setAdding(false); setTitle(''); setUrl(''); setPrice('') }}
                  className="t-small t-muted link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {t('cancel')}
                </button>
              )}
            </div>
          </form>
        ) : (
          <button className="btn btn--ghost" onClick={() => setAdding(true)}>{t('addCta')}</button>
        )}
      </div>

      {/* Aperçu live — ce que verront les invités */}
      <div>
        <p className="t-label t-muted" style={{ marginBottom: 'var(--s-6)', letterSpacing: 'var(--tracking-label)' }}>
          {t('previewLabel')}
        </p>
        <div className="card" style={{ background: 'var(--surface)' }}>
          {items.length === 0 ? (
            <p className="t-small t-muted">{t('previewEmpty')}</p>
          ) : (
            <>
              <p className="t-label t-muted" style={{ marginBottom: 'var(--s-2)', letterSpacing: 'var(--tracking-label)' }}>
                {t('guestKicker')}
              </p>
              <h3 className="t-h3" style={{ marginBottom: 'var(--s-4)' }}>{t('guestTitle', { name: ownerName })}</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {items.map(item => (
                  <li key={item.id} style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--s-3)', padding: 'var(--s-3) 0', borderTop: 'var(--border-w) solid var(--border)' }}>
                    <span style={{ color: 'var(--accent)', flexShrink: 0 }}>→</span>
                    <span className="t-body" style={{ flex: 1 }}>{item.title}</span>
                    {item.price && (
                      <span className="t-small t-muted" style={{ fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{item.price}</span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
