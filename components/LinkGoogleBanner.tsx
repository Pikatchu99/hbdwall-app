'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { track } from '@/lib/analytics'

export default function LinkGoogleBanner() {
  const t = useTranslations('dashboard')
  const [loading, setLoading] = useState(false)

  async function handleLink() {
    setLoading(true)
    track('google_link_clicked')
    await fetch('/api/auth/link-google-start', { method: 'POST' })
    await signIn('google', { callbackUrl: '/google-callback' })
  }

  return (
    <div style={{ background: 'var(--fg)', color: 'var(--bg)', padding: 'var(--s-3) var(--s-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--s-4)', flexWrap: 'wrap' }}>
      <p className="t-small">{t('linkGoogleLabel')}</p>
      <button
        onClick={handleLink}
        disabled={loading}
        className="t-small"
        style={{ color: 'var(--bg)', fontWeight: 700, textDecoration: 'underline', whiteSpace: 'nowrap', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        {loading ? t('linkGoogleLoading') : t('linkGoogleCta')}
      </button>
    </div>
  )
}
