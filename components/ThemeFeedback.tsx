'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { track } from '@/lib/analytics'

// Petit retour sur le nouveau look (affiché sur la landing joyeuse) : J'aime / Bof.
// Envoie l'avis à Umami (event "theme-feedback"). Une seule fois (localStorage).
export default function ThemeFeedback() {
  const t = useTranslations('joyfulLanding')
  const [state, setState] = useState<'hidden' | 'ask' | 'thanks'>('hidden')

  useEffect(() => {
    if (localStorage.getItem('hbd-theme-vote')) return
    const id = setTimeout(() => setState('ask'), 3500)
    return () => clearTimeout(id)
  }, [])

  function vote(v: 'like' | 'dislike') {
    track('theme-feedback', { vote: v })
    localStorage.setItem('hbd-theme-vote', v)
    setState('thanks')
    setTimeout(() => setState('hidden'), 2200)
  }
  function dismiss() {
    localStorage.setItem('hbd-theme-vote', 'dismissed')
    setState('hidden')
  }

  if (state === 'hidden') return null
  return (
    <div className="theme-fb" data-theme="joyful" role="dialog" aria-label={t('feedback.q')}>
      {state === 'thanks' ? (
        <span className="theme-fb-thanks">{t('feedback.thanks')}</span>
      ) : (
        <>
          <span className="theme-fb-q">{t('feedback.q')}</span>
          <div className="theme-fb-actions">
            <button type="button" onClick={() => vote('like')} className="theme-fb-btn theme-fb-btn--yes">{t('feedback.like')}</button>
            <button type="button" onClick={() => vote('dislike')} className="theme-fb-btn">{t('feedback.dislike')}</button>
          </div>
          <button type="button" onClick={dismiss} className="theme-fb-x" aria-label="Fermer">×</button>
        </>
      )}
    </div>
  )
}
