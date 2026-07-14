'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { signIn } from 'next-auth/react'
import { track } from '@/lib/analytics'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('login')
  const [form, setForm] = useState({ pseudo: '', code: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const oauthError = searchParams.get('error')

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    track('login_started', { method: 'google' })
    await signIn('google', { callbackUrl: '/google-callback' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || t('error'))
      setLoading(false)
      return
    }
    track('login_success', { method: 'pin' })
    router.push(data.isAdmin ? '/admin' : '/dashboard')
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ padding: 'var(--s-4) var(--s-8)', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" className="t-label" style={{ textDecoration: 'none', color: 'var(--fg-muted)' }}>
          ← BIRTHDAYWALL
        </Link>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--s-8)' }}>
        <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
          <h1 className="t-h2" style={{ marginBottom: oauthError === 'OAuthAccountNotLinked' ? 'var(--s-4)' : 'var(--s-8)' }}>{t('title')}</h1>

          {oauthError === 'OAuthAccountNotLinked' && (
            <div style={{ background: 'var(--accent-subtle, #fff3cd)', border: '1px solid var(--accent, #e6a817)', borderRadius: 4, padding: 'var(--s-3) var(--s-4)', marginBottom: 'var(--s-6)' }}>
              <p className="t-small">Un compte existe déjà avec cet email. Connecte-toi avec ton pseudo + PIN ci-dessous, puis lie ton Google depuis le dashboard.</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="btn"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--s-3)', width: '100%', marginBottom: 'var(--s-6)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? 'Connexion…' : 'Continuer avec Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-4)', marginBottom: 'var(--s-6)' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span className="t-caption t-muted">ou</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
            <div>
              <label className="t-label" style={{ display: 'block', marginBottom: 'var(--s-2)' }}>
                {t('pseudo')}
              </label>
              <input
                className="input"
                type="text"
                placeholder="ton-pseudo"
                value={form.pseudo}
                onChange={e => setForm(f => ({ ...f, pseudo: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="t-label" style={{ display: 'block', marginBottom: 'var(--s-2)' }}>
                {t('code')}
              </label>
              <input
                className="input"
                type="password"
                placeholder="····"
                maxLength={4}
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.replace(/\D/g, '') }))}
                required
                style={{ letterSpacing: '0.3em' }}
              />
            </div>

            {error && <p className="t-small t-accent">{error}</p>}

            <button className="btn btn--solid" type="submit" disabled={loading}>
              {loading ? t('loading') : t('submit')}
            </button>
          </form>

          <p className="t-small t-muted" style={{ marginTop: 'var(--s-6)' }}>
            {t('noAccount')}{' '}
            <Link href="/register" className="link">{t('registerLink')}</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
