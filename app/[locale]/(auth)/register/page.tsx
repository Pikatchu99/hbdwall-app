'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { track } from '@/lib/analytics'
import { captureRefWall } from '@/lib/referral'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()

  // Si on arrive depuis le wall d'un proche (?from=slug), on mémorise le slug
  // d'origine avant le détour OAuth qui effacerait l'info.
  useEffect(() => {
    const from = searchParams.get('from')
    if (from) captureRefWall(from)
  }, [searchParams])

  async function handleGoogleLogin() {
    setLoading(true)
    track('signup_started', { method: 'google' })
    await signIn('google', { callbackUrl: '/google-callback' })
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
          <h1 className="t-h2" style={{ marginBottom: 'var(--s-2)' }}>Crée ton wall</h1>
          <p className="t-small t-muted" style={{ marginBottom: 'var(--s-8)' }}>
            Tes amis laissent un message, toi tu gardes le collage.
          </p>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn btn--solid"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--s-3)', width: '100%' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#fff" fillOpacity=".9" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#fff" fillOpacity=".9" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fff" fillOpacity=".9" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#fff" fillOpacity=".9" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Connexion…' : 'Continuer avec Google'}
          </button>

          <p className="t-small t-muted" style={{ marginTop: 'var(--s-6)' }}>
            Déjà un compte ?{' '}
            <Link href="/login" className="link">Se connecter</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
