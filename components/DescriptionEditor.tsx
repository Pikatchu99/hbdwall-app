'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function DescriptionEditor({ slug, initial }: { slug: string; initial: string | null }) {
  const t = useTranslations('descriptionEditor')
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState(initial)
  const [value, setValue] = useState(initial ?? '')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    const description = value.trim() || null
    await fetch(`/api/walls/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    })
    setSaved(description)
    setSaving(false)
    setOpen(false)
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', flexWrap: 'wrap' }}>
        <button
          onClick={() => setOpen(true)}
          className="btn btn--ghost"
          style={{ fontSize: '12px', padding: '4px 10px' }}
        >
          {saved ? t('edit') : t('add')}
        </button>
      </div>
      {saved && (
        <p className="t-small t-muted" style={{ fontStyle: 'italic', marginTop: 'var(--s-1)' }}>
          {saved}
        </p>
      )}

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100, padding: 'var(--s-4)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="card"
            style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}
          >
            <p className="t-label">{t('modalTitle')}</p>
            <textarea
              className="input"
              rows={4}
              placeholder={t('placeholder')}
              value={value}
              onChange={e => setValue(e.target.value)}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 'var(--s-3)', justifyContent: 'flex-end' }}>
              <button className="btn btn--ghost" onClick={() => setOpen(false)}>{t('cancel')}</button>
              <button className="btn btn--solid" onClick={save} disabled={saving}>
                {saving ? t('saving') : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
