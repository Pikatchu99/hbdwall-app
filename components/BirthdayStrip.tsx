'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import confetti from 'canvas-confetti'

type BirthdayEntry = {
  slug: string
  name: string
  pseudo: string
  day: number
  month: number
  msgCount: number
  quote: { content: string; author: string | null } | null
}

const FALLBACK_QUOTES = [
  "La vie est un cadeau, et toi tu en es le plus beau ruban.",
  "Chaque anniversaire est une nouvelle page d'une histoire magnifique.",
  "Le bonheur, c'est d'avoir des gens qui pensent à toi aujourd'hui.",
  "Vieillir, c'est le privilège de ceux qui sont aimés.",
  "Tu mérites toute la joie que tu donnes aux autres.",
  "Les plus belles années sont celles qui viennent.",
  "Que ce jour soit aussi lumineux que ton sourire.",
  "Merci d'exister — le monde est meilleur avec toi dedans.",
  "Un an de plus, mille raisons de te célébrer.",
  "Ce jour est fait pour toi. Profite.",
]

const GARLAND = (() => {
  const topY = 5, botY = 40, startX = 60, spacing = 90
  const flagH = 26, flagW = 12, count = 40
  const colors = ['#7B61FF', '#111111', '#CCCCCC', '#7B61FF', '#CCCCCC', '#111111']
  const flagXs = Array.from({ length: count }, (_, k) => startX + k * spacing)
  let pathD = `M 0,${topY} Q ${startX / 2},${botY} ${startX},${topY}`
  for (let k = 0; k < count - 1; k++) {
    const mid = (flagXs[k] + flagXs[k + 1]) / 2
    pathD += ` Q ${mid},${botY} ${flagXs[k + 1]},${topY}`
  }
  return { pathD, flagXs, topY, flagH, flagW, colors }
})()

