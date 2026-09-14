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
  /** Amorces d'écriture : placeholder tournant + puces cliquables (murs signature). */
  prompts?: string[]
  /** Vocal joué une fois le message envoyé (murs signature). */
  thanksAudio?: string
}

export default function MessageForm({ wallSlug, recipientName, onSuccess, isOwner = false, prompts, thanksAudio }: Props) {
  const t = useTranslations('messageForm')
  const [form, setForm] = useState({ authorName: '', content: '' })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const [promptIndex, setPromptIndex] = useState(0)
  const thanksRef = useRef<HTMLAudioElement | null>(null)

  // Précharge le vocal pour qu'il parte sans latence après l'envoi.
  useEffect(() => {
    if (!thanksAudio) return
    const a = new Audio(thanksAudio)
    a.preload = 'auto'
    thanksRef.current = a
    return () => { a.pause(); thanksRef.current = null }
  }, [thanksAudio])

  // Débloque la lecture pendant le clic (Safari/iOS exigent un geste), puis
  // laisse l'appel réseau se faire ; le vrai play() a lieu au succès.
  function unlockThanks() {
    const a = thanksRef.current
    if (!a) return
    a.muted = true
    a.play().then(() => { a.pause(); a.currentTime = 0; a.muted = false }).catch(() => { a.muted = false })
  }

  // Le placeholder tourne parmi les amorces tant que le champ est vide.
  useEffect(() => {
    if (!prompts?.length || form.content) return
    const id = setInterval(() => setPromptIndex(i => (i + 1) % prompts.length), 3500)
    return () => clearInterval(id)
  }, [prompts, form.content])

  function usePrompt(p: string) {
    setForm(f => ({ ...f, content: f.content ? `${f.content.trimEnd()}\n${p} ` : `${p} ` }))
    textRef.current?.focus()
  }

  useEffect(() => {
    if (done) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
    }
  }, [done])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.content.trim()) return
    unlockThanks()
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
      thanksRef.current?.play().catch(() => {})
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
    return (
      <div className="card tint-lime" style={{ padding: 'var(--s-8)', display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
        <p className="t-h3" style={{ textAlign: 'center', marginBottom: 'var(--s-2)' }}>
          {t('successMessage', { name: recipientName })}
        </p>
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
          ref={textRef}
          className="input"
          placeholder={prompts?.length ? prompts[promptIndex] : t('messagePlaceholder')}
          rows={4}
          value={form.content}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          required
        />
        {prompts && prompts.length > 0 && (
          <div className="prompt-chips" aria-label="Idées">
            {prompts.slice(0, 3).map(p => (
              <button key={p} type="button" className="prompt-chip" onClick={() => usePrompt(p)}>
                {p}
              </button>
            ))}
          </div>
        )}
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
