'use client'
import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { track } from '@/lib/analytics'

// Carte unifiée de partage du mur : aperçu de la carte d'anniversaire (générée à la
// volée), lien à copier, et télécharger / partager l'image. Tout est i18n.
export default function ShareCard({ slug }: { slug: string }) {
  const t = useTranslations('shareCard')
  const locale = useLocale()
  const [theme, setTheme] = useState<'classic' | 'joyful'>('joyful')
  const cardUrl = `/api/walls/${slug}/card?locale=${locale}&theme=${theme}`
  const [loaded, setLoaded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState<null | 'dl' | 'share'>(null)
  const [fullUrl, setFullUrl] = useState('')

  useEffect(() => {
    setFullUrl(`${window.location.origin}/wall/${slug}`)
    // La carte suit le thème actif (classique / joyeux).
    setTheme(document.cookie.includes('hbd-theme=joyful') ? 'joyful' : 'classic')
  }, [slug])

  function copy() {
    navigator.clipboard.writeText(fullUrl || `/wall/${slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    track('wall_link_copied', { slug })
  }

  async function getBlob() {
    const res = await fetch(cardUrl)
    if (!res.ok) throw new Error('card')
    return res.blob()
  }

  async function download() {
    setBusy('dl')
    try {
      const blob = await getBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hbdwall-${slug}.png`
      a.click()
      URL.revokeObjectURL(url)
      // Copie aussi le lien dans le presse-papier au téléchargement.
      navigator.clipboard?.writeText(fullUrl || `${window.location.origin}/wall/${slug}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      track('card_downloaded', { slug })
    } catch {} finally { setBusy(null) }
  }

  async function share() {
    setBusy('share')
    try {
      const blob = await getBlob()
      const file = new File([blob], `hbdwall-${slug}.png`, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] })
        track('card_shared', { slug })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `hbdwall-${slug}.png`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch {} finally { setBusy(null) }
  }

  const displayUrl = fullUrl ? fullUrl.replace(/^https?:\/\//, '') : `…/wall/${slug}`

  return (
    <div className="card tint-violet" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
      <div>
        <p className="t-label" style={{ marginBottom: 'var(--s-1)' }}>{t('title')}</p>
        <p className="t-caption t-muted">{t('subtitle')}</p>
      </div>

      {/* Aperçu (avec loader, taille contenue) */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: 380, margin: '0 auto',
        aspectRatio: '1080 / 1350', borderRadius: 16, overflow: 'hidden',
        border: 'var(--border-w) solid var(--border)', background: 'var(--surface)',
      }}>
        {!loaded && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--s-4)' }}>
            <span className="t-caption t-muted" style={{ textAlign: 'center' }}>{t('loading')}</span>
          </div>
        )}
        <img
          src={cardUrl}
          alt=""
          onLoad={() => setLoaded(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: loaded ? 1 : 0, transition: 'opacity .3s ease' }}
        />
      </div>

      {/* Lien + copier */}
      <div>
        <p className="t-label" style={{ marginBottom: 'var(--s-2)' }}>{t('linkLabel')}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)', minWidth: 0 }}>
          <span className="t-small t-muted" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
            {displayUrl}
          </span>
          <button onClick={copy} className="btn btn--ghost" style={{ flexShrink: 0 }}>
            {copied ? t('copied') : t('copy')}
          </button>
        </div>
      </div>

      {/* Actions carte */}
      <div style={{ display: 'flex', gap: 'var(--s-3)', flexWrap: 'wrap' }}>
        <button className="btn btn--solid" onClick={share} disabled={busy !== null}>
          {busy === 'share' ? '…' : t('share')}
        </button>
        <button className="btn btn--ghost" onClick={download} disabled={busy !== null}>
          {busy === 'dl' ? '…' : t('download')}
        </button>
      </div>
    </div>
  )
}
