'use client'
import { useEffect, useState } from 'react'
import { switchTheme } from '@/lib/theme-client'
// Bannière de découverte du nouveau look (affichée en thème classique uniquement).
// "Essayer" active le thème joyeux ; "Plus tard" la masque (mémorisé en localStorage).

function activate() {
  switchTheme('joyful')
}

export default function ThemeBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('hbd-theme-banner-dismissed')
    const isJoyful = document.cookie.includes('hbd-theme=joyful')
    if (!dismissed && !isJoyful) setShow(true)
  }, [])

  if (!show) return null

  function dismiss() {
    localStorage.setItem('hbd-theme-banner-dismissed', '1')
    setShow(false)
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap',
      gap: 'var(--s-4)', padding: 'var(--s-3) var(--s-6)',
      background: 'var(--accent)', color: 'var(--accent-ink)',
      borderBottom: '1px solid var(--border-strong)',
    }}>
      <span className="t-small" style={{ color: 'var(--accent-ink)' }}>
        ✨ Un nouveau look plus coloré et festif est disponible.
      </span>
      <div style={{ display: 'flex', gap: 'var(--s-3)', alignItems: 'center' }}>
        <button
          onClick={activate}
          className="btn"
          style={{ background: 'var(--accent-ink)', color: 'var(--accent)', borderColor: 'var(--accent-ink)' }}
        >
          Essayer →
        </button>
        <button
          onClick={dismiss}
          className="t-caption"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-ink)', opacity: 0.85 }}
        >
          Plus tard
        </button>
      </div>
    </div>
  )
}
