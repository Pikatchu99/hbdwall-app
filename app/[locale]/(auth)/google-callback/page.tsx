'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { track } from '@/lib/analytics'

const PHRASES = {
  fr: [
    'Tes amis vont pouvoir t\'écrire…',
    'Un souvenir pour toute la vie…',
    'Parce que tu mérites d\'être célébré·e…',
    'Les gens qui t\'aiment te préparent des mots…',
    'Chaque message compte. Pour toujours.',
  ],
  en: [
    'Your friends will be able to write to you…',
    'A memory that lasts forever…',
    'Because you deserve to be celebrated…',
    'The people you love are getting ready to write…',
    'Every message matters. Forever.',
  ],
}

// Pre-defined so there's no hydration mismatch
const CONFETTI = [
  { id: 0,  x: 8,  delay: 0,    dur: 6.2, size: 7,  shape: 'square', color: '#7B61FF', drift: 30  },
  { id: 1,  x: 18, delay: 1.1,  dur: 7.8, size: 5,  shape: 'line',   color: '#111111', drift: -20 },
  { id: 2,  x: 27, delay: 0.4,  dur: 5.5, size: 9,  shape: 'square', color: '#7B61FF', drift: 40  },
  { id: 3,  x: 38, delay: 2.3,  dur: 8.1, size: 4,  shape: 'square', color: '#888888', drift: -35 },
  { id: 4,  x: 51, delay: 0.8,  dur: 6.9, size: 6,  shape: 'line',   color: '#7B61FF', drift: 25  },
  { id: 5,  x: 62, delay: 1.7,  dur: 7.2, size: 8,  shape: 'square', color: '#111111', drift: -15 },
  { id: 6,  x: 73, delay: 0.2,  dur: 5.8, size: 5,  shape: 'square', color: '#7B61FF', drift: 50  },
  { id: 7,  x: 82, delay: 3.0,  dur: 6.5, size: 7,  shape: 'line',   color: '#888888', drift: -40 },
  { id: 8,  x: 91, delay: 1.4,  dur: 8.4, size: 4,  shape: 'square', color: '#7B61FF', drift: 20  },
  { id: 9,  x: 44, delay: 2.8,  dur: 7.0, size: 10, shape: 'square', color: '#111111', drift: -50 },
  { id: 10, x: 14, delay: 3.5,  dur: 5.2, size: 5,  shape: 'line',   color: '#7B61FF', drift: 35  },
  { id: 11, x: 58, delay: 0.6,  dur: 9.0, size: 6,  shape: 'square', color: '#888888', drift: -25 },
]

export default function GoogleCallbackPage() {
  const router = useRouter()
  const locale = useLocale()
  const phrases = PHRASES[locale as keyof typeof PHRASES] ?? PHRASES.fr
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const iv = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setPhraseIdx(i => (i + 1) % phrases.length)
        setFade(true)
      }, 350)
    }, 2400)
    return () => clearInterval(iv)
  }, [phrases.length])

  useEffect(() => {
    fetch('/api/auth/google-session', { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        if (!data.pseudo) { router.replace('/login?error=google'); return }
        track(data.isNewUser ? 'signup_success' : 'login_success', { method: 'google' })
        router.replace(data.isNewUser ? `/onboarding?pseudo=${encodeURIComponent(data.pseudo)}&name=${encodeURIComponent(data.name ?? '')}` : '/dashboard')
      })
      .catch(() => router.replace('/login?error=google'))
  }, [router])

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--bg)',
    }}>
      <style>{`
        @keyframes cb-fall {
          0%   { transform: translateY(-40px) translateX(0) rotate(0deg); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.8; }
          100% { transform: translateY(110vh) translateX(var(--drift)) rotate(360deg); opacity: 0; }
        }
        @keyframes cb-pulse {
          0%, 100% { opacity: 1; transform: scaleX(1); }
          50%       { opacity: 0.4; transform: scaleX(0.6); }
        }
        @keyframes cb-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        .cb-piece { position: absolute; top: -20px; animation: cb-fall var(--dur) var(--delay) ease-in infinite; }
        .cb-dot   { display: inline-block; animation: cb-blink 1s var(--d) ease-in-out infinite; }
      `}</style>

      {/* Confetti */}
      {CONFETTI.map(p => (
        <div
          key={p.id}
          className="cb-piece"
          style={{
            left: `${p.x}%`,
            '--dur': `${p.dur}s`,
            '--delay': `${p.delay}s`,
            '--drift': `${p.drift}px`,
          } as React.CSSProperties}
        >
          {p.shape === 'square' ? (
            <div style={{ width: p.size, height: p.size, background: p.color, opacity: 0.35 }} />
          ) : (
            <div style={{ width: 1, height: p.size * 2, background: p.color, opacity: 0.25 }} />
          )}
        </div>
      ))}

      {/* Center content */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s-8)' }}>

        {/* Wordmark */}
        <div>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 900,
            fontSize: 'clamp(28px, 6vw, 48px)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
            color: 'var(--fg)',
          }}>
            BIRTHDAY<br />WALL
          </p>
        </div>

        {/* Rotating phrase */}
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          color: 'var(--fg-muted)',
          maxWidth: '260px',
          lineHeight: 1.6,
          transition: 'opacity 0.35s ease',
          opacity: fade ? 1 : 0,
          minHeight: '42px',
        }}>
          {phrases[phraseIdx]}
        </p>

        {/* Dot loader */}
        <div style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'center' }}>
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="cb-dot"
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: 'var(--accent)',
                '--d': `${i * 0.2}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>

      </div>
    </main>
  )
}
