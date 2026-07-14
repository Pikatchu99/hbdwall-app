'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import PushNotifToggle from '@/components/PushNotifToggle'
import Nav from '@/components/Nav'
import ShareCard from '@/components/ShareCard'
import { track } from '@/lib/analytics'
import { useLocale } from 'next-intl'

const OCCASION_PRESETS = [
  'Anniversaire',
  'Départ',
  'Retraite',
  'Fête surprise',
]

export default function CreatePage() {
  const t = useTranslations('create')
  const locale = useLocale()
  const [form, setForm] = useState({ recipientName: '', occasion: '', date: '', description: '' })
  const [customOccasion, setCustomOccasion] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState<{ slug: string; recipientName: string; date: string } | null>(null)

  function selectOccasion(occasion: string) {
    setForm(f => ({ ...f, occasion }))
    setCustomOccasion(false)
  }

  function activateCustom() {
    setCustomOccasion(true)
    setForm(f => ({ ...f, occasion: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/walls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.occasion,
        recipientName: form.recipientName,
        date: form.date,
        description: form.description,
        locale,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Erreur')
      setLoading(false)
      return
    }
    setCreated({ slug: data.slug, recipientName: form.recipientName, date: form.date })
    track('wall_created', { source: 'create' })
  }

  const canSubmit = form.recipientName.trim() && form.occasion && form.date

  if (created) {
    const wallUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://hbdwall.xyz'}/wall/${created.slug}`
    const waText = encodeURIComponent(`Laisse un message pour ${created.recipientName} avant le ${new Date(created.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} → ${wallUrl}`)
    const waUrl = `https://wa.me/?text=${waText}`

    return (
      <main style={{ minHeight: '100vh' }}>
        <Nav />
        <div style={{ maxWidth: '520px', margin: '0 auto', padding: 'var(--s-8)', display: 'flex', flexDirection: 'column', gap: 'var(--s-8)' }}>
          <div>
            <p className="t-label t-muted" style={{ marginBottom: 'var(--s-3)', letterSpacing: '0.1em' }}>MUR CRÉÉ</p>
            <h1 className="t-h1" style={{ marginBottom: 'var(--s-3)' }}>Le mur de {created.recipientName} est prêt !</h1>
            <p className="t-body t-muted">Partage le lien — tes amis peuvent laisser un message sans créer de compte.</p>
          </div>

          <ShareCard slug={created.slug} />

          <PushNotifToggle />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
            <p className="t-label">PARTAGER DIRECTEMENT</p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--solid"
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)', textDecoration: 'none', alignSelf: 'flex-start' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Envoyer sur WhatsApp
            </a>
          </div>

          <div style={{ borderTop: 'var(--border-w) solid var(--border)', paddingTop: 'var(--s-6)', display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
            <Link href={`/wall/${created.slug}/admin`} className="btn btn--ghost">
              Gérer le mur →
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh' }}>
      <Nav />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--s-8)' }}>
        <Link href="/dashboard" className="t-label t-muted" style={{ textDecoration: 'none', display: 'block', marginBottom: 'var(--s-6)' }}>
          {t('back')}
        </Link>
        <h1 className="t-h1" style={{ marginBottom: 'var(--s-2)' }}>Créer un mur pour quelqu'un</h1>
        <p className="t-small t-muted" style={{ marginBottom: 'var(--s-8)' }}>
          Un espace où ses proches peuvent laisser un mot pour l'occasion.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-8)' }}>

          <div>
            <label className="t-label" style={{ display: 'block', marginBottom: 'var(--s-2)' }}>
              C'est pour qui ? *
            </label>
            <input
              className="input"
              type="text"
              placeholder="Prénom de la personne"
              value={form.recipientName}
              onChange={e => setForm(f => ({ ...f, recipientName: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="t-label" style={{ display: 'block', marginBottom: 'var(--s-3)' }}>
              Pour quelle occasion ? *
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)', marginBottom: 'var(--s-3)' }}>
              {OCCASION_PRESETS.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => selectOccasion(preset)}
                  className={`btn ${form.occasion === preset && !customOccasion ? 'btn--solid' : 'btn--ghost'}`}
                >
                  {preset}
                </button>
              ))}
              <button
                type="button"
                onClick={activateCustom}
                className={`btn ${customOccasion ? 'btn--solid' : 'btn--ghost'}`}
              >
                {t('customTitle')}
              </button>
            </div>

            {customOccasion && (
              <input
                className="input"
                type="text"
                placeholder="Ex: Promotion, Mariage…"
                value={form.occasion}
                onChange={e => setForm(f => ({ ...f, occasion: e.target.value }))}
                autoFocus
                required
              />
            )}

            {form.recipientName && form.occasion && (
              <p className="t-small t-muted">
                Le mur s'appellera : <strong>{form.occasion} de {form.recipientName}</strong>
              </p>
            )}
          </div>

          <div>
            <label className="t-label" style={{ display: 'block', marginBottom: 'var(--s-2)' }}>
              {t('dateLabel')} *
            </label>
            <input
              className="input"
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="t-label" style={{ display: 'block', marginBottom: 'var(--s-2)' }}>
              {t('descLabel')}
            </label>
            <textarea
              className="input"
              placeholder={t('descPlaceholder')}
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          {error && <p className="t-small t-accent">{error}</p>}

          <button
            className="btn btn--solid"
            type="submit"
            disabled={loading || !canSubmit}
          >
            {loading ? t('loading') : t('submit')}
          </button>
        </form>
      </div>
    </main>
  )
}
