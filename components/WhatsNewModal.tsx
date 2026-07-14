'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { useLocale } from 'next-intl'
import { STORAGE_KEY, WHATS_NEW_FEATURES, WHATS_NEW_VERSION } from '@/lib/whats-new'
import { track } from '@/lib/analytics'

export default function WhatsNewModal() {
  const [open, setOpen] = useState(false)
  const locale = useLocale()
  const isFr = locale === 'fr'

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setOpen(true)
      track('whats_new_modal_open', { version: WHATS_NEW_VERSION })
    }
  }, [])

  function dismiss(source: 'close' | 'got_it' | 'backdrop') {
    localStorage.setItem(STORAGE_KEY, '1')
    setOpen(false)
    track('whats_new_modal_dismiss', { source, version: WHATS_NEW_VERSION })
  }

  if (!open) return null

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--s-4)' }}
      onClick={() => dismiss('backdrop')}
    >
      <div
        style={{ background: 'var(--surface)', border: '1px solid var(--border-strong)', padding: 'var(--s-8)', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--s-6)' }}>
          <div>
            <p className="t-label" style={{ color: 'var(--accent)', marginBottom: 'var(--s-1)' }}>
              {isFr ? 'MISE À JOUR' : 'UPDATE'}
            </p>
            <h2 className="t-h2">{isFr ? 'Quoi de neuf ?' : "What's new?"}</h2>
          </div>
          <button onClick={() => dismiss('close')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', display: 'flex', alignItems: 'center' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
          {WHATS_NEW_FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.titleEn}
                style={{
                  display: 'flex',
                  gap: 'var(--s-4)',
                  padding: 'var(--s-4)',
                  border: f.highlight ? '1px solid var(--accent)' : '1px solid var(--border)',
                }}
              >
                <Icon size={20} color={f.highlight ? 'var(--accent)' : 'var(--fg-muted)'} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p className="t-body" style={{ fontWeight: 700, marginBottom: 'var(--s-1)' }}>
                    {isFr ? f.title : f.titleEn}
                  </p>
                  <p className="t-body t-muted">{isFr ? f.desc : f.descEn}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 'var(--s-3)', marginTop: 'var(--s-6)' }}>
          <Link
            href="/nouveautes"
            onClick={() => { dismiss('close'); track('whats_new_learn_more', { version: WHATS_NEW_VERSION }) }}
            className="btn btn--ghost"
            style={{ flex: 1, textAlign: 'center' }}
          >
            {isFr ? 'Lire plus' : 'Learn more'}
          </Link>
          <button onClick={() => dismiss('got_it')} className="btn btn--solid" style={{ flex: 2 }}>
            {isFr ? "C'est parti" : "Got it"}
          </button>
        </div>
      </div>
    </div>
  )
}
