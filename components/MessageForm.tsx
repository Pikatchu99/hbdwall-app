'use client'
import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import { track } from '@/lib/analytics'
import { captureRefWall } from '@/lib/referral'

interface Props {
  wallSlug: string
  recipientName: string
  onSuccess: () => void
  isOwner?: boolean
}

export default function MessageForm({ wallSlug, recipientName, onSuccess, isOwner = false }: Props) {
  const t = useTranslations('messageForm')
  const [form, setForm] = useState({ authorName: '', content: '' })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (done) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
    }
  }, [done])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.content.trim()) return
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('content', form.content)
      fd.append('authorName', form.authorName)
      if (file) fd.append('photo', file)

      const res = await fetch(`/api/walls/${wallSlug}/messages`, {
        method: 'POST',
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setDone(true)
      setForm({ authorName: '', content: '' })
      setFile(null)
      track('message_submitted', { wallSlug, hasPhoto: !!file })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    const wallUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://hbdwall.xyz'}/wall/${wallSlug}`
    const waText = encodeURIComponent(`J'ai laissé un message à ${recipientName} pour son anniversaire — fais-en autant → ${wallUrl}`)
    const waUrl = `https://wa.me/?text=${waText}`

    return (
      <div className="card tint-lime" style={{ padding: 'var(--s-8)', display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
        <p className="t-h3" style={{ textAlign: 'center', marginBottom: 'var(--s-2)' }}>
          {t('successMessage', { name: recipientName })}
        </p>
        {/* <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--solid"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--s-2)', textDecoration: 'none' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          {t('shareWithFriends')}
        </a> */}
        {!isOwner && (
          <>
            <p className="t-body" style={{ textAlign: 'center' }}>{t('successHint')}</p>
            <Link
              href={`/register?from=${wallSlug}`}
              className="btn btn--solid"
              style={{ textAlign: 'center' }}
              onClick={() => {
                captureRefWall(wallSlug)
                track('visitor_clicked_create_wall_cta', { fromWallSlug: wallSlug, placement: 'post_message' })
              }}
            >
              {t('createOwnWall')}
            </Link>
            <p className="t-caption t-muted" style={{ textAlign: 'center' }}>{t('ctaSubtext')}</p>
          </>
        )}
        {/* <button
          className="t-caption t-muted"
          style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', paddingTop: 'var(--s-2)' }}
          onClick={() => setDone(false)}
        >
          {t('addAnother')}
        </button> */}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card tint-yellow" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
      <div>
        <label className="t-label" style={{ display: 'block', marginBottom: 'var(--s-2)' }}>
          {t('name')}
        </label>
        <input
          className="input"
          type="text"
          placeholder={t('namePlaceholder')}
          value={form.authorName}
          onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))}
        />
      </div>

      <div>
        <label className="t-label" style={{ display: 'block', marginBottom: 'var(--s-2)' }}>
          {t('message')} *
        </label>
        <textarea
          className="input"
          placeholder={t('messagePlaceholder')}
          rows={4}
          value={form.content}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          required
        />
      </div>

      <div>
        <label className="t-label" style={{ display: 'block', marginBottom: 'var(--s-2)' }}>
          {recipientName ? t('photo', { name: recipientName }) : t('photoGeneric')}
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => setFile(e.target.files?.[0] || null)}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)' }}>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => fileRef.current?.click()}
          >
            {file ? file.name : t('addPhoto')}
          </button>
          {file && (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = '' }}
            >
              ×
            </button>
          )}
        </div>
        {!file && (
          <p className="t-caption t-muted" style={{ marginTop: 'var(--s-1)' }}>
            {t('photoHint')}
          </p>
        )}
      </div>

      {error && <p className="t-small t-accent">{error}</p>}

      <button className="btn btn--solid" type="submit" disabled={loading}>
        {loading ? t('loading') : t('submit')}
      </button>
    </form>
  )
}
