'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { signOut } from 'next-auth/react'
import LogoMark from './LogoMark'
import LocaleSwitcher from './LocaleSwitcher'
import ThemeToggle from './ThemeToggle'
import Avatar from './Avatar'
import AvatarUploadModal from './AvatarUploadModal'

interface Me { pseudo: string; name: string; image: string | null }

export default function Nav() {
  const [me, setMe] = useState<Me | null>(null)
  const [ready, setReady] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const router = useRouter()
  const t = useTranslations('nav')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setMe(d) })
      .finally(() => setReady(true))
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    await signOut({ redirect: false })
    setMe(null)
    router.push('/')
    router.refresh()
  }

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 'var(--s-3)',
      padding: 'var(--s-4) var(--s-6)',
      borderBottom: 'var(--border-w) solid var(--border)',
    }}>
      <Link href={me ? '/dashboard' : '/'} style={{ textDecoration: 'none' }}>
        <LogoMark />
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <LocaleSwitcher />
        <ThemeToggle compact />
        {!ready ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--border)' }} />
            <div style={{ width: 60, height: 10, borderRadius: 2, background: 'var(--border)' }} />
          </div>
        ) : me ? (
          <>
            <button
              onClick={() => setShowAvatarModal(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', position: 'relative' }}
              aria-label="Changer la photo de profil"
            >
              <Avatar name={me.pseudo} src={me.image} size={28} />
            </button>
            <span className="t-caption t-muted nav-pseudo">{me.pseudo}</span>
            <button className="t-small link" onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              {t('logout')}
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn--ghost">{t('login')}</Link>
            <Link href="/register" className="btn btn--solid">{t('createWall')}</Link>
          </>
        )}
      </div>

      {showAvatarModal && me && (
        <AvatarUploadModal
          name={me.pseudo}
          currentSrc={me.image}
          onClose={() => setShowAvatarModal(false)}
          onUpdate={(image) => setMe(prev => prev ? { ...prev, image } : prev)}
        />
      )}
    </nav>
  )
}
