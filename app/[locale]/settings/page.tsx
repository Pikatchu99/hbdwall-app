'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { useTranslations } from 'next-intl'
import { signIn } from 'next-auth/react'
import { SiInstagram, SiTiktok } from '@icons-pack/react-simple-icons'
import ThemeToggle from '@/components/ThemeToggle'

export default function SettingsPage() {
  const t = useTranslations('settings')
  const [form, setForm] = useState({ currentPin: '', newPin: '', confirmPin: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  const [profile, setProfile] = useState({ name: '', tiktokHandle: '', instagramHandle: '' })
  const [authProvider, setAuthProvider] = useState<string | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(data => {
      if (data) {
        setProfile({
          name: data.name ?? '',
          tiktokHandle: data.tiktokHandle ?? '',
          instagramHandle: data.instagramHandle ?? '',
        })
        setAuthProvider(data.authProvider ?? 'pin')
      }
    })
  }, [])

  async function handleLinkGoogle() {
    setGoogleLoading(true)
    await fetch('/api/auth/link-google-start', { method: 'POST' })
    await signIn('google', { callbackUrl: '/google-callback' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.newPin !== form.confirmPin) {
      setError(t('pinMismatch'))
      return
    }
    setLoading(true)
    const res = await fetch('/api/settings/pin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPin: form.currentPin, newPin: form.newPin }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || t('error'))
    } else {
      setSuccess(true)
      setForm({ currentPin: '', newPin: '', confirmPin: '' })
    }
    setLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh' }}>
      <Nav />
      <div style={{ maxWidth: '620px', margin: '0 auto', padding: 'var(--s-8) var(--s-4)' }}>

        <div style={{ marginBottom: 'var(--s-8)', paddingBottom: 'var(--s-6)', borderBottom: 'var(--border-w) solid var(--border)' }}>
          <Link href="/dashboard" className="t-label t-muted" style={{ textDecoration: 'none', display: 'block', marginBottom: 'var(--s-3)' }}>
            {t('back')}
          </Link>
          <h1 className="t-h1">{t('title')}</h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
        <div className="panel tint-violet" style={{ padding: 'var(--s-6)' }}>
          <p className="t-label" style={{ marginBottom: 'var(--s-6)' }}>{t('profileTitle')}</p>
          <form
            onSubmit={async e => {
              e.preventDefault()
              setProfileLoading(true)
              setProfileError('')
              const res = await fetch('/api/auth/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
              })
              setProfileLoading(false)
              if (!res.ok) {
                const data = await res.json()
                setProfileError(data.error || t('error'))
                return
              }
              setProfileSaved(true)
              setTimeout(() => setProfileSaved(false), 3000)
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-5)' }}
          >
            <div>
              <label className="t-label" style={{ display: 'block', marginBottom: 'var(--s-2)' }}>{t('profileName')}</label>
              <input
                className="input"
                type="text"
                value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div id="reseaux-sociaux" style={{ paddingTop: 'var(--s-2)' }}>
              <p className="t-label" style={{ marginBottom: 'var(--s-1)' }}>Réseaux sociaux</p>
              <p className="t-caption t-muted" style={{ marginBottom: 'var(--s-4)' }}>Pour être mis en avant sur Instagram & TikTok</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
                <div>
                  <label className="t-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)', marginBottom: 'var(--s-2)' }}>
                    <SiInstagram size={14} /> Instagram
                  </label>
                  <input
                    className="input"
                    type="text"
                    placeholder="@votre_pseudo"
                    value={profile.instagramHandle}
                    onChange={e => setProfile(p => ({ ...p, instagramHandle: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="t-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)', marginBottom: 'var(--s-2)' }}>
                    <SiTiktok size={14} /> TikTok
                  </label>
                  <input
                    className="input"
                    type="text"
                    placeholder="@votre_pseudo"
                    value={profile.tiktokHandle}
                    onChange={e => setProfile(p => ({ ...p, tiktokHandle: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {profileError && <p className="t-small t-accent">{profileError}</p>}
            {profileSaved && <p className="t-small">{t('profileSaved')}</p>}
            <button className="btn btn--solid" type="submit" disabled={profileLoading} style={{ alignSelf: 'flex-start', marginTop: 'var(--s-3)' }}>
              {profileLoading ? t('profileSaving') : t('profileSave')}
            </button>
          </form>
        </div>

        {authProvider === 'pin' && (
          <div className="panel tint-lime" style={{ padding: 'var(--s-6)', display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
            <div>
              <p className="t-label" style={{ marginBottom: 'var(--s-2)' }}>Connexion Google</p>
              <p className="t-small t-muted" style={{ marginBottom: 'var(--s-4)' }}>Lie ton compte Google pour ne plus jamais taper de PIN.</p>
              <button
                type="button"
                onClick={handleLinkGoogle}
                disabled={googleLoading}
                className="btn"
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {googleLoading ? 'Chargement…' : 'Lier mon compte Google'}
              </button>
            </div>

            <div style={{ borderTop: 'var(--border-w) solid var(--border)', paddingTop: 'var(--s-6)' }}>
              <p className="t-label" style={{ marginBottom: 'var(--s-6)' }}>{t('changePinTitle')}</p>
              {success ? (
                <div>
                  <p className="t-small" style={{ marginBottom: 'var(--s-4)' }}>{t('pinChanged')}</p>
                  <button className="btn btn--ghost" onClick={() => setSuccess(false)}>{t('changeAgain')}</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-5)' }}>
                  <div>
                    <label className="t-label" style={{ display: 'block', marginBottom: 'var(--s-2)' }}>{t('currentPin')}</label>
                    <input className="input" type="password" placeholder="····" maxLength={4} value={form.currentPin}
                      onChange={e => setForm(f => ({ ...f, currentPin: e.target.value.replace(/\D/g, '') }))} required style={{ letterSpacing: '0.3em' }} />
                  </div>
                  <div>
                    <label className="t-label" style={{ display: 'block', marginBottom: 'var(--s-2)' }}>{t('newPin')}</label>
                    <input className="input" type="password" placeholder="····" maxLength={4} value={form.newPin}
                      onChange={e => setForm(f => ({ ...f, newPin: e.target.value.replace(/\D/g, '') }))} required style={{ letterSpacing: '0.3em' }} />
                  </div>
                  <div>
                    <label className="t-label" style={{ display: 'block', marginBottom: 'var(--s-2)' }}>{t('confirmPin')}</label>
                    <input className="input" type="password" placeholder="····" maxLength={4} value={form.confirmPin}
                      onChange={e => setForm(f => ({ ...f, confirmPin: e.target.value.replace(/\D/g, '') }))} required style={{ letterSpacing: '0.3em' }} />
                  </div>
                  {error && <p className="t-small t-accent">{error}</p>}
                  <button className="btn btn--solid" type="submit" disabled={loading} style={{ alignSelf: 'flex-start', marginTop: 'var(--s-3)' }}>
                    {loading ? t('saving') : t('save')}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        </div>

        {authProvider !== null && authProvider !== 'pin' && (
          <p className="t-caption t-muted" style={{ marginTop: 'var(--s-4)' }}>
            Connexion Google active — aucun PIN requis.
          </p>
        )}

        <div style={{ marginTop: 'var(--s-8)', paddingTop: 'var(--s-6)', borderTop: 'var(--border-w) solid var(--border)' }}>
          <p className="t-label" style={{ marginBottom: 'var(--s-3)' }}>APPARENCE</p>
          <ThemeToggle />
        </div>

        <div style={{ marginTop: 'var(--s-8)', paddingTop: 'var(--s-6)', borderTop: 'var(--border-w) solid var(--border)' }}>
          <Link href="/nouveautes" className="t-small t-muted link">{t('whatsNew')}</Link>
        </div>

      </div>
    </main>
  )
}