export default function BirthdayStrip({ birthdays }: {
  birthdays: BirthdayEntry[]
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const todayRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const now = new Date()
  const today = now.getDate()
  const todayMonth = now.getMonth() + 1
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1)
  const [ready, setReady] = useState(false)
  const [innerPad, setInnerPad] = useState({ left: 32, right: 32 })
  const [countdown, setCountdown] = useState<string | null>('')
  const hasBirthdayToday = birthdays.some(b => b.day === today && b.month === todayMonth)

  const computeCountdown = () => {
    const midnight = new Date()
    midnight.setHours(24, 0, 0, 0)
    const diff = midnight.getTime() - Date.now()
    if (diff <= 0) return null
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    const mm = m.toString().padStart(2, '0')
    const ss = s.toString().padStart(2, '0')
    return h > 0 ? `${h}h ${mm}m ${ss}s` : `${mm}m ${ss}s`
  }

  // Confettis au chargement — depuis chaque ballon du jour, à chaque refresh
  useEffect(() => {
    if (!ready || !hasBirthdayToday || !scrollRef.current) return
    const balloons = scrollRef.current.querySelectorAll<HTMLElement>('[data-today-balloon]')
    balloons.forEach((el, i) => {
      const rect = el.getBoundingClientRect()
      const ox = (rect.left + rect.width / 2) / window.innerWidth
      const oy = (rect.top + rect.height / 2) / window.innerHeight
      setTimeout(() => {
        confetti({ particleCount: 80, spread: 70, origin: { x: ox, y: oy }, colors: ['#7B61FF', '#ffffff', '#111111', '#cccccc'] })
        setTimeout(() => confetti({ particleCount: 50, spread: 60, origin: { x: ox, y: oy }, colors: ['#7B61FF', '#ffffff', '#111111', '#cccccc'] }), 500)
      }, i * 300)
    })
  }, [ready]) // eslint-disable-line react-hooks/exhaustive-deps

  // Décompte — reload à minuit, les confettis se lancent naturellement au chargement
  useEffect(() => {
    setCountdown(computeCountdown())
    const interval = setInterval(() => {
      const val = computeCountdown()
      setCountdown(val)
      if (val === null) {
        clearInterval(interval)
        window.location.reload()
      }
    }, 1000)
    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const container = scrollRef.current
    const todayEl = todayRef.current
    const inner = innerRef.current

    if (container && inner) {
      const containerW = container.offsetWidth
      const half = containerW / 2

      if (todayEl) {
        const elW = todayEl.offsetWidth
        const extraLeft = Math.max(0, half - todayEl.offsetLeft - elW / 2)
        const extraRight = Math.max(0, half - (inner.scrollWidth - todayEl.offsetLeft - elW))
        setInnerPad({ left: 32 + extraLeft, right: 32 + extraRight })
        // scrollLeft applied after state update via second effect
        container.dataset.targetScroll = String(todayEl.offsetLeft - half + elW / 2)
      } else {
        const contentW = inner.scrollWidth
        const extraPad = Math.max(0, (containerW - contentW) / 2)
        setInnerPad({ left: 32 + extraPad, right: 32 + extraPad })
        container.dataset.targetScroll = String(Math.max(0, (contentW + extraPad * 2 - containerW) / 2))
      }
    }

    const timer = setTimeout(() => setReady(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  // Apply scroll after padding state update causes re-render
  useEffect(() => {
    const container = scrollRef.current
    if (!container || !container.dataset.targetScroll) return
    container.scrollLeft = Number(container.dataset.targetScroll)
  }, [innerPad])

  const skeletonSizes = birthdays.slice(0, 5).map(() => 140)

  return (
    <div style={{ position: 'relative' }}>

      {/* Guirlande — toujours visible */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '64px', overflow: 'visible', pointerEvents: 'none', zIndex: 1 }}>
        <path d={GARLAND.pathD} stroke="#AAAAAA" strokeWidth="1.2" fill="none" />
        {GARLAND.flagXs.map((x, k) => {
          const color = GARLAND.colors[k % GARLAND.colors.length]
          return (
            <polygon
              key={k}
              points={`${x - GARLAND.flagW},${GARLAND.topY} ${x + GARLAND.flagW},${GARLAND.topY} ${x},${GARLAND.topY + GARLAND.flagH}`}
              fill={color}
              opacity={color === '#CCCCCC' ? 0.6 : 0.92}
            />
          )
        })}
      </svg>

      {/* Skeleton */}
      <div style={{
        display: 'flex', gap: '24px',
        padding: '72px 32px 48px',
        justifyContent: 'center', alignItems: 'flex-end',
        position: 'absolute', inset: 0,
        opacity: ready ? 0 : 1,
        transition: 'opacity 0.6s ease',
        pointerEvents: 'none',
      }}>
        {skeletonSizes.map((size, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '160px', flexShrink: 0 }}>
            {/* Cercle */}
            <div
              className="skeleton-circle balloon-sway"
              style={{ width: size, height: size, animationDelay: `${i * 0.2}s`, animationDuration: `${3.5 + (i % 3) * 0.7}s` }}
            />
            {/* Citation */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
              <div className="skeleton-circle" style={{ width: '90%', height: '10px', borderRadius: '4px', animationDelay: `${i * 0.2 + 0.1}s` }} />
              <div className="skeleton-circle" style={{ width: '70%', height: '10px', borderRadius: '4px', animationDelay: `${i * 0.2 + 0.2}s` }} />
              <div className="skeleton-circle" style={{ width: '40%', height: '9px', borderRadius: '4px', marginTop: '4px', animationDelay: `${i * 0.2 + 0.3}s` }} />
            </div>
            {/* Bouton */}
            <div className="skeleton-circle" style={{ width: '120px', height: '28px', borderRadius: '0', animationDelay: `${i * 0.2 + 0.4}s` }} />
          </div>
        ))}
      </div>

      {/* Strip réel — dans le DOM pour les mesures, fade-in après 3s */}
      <div
        ref={scrollRef}
        style={{
          position: 'relative', overflowX: 'auto', overflowY: 'visible', scrollbarWidth: 'none',
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}
      >
        <div ref={innerRef} style={{ display: 'flex', gap: 'var(--s-6)', paddingLeft: innerPad.left, paddingRight: innerPad.right, paddingTop: '72px', width: 'max-content', alignItems: 'flex-start' }}>
          {birthdays.map((b, i) => {
            const isToday = b.day === today && b.month === todayMonth
            const isTomorrow = b.day === tomorrow.getDate() && (b.month - 1) === tomorrow.getMonth()
            const palettes = [
              { bg: '#FFFFFF', color: '#111111' },
              { bg: '#EAEAEA', color: '#111111' },
              { bg: '#D5D5D5', color: '#111111' },
            ]
            const p = isToday ? { bg: '#7B61FF', color: '#FFFFFF' } : palettes[i % 3]
            const balloonSize = isToday ? 170 : 140
            const quote = b.quote ?? { content: FALLBACK_QUOTES[(i + b.day) % FALLBACK_QUOTES.length], author: null }

            return (
              <div
                key={b.slug}
                ref={isToday ? todayRef : undefined}
                style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', width: isToday ? '200px' : '160px' }}
              >
                <div
                  className="balloon-sway"
                  data-today-balloon={isToday ? 'true' : undefined}
                  onClick={e => {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                    confetti({
                      particleCount: 60, spread: 70, startVelocity: 20, decay: 0.92,
                      origin: {
                        x: (rect.left + rect.width / 2) / window.innerWidth,
                        y: (rect.top + rect.height / 2) / window.innerHeight,
                      },
                      colors: ['#7B61FF', '#ffffff', '#111111', '#CCCCCC'],
                    })
                  }}
                  style={{
                    position: 'relative',
                    width: `${balloonSize}px`, height: `${balloonSize}px`,
                    borderRadius: '50%',
                    background: p.bg, color: p.color,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: 'var(--s-4)', textAlign: 'center',
                    boxShadow: isToday ? '0 8px 32px rgba(123,97,255,0.35)' : '0 6px 20px rgba(0,0,0,0.1)',
                    animationDelay: `${(i * 0.6) % 4}s`,
                    animationDuration: `${3.5 + (i % 3) * 0.7}s`,
                  }}
                >
                  {isToday && <div className="balloon-ping" />}
                  {isToday ? (
                    <p style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.7, marginBottom: '6px' }}>
                      AUJOURD'HUI
                    </p>
                  ) : isTomorrow ? (
                    <p style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '4px' }}>
                      {countdown}
                    </p>
                  ) : (
                    <p style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', opacity: 0.5, marginBottom: '4px' }}>
                      {b.day} {new Date(2000, b.month - 1).toLocaleDateString('fr-FR', { month: 'short' })}
                    </p>
                  )}
                  <p style={{
                    fontFamily: 'var(--font-mono)', fontWeight: 900,
                    fontSize: isToday ? (b.name.length > 8 ? '15px' : '22px') : (b.name.length > 8 ? '13px' : '18px'),
                    lineHeight: 1.1, letterSpacing: '-0.02em',
                  }}>
                    {b.name}
                  </p>
                  {isToday && (
                    <p style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', opacity: 0.6, marginTop: '6px' }}>
                      {b.day} {new Date(2000, b.month - 1).toLocaleDateString('fr-FR', { month: 'short' })}
                    </p>
                  )}
                  {isTomorrow && (
                    <p style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', opacity: 0.5, marginTop: '4px' }}>
                      {b.day} {new Date(2000, b.month - 1).toLocaleDateString('fr-FR', { month: 'short' })}
                    </p>
                  )}
                </div>

                <div style={{ marginTop: 'var(--s-4)', textAlign: 'center' }}>
                  <p className="t-caption t-muted" style={{ fontStyle: 'italic', lineHeight: 1.4, marginBottom: 'var(--s-2)' }}>
                    "{quote.content.length > 60 ? quote.content.slice(0, 60) + '…' : quote.content}"
                  </p>
                  {quote.author && (
                    <p className="t-caption t-muted" style={{ opacity: 0.5 }}>— {quote.author}</p>
                  )}
                </div>

                <Link href={`/wall/${b.slug}`} className="btn btn--ghost" style={{ marginTop: 'var(--s-4)', fontSize: '10px', padding: '6px 12px' }}>
                  Laisser un mot →
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
