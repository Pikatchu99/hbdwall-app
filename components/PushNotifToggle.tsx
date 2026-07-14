'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { track } from '@/lib/analytics'

function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function isInStandaloneMode() {
  return Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
}

export default function PushNotifToggle({ compact = false, hideWhenActive = false }: { compact?: boolean; hideWhenActive?: boolean }) {
  const t = useTranslations('dashboard')
  const [status, setStatus] = useState<'loading' | 'unsupported' | 'ios-not-installed' | 'denied' | 'subscribed' | 'unsubscribed'>('loading')

  useEffect(() => {
    if (isIOS()) {
      if (!isInStandaloneMode()) {
        setStatus('ios-not-installed')
        return
      }
    }
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setStatus('denied')
      return
    }
    navigator.serviceWorker.register('/sw.js').then(() =>
      navigator.serviceWorker.ready
    ).then(reg =>
      reg.pushManager.getSubscription()
    ).then(sub => {
      setStatus(sub ? 'subscribed' : 'unsubscribed')
    }).catch(() => {
      setStatus('unsupported')
    })
  }, [])

  async function subscribe() {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    })
    await fetch('/api/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub.toJSON()),
    })
    track('push_subscribed')
    setStatus('subscribed')
  }

  async function unsubscribe() {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      await fetch('/api/push', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      })
      await sub.unsubscribe()
    }
    track('push_unsubscribed')
    setStatus('unsubscribed')
  }

  if (status === 'loading' || status === 'unsupported') return null
  if (status === 'subscribed' && hideWhenActive) return null

  if (status === 'ios-not-installed') {
    return (
      <div className="panel tint-magenta" style={{ padding: 'var(--s-4)', display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
        <p className="t-small" style={{ fontWeight: 700 }}>{t('pushIosHint')}</p>
        <p className="t-caption t-muted">{t('pushIosInstructions')}</p>
      </div>
    )
  }

  if (status === 'denied') return (
    <p className="t-caption t-muted">{t('pushDenied')}</p>
  )

  if (compact) {
    return (
      <button
        onClick={status === 'subscribed' ? unsubscribe : subscribe}
        className={status === 'subscribed' ? 'btn btn--ghost' : 'btn btn--solid'}
      >
        {status === 'subscribed' ? t('pushDisable') : t('pushEnable')}
      </button>
    )
  }

  return (
    <div className="panel tint-violet" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)', padding: 'var(--s-4)' }}>
      <div>
        <p className="t-small" style={{ fontWeight: 700, marginBottom: 'var(--s-1)' }}>{t('pushTitle')}</p>
        <p className="t-caption t-muted">{t('pushSubtitle')}</p>
      </div>
      <button
        onClick={status === 'subscribed' ? unsubscribe : subscribe}
        className={status === 'subscribed' ? 'btn btn--ghost' : 'btn btn--solid'}
        style={{ fontSize: '11px', alignSelf: 'flex-start' }}
      >
        {status === 'subscribed' ? t('pushDisable') : t('pushEnable')}
      </button>
    </div>
  )
}
