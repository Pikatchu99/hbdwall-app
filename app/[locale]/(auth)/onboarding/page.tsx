'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import CopyButton from '@/components/CopyButton'
import PushNotifToggle from '@/components/PushNotifToggle'
import WishlistEditor from '@/components/WishlistEditor'
import { track } from '@/lib/analytics'
import { REF_WALL_KEY } from '@/lib/referral'

const WA_ICON = <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>

export default function OnboardingPage() {
  const locale = useLocale()
  const tw = useTranslations('wishlist')
  const searchParams = useSearchParams()

  // Step 1 state
  const [pseudo, setPseudo] = useState('')
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [step1Loading, setStep1Loading] = useState(false)
  const [step1Error, setStep1Error] = useState('')

  // Step 2 state
  const [tiktok, setTiktok] = useState('')
  const [instagram, setInstagram] = useState('')
  const [step2Loading, setStep2Loading] = useState(false)
  const [step2Error, setStep2Error] = useState('')

  // Navigation
  const [wallSlug, setWallSlug] = useState<string | null>(null)
  const [wishlistDone, setWishlistDone] = useState(false)
  const [showPush, setShowPush] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const p = searchParams.get('pseudo')
    const n = searchParams.get('name')
    if (p) setPseudo(p)
    if (n) setName(n)
  }, [searchParams])

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    setStep1Loading(true)
    setStep1Error('')

    const referrerWallSlug = typeof window !== 'undefined' ? sessionStorage.getItem(REF_WALL_KEY) : null

    const res = await fetch('/api/auth/google-onboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, locale, pseudo, name, referrerWallSlug }),
    })
    const data = await res.json()

    if (!res.ok) {
      setStep1Error(data.error || 'Erreur')
      setStep1Loading(false)
      return
    }

    // Un créateur est né : c'est le vrai dénominateur du loop viral.
    track('wall_created', { source: 'signup', referrerWallSlug: referrerWallSlug || null })
    track('onboarding_step_completed', { step: 1 })
    if (referrerWallSlug) {
      track('guest_to_creator_converted', { referrerWallSlug })
      sessionStorage.removeItem(REF_WALL_KEY)
    }

    setWallSlug(data.wallSlug)
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault()
    if (!tiktok.trim() && !instagram.trim()) {
      setStep2Error(locale === 'fr' ? 'Remplis au moins un handle, ou passe cette étape.' : 'Fill in at least one handle, or skip this step.')
      return
    }
    setStep2Error('')
    setStep2Loading(true)

    await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tiktokHandle: tiktok,
        instagramHandle: instagram,
      }),
    })

    track('onboarding_step_completed', { step: 2, skipped: false })
    setShowPush(true)
  }

  const nav = (
    <nav style={{ padding: 'var(--s-4) var(--s-8)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
      <Link href="/" className="t-label" style={{ textDecoration: 'none', color: 'var(--fg-muted)' }}>← BIRTHDAYWALL</Link>
    </nav>
  )

  // Step 3 — push notifications
  if (showPush && !done && wallSlug) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {nav}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--s-8)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
            <p className="t-label t-muted" style={{ marginBottom: 'var(--s-3)', letterSpacing: '0.1em' }}>{locale === 'fr' ? 'DERNIÈRE ÉTAPE' : 'LAST STEP'}</p>
            <h1 className="t-h2" style={{ marginBottom: 'var(--s-2)' }}>
              {locale === 'fr' ? 'Sois notifié dès qu\'un ami écrit' : 'Get notified when a friend writes'}
            </h1>
            <p className="t-small t-muted" style={{ marginBottom: 'var(--s-8)' }}>
              {locale === 'fr'
                ? 'Active les notifications pour recevoir un message dès qu\'un ami laisse un mot sur ton wall.'
                : 'Enable notifications to get alerted as soon as a friend leaves a message on your wall.'}
            </p>
            <PushNotifToggle compact />
            <button
              className="btn btn--solid"
              onClick={() => { track('onboarding_step_completed', { step: 3 }); setDone(true) }}
              style={{ marginTop: 'var(--s-6)', width: '100%' }}
            >
              {locale === 'fr' ? 'Continuer →' : 'Continue →'}
            </button>
          </div>
        </div>
      </main>
    )
  }

  // Step 4 — success
  if (done && wallSlug) {
    const wallUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://hbdwall.xyz'}/wall/${wallSlug}`
    const shareText = locale === 'fr'
      ? `Laisse-moi un message pour mon anniversaire → ${wallUrl}`
      : `Leave me a birthday message → ${wallUrl}`

    async function handleShare() {
      if (navigator.share) {
        await navigator.share({ text: shareText, url: wallUrl })
      } else {
        await navigator.clipboard.writeText(wallUrl)
      }
    }

    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {nav}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--s-8)' }}>
          <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: 'var(--s-8)' }}>
            <div>
              <p className="t-label" style={{ color: 'var(--accent)', marginBottom: 'var(--s-2)', letterSpacing: '0.1em' }}>
                {locale === 'fr' ? 'TON MUR EST PRÊT' : 'YOUR WALL IS READY'}
              </p>
              <h1 className="t-h1" style={{ marginBottom: 'var(--s-3)' }}>
                {locale === 'fr' ? 'Maintenant, partage-le.' : 'Now, share it.'}
              </h1>
              <p className="t-body t-muted">
                {locale === 'fr'
                  ? 'Ton wall est vide tant que tes amis n\'écrivent pas. Envoie-leur le lien — ils n\'ont pas besoin de compte.'
                  : 'Your wall is empty until your friends write. Send them the link — they don\'t need an account.'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
              <p className="t-label">{locale === 'fr' ? 'LIEN À PARTAGER' : 'SHARE LINK'}</p>
              <CopyButton slug={wallSlug} />
              <button onClick={handleShare} className="btn btn--solid" style={{ alignSelf: 'flex-start' }}>
                {locale === 'fr' ? '↑ Partager' : '↑ Share'}
              </button>
            </div>

            <Link href="/dashboard" className="t-small t-muted link">
              {locale === 'fr' ? 'Aller à mon dashboard →' : 'Go to my dashboard →'}
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // Step — wishlist (optionnelle), juste après la création du wall
  if (wallSlug && !wishlistDone) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {nav}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--s-8)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
            <p className="t-label t-muted" style={{ marginBottom: 'var(--s-3)', letterSpacing: '0.1em' }}>{tw('ownerKicker')}</p>
            <h1 className="t-h2" style={{ marginBottom: 'var(--s-2)' }}>{tw('onboardingTitle')}</h1>
            <p className="t-small t-muted" style={{ marginBottom: 'var(--s-8)' }}>{tw('onboardingSubtitle')}</p>
            <WishlistEditor slug={wallSlug} initialItems={[]} />
            <button
              className="btn btn--solid"
              onClick={() => { track('onboarding_step_completed', { step: 'wishlist' }); setWishlistDone(true) }}
              style={{ marginTop: 'var(--s-6)', width: '100%' }}
            >
              {tw('onboardingContinue')}
            </button>
          </div>
        </div>
      </main>
    )
  }

  // Step 2 — réseaux sociaux
  if (wallSlug) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {nav}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--s-8)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
            <p className="t-label t-muted" style={{ marginBottom: 'var(--s-3)', letterSpacing: '0.1em' }}>{locale === 'fr' ? 'TON WALL EST CRÉÉ' : 'YOUR WALL IS CREATED'}</p>
            <h1 className="t-h2" style={{ marginBottom: 'var(--s-2)' }}>{locale === 'fr' ? 'Tu veux qu\'on te mette en avant ?' : 'Want to get featured?'}</h1>
            <p className="t-small t-muted" style={{ marginBottom: 'var(--s-8)' }}>
              {locale === 'fr'
                ? 'Le jour de ton anniversaire, on peut créer du contenu autour de ton wall et le partager sur nos réseaux. Laisse tes handles si tu veux qu\'on te tague.'
                : 'On your birthday, we can create content around your wall and share it on our socials. Leave your handles if you want us to tag you.'}
            </p>

            <form onSubmit={handleStep2} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 'var(--s-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)', pointerEvents: 'none' }}>@</span>
                <input
                  className="input"
                  type="text"
                  placeholder="TikTok"
                  value={tiktok}
                  onChange={e => setTiktok(e.target.value.replace(/^@/, ''))}
                  style={{ paddingLeft: 'calc(var(--s-3) + 14px)' }}
                  autoFocus
                />
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 'var(--s-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)', pointerEvents: 'none' }}>@</span>
                <input
                  className="input"
                  type="text"
                  placeholder="Instagram"
                  value={instagram}
                  onChange={e => setInstagram(e.target.value.replace(/^@/, ''))}
                  style={{ paddingLeft: 'calc(var(--s-3) + 14px)' }}
                />
              </div>

              {step2Error && <p className="t-small t-accent">{step2Error}</p>}
              <button className="btn btn--solid" type="submit" disabled={step2Loading} style={{ marginTop: 'var(--s-2)' }}>
                {step2Loading
                  ? (locale === 'fr' ? 'Enregistrement…' : 'Saving…')
                  : (locale === 'fr' ? 'Continuer →' : 'Continue →')}
              </button>
            </form>

            <button
              className="btn btn--ghost"
              onClick={() => { track('onboarding_step_completed', { step: 2, skipped: true }); setShowPush(true) }}
              style={{ marginTop: 'var(--s-3)', width: '100%' }}
            >
              {locale === 'fr' ? 'Passer cette étape' : 'Skip this step'}
            </button>
          </div>
        </div>
      </main>
    )
  }

  // Step 1 — pseudo + date
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {nav}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--s-8)' }}>
        <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
          <p className="t-label t-muted" style={{ marginBottom: 'var(--s-3)', letterSpacing: '0.1em' }}>{locale === 'fr' ? 'DERNIÈRE ÉTAPE' : 'LAST STEP'}</p>
          <h1 className="t-h2" style={{ marginBottom: 'var(--s-2)' }}>{locale === 'fr' ? 'C\'est quand ton anniversaire ?' : 'When\'s your birthday?'}</h1>
          <p className="t-small t-muted" style={{ marginBottom: 'var(--s-8)' }}>
            {locale === 'fr'
              ? 'On en a besoin pour créer ton wall et envoyer le bon collage le jour J.'
              : 'We need it to create your wall and send the right collage on the big day.'}
          </p>

          <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
            <div>
              <label className="t-label" style={{ display: 'block', marginBottom: 'var(--s-2)' }}>
                {locale === 'fr' ? 'Comment tu t\'appelles ?' : 'What do your friends call you?'} *
              </label>
              <input
                className="input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoFocus
                placeholder={locale === 'fr' ? 'Ton prénom ou surnom' : 'Your name or nickname'}
              />
              <p className="t-caption t-muted" style={{ marginTop: 'var(--s-1)' }}>
                {locale === 'fr' ? 'C\'est ce que verront tes amis sur ton wall.' : 'This is what your friends will see on your wall.'}
              </p>
            </div>
            <div>
              <label className="t-label" style={{ display: 'block', marginBottom: 'var(--s-2)' }}>{locale === 'fr' ? 'Ton pseudo *' : 'Your username *'}</label>
              <input
                className="input"
                type="text"
                value={pseudo}
                onChange={e => setPseudo(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                required
                placeholder="ton-pseudo"
              />
              <p className="t-caption t-muted" style={{ marginTop: 'var(--s-1)' }}>{locale === 'fr' ? 'Minuscules, chiffres et tirets uniquement' : 'Lowercase letters, numbers and dashes only'}</p>
            </div>
            <div>
              <label className="t-label" style={{ display: 'block', marginBottom: 'var(--s-2)' }}>{locale === 'fr' ? 'Date d\'anniversaire *' : 'Birthday date *'}</label>
              <input
                className="input"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>

            {step1Error && <p className="t-small t-accent">{step1Error}</p>}

            <button className="btn btn--solid" type="submit" disabled={step1Loading || !date || !pseudo || !name}>
              {step1Loading
                ? (locale === 'fr' ? 'Création du wall…' : 'Creating your wall…')
                : (locale === 'fr' ? 'Créer mon wall →' : 'Create my wall →')}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
