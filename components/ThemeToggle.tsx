'use client'
import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { switchTheme } from '@/lib/theme-client'
// Toggle opt-in du thème "Sable Joyeux". Pose le cookie (lu au rendu serveur) et
// recharge avec une transition "portail spatial". Défaut = classique ; réversible.

type Theme = 'classic' | 'joyful'

const apply = (theme: Theme) => switchTheme(theme)

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const t = useTranslations('themeToggle')
  const [theme, setTheme] = useState<Theme | null>(null)
  useEffect(() => {
    setTheme(document.cookie.includes('hbd-theme=joyful') ? 'joyful' : 'classic')
  }, [])

  if (theme === null) return null // évite tout flash avant hydratation

  const joyful = theme === 'joyful'

  // Version navbar : petit bouton à côté du switcher de langue.
  if (compact) {
    return (
      <button
        onClick={() => apply(joyful ? 'classic' : 'joyful')}
        className="btn btn--ghost"
        style={{ fontSize: '11px', padding: '4px 8px' }}
        title={joyful ? t('titleOn') : t('titleOff')}
      >
        <Sparkles size={12} aria-hidden />
        <span className="tt-label">{joyful ? t('compactOn') : t('compactOff')}</span>
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)', alignItems: 'flex-start' }}>
      <p className="t-small t-muted">{joyful ? t('descOn') : t('descOff')}</p>
      {joyful ? (
        <button onClick={() => apply('classic')} className="btn btn--ghost">{t('btnOn')}</button>
      ) : (
        <button onClick={() => apply('joyful')} className="btn btn--solid">{t('btnOff')}</button>
      )}
    </div>
  )
}
