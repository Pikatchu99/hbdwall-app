'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { X } from 'lucide-react'
import { track } from '@/lib/analytics'

interface Props {
  wallSlug: string
  name: string
  initialCount: number
}

type Phase = 'idle' | 'starting' | 'listening' | 'fallback' | 'blown'

/** Événement global : n'importe quel bouton de la page peut ouvrir la fenêtre de souffle. */
export const OPEN_CANDLE_EVENT = 'hbd:open-candle'
export function openCandle() {
  window.dispatchEvent(new CustomEvent(OPEN_CANDLE_EVENT))
}

// Après un souffle, la bougie se rallume au bout d'un délai (anti-mitraillage) ;
// l'heure du dernier souffle est mémorisée côté client.
const RELIGHT_MS = 60_000
function storageKey(slug: string) {
  return `hbd-candle-${slug}`
}
function lastBlowAt(slug: string): number {
  try { return Number(localStorage.getItem(storageKey(slug)) || 0) } catch { return 0 }
}

function CandleSvg({ wind }: { wind: number }) {
  return (
    <svg viewBox="0 0 80 150" aria-hidden style={{ '--wind': wind.toFixed(2) } as React.CSSProperties}>
      <g className="candle-smoke">
        <path d="M40 34c-6-8 6-12 0-20M40 30c5-7-4-11 1-18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g className="candle-flame">
        <ellipse className="candle-glow" cx="40" cy="28" rx="16" ry="22" />
        <path className="candle-flame-outer" d="M40 6c8 12 13 18 13 27a13 13 0 0 1-26 0c0-9 5-15 13-27Z" />
        <path className="candle-flame-inner" d="M40 20c4 6 6 9 6 14a6 6 0 0 1-12 0c0-5 2-8 6-14Z" />
      </g>
      <path d="M40 46v8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <rect className="candle-body" x="24" y="54" width="32" height="84" rx="6" />
      <path className="candle-drip" d="M28 54c0 10 4 12 4 20M52 54c0 7-3 9-3 15" fill="none" strokeWidth="3" strokeLinecap="round" />
      <rect className="candle-stripe" x="24" y="86" width="32" height="8" />
      <rect className="candle-stripe" x="24" y="110" width="32" height="8" />
    </svg>
  )
}

/**
 * « Souffle une bougie » : une petite bougie flottante en bas à droite du mur ;
 * au tap, une fenêtre avec la grande flamme. Le visiteur fait un vœu pour la
 * personne fêtée et souffle dans son micro ; la flamme s'éteint et le compteur
 * du mur augmente. Détection = énergie du signal (RMS) comparée au bruit
 * ambiant, adaptée du projet honey. On souffle, on ne clique pas : sans
 * micro, la bougie reste allumée et on peut simplement passer son chemin.
 */
export default function CandleBlow({ wallSlug, name, initialCount }: Props) {
  const t = useTranslations('candle')
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [phase, setPhase] = useState<Phase>('idle')
  const [wind, setWind] = useState(0)
  const [relightIn, setRelightIn] = useState(0)
  const streamRef = useRef<MediaStream | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef(0)
  const timeoutRef = useRef(0)
  const blownRef = useRef(false)

  const stopMic = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    clearTimeout(timeoutRef.current)
    streamRef.current?.getTracks().forEach(tr => tr.stop())
    streamRef.current = null
    ctxRef.current?.close().catch(() => {})
    ctxRef.current = null
    setWind(0)
  }, [])

  useEffect(() => {
    if (Date.now() - lastBlowAt(wallSlug) < RELIGHT_MS) { blownRef.current = true; setPhase('blown') }
    const onOpen = () => setOpen(true)
    window.addEventListener(OPEN_CANDLE_EVENT, onOpen)
    return () => { window.removeEventListener(OPEN_CANDLE_EVENT, onOpen); stopMic() }
  }, [wallSlug, stopMic])

  // Compte à rebours du rallumage, puis la bougie redevient soufflable.
  useEffect(() => {
    if (phase !== 'blown') return
    const tick = () => {
      const left = Math.ceil((lastBlowAt(wallSlug) + RELIGHT_MS - Date.now()) / 1000)
      if (left <= 0) {
        blownRef.current = false
        setRelightIn(0)
        setPhase('idle')
        try { localStorage.removeItem(storageKey(wallSlug)) } catch {}
        return
      }
      setRelightIn(left)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [phase, wallSlug])

  // Fermer : on coupe le micro et on remet l'invitation si rien n'a été soufflé.
  const close = useCallback(() => {
    setOpen(false)
    stopMic()
    if (!blownRef.current) setPhase('idle')
  }, [stopMic])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  async function blow() {
    if (blownRef.current) return
    blownRef.current = true
    stopMic()
    setPhase('blown')
    try { localStorage.setItem(storageKey(wallSlug), String(Date.now())) } catch {}
    track('candle_blown', { wallSlug })
    try {
      const res = await fetch(`/api/walls/${wallSlug}/candles`, { method: 'POST' })
      const data = res.ok ? await res.json() : null
      setCount(c => (typeof data?.count === 'number' ? data.count : c + 1))
    } catch { setCount(c => c + 1) }
  }

  async function startMic() {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!navigator.mediaDevices?.getUserMedia || !AC) { setPhase('fallback'); return }
    setPhase('starting')
    try {
      const stream = await Promise.race([
        navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }),
        new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), 10000)),
      ])
      streamRef.current = stream
      const ctx = new AC()
      ctxRef.current = ctx
      ctx.resume().catch(() => {})
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 1024
      analyser.smoothingTimeConstant = 0.4
      ctx.createMediaStreamSource(stream).connect(analyser)
      const buf = new Float32Array(analyser.fftSize)
      let base = 0.01, above = 0, last = performance.now()
      setPhase('listening')
      // Sans souffle détecté au bout de 20 s, on rend la main au geste tactile.
      timeoutRef.current = window.setTimeout(() => { stopMic(); setPhase('fallback') }, 20000)

      const loop = (now: number) => {
        if (!streamRef.current) return
        analyser.getFloatTimeDomainData(buf)
        let sum = 0
        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i]
        const rms = Math.sqrt(sum / buf.length)
        const thr = Math.min(0.3, Math.max(0.045, base * 3.2))
        if (rms < thr) base = base * 0.97 + rms * 0.03
        const w = Math.min(1, rms / thr)
        setWind(w * w)
        const dt = now - last
        last = now
        if (rms > thr) { above += dt; if (above > 180) { blow(); return } }
        else above = Math.max(0, above - dt * 0.5)
        rafRef.current = requestAnimationFrame(loop)
      }
      rafRef.current = requestAnimationFrame(loop)
    } catch {
      stopMic()
      setPhase('fallback')
    }
  }

  const isOut = phase === 'blown'

  return (
    <>
      {/* Bougie flottante : toujours visible, ne prend aucune place dans la page. */}
      <button
        type="button"
        className="candle-fab"
        onClick={() => setOpen(true)}
        aria-label={t('open')}
        aria-haspopup="dialog"
      >
        <span className="candle candle--small" aria-hidden><CandleSvg wind={0} /></span>
        {count > 0 && <span className="candle-fab-count">{count}</span>}
      </button>

      {open && (
        <div className="candle-overlay" onClick={close}>
          <div
            className="candle-dialog card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="candle-title"
            onClick={e => e.stopPropagation()}
          >
            <button type="button" className="candle-close" onClick={close} aria-label={t('close')}>
              <X size={18} />
            </button>

            <div
              className={`candle candle--big${isOut ? ' is-out' : ''}${phase === 'listening' ? ' is-listening' : ''}`}
              role="img"
              aria-label={isOut ? t('ariaOut') : t('aria')}
            >
              <CandleSvg wind={wind} />
            </div>

            <h2 id="candle-title" className="t-h3">{t('title', { name })}</h2>
            <p className="t-small t-muted candle-sub">
              {isOut ? t('blownHint', { seconds: relightIn }) : phase === 'fallback' ? t('fallback') : t('subtitle', { name })}
            </p>
            <p className="candle-count" aria-live="polite">{t('count', { count })}</p>

            {phase === 'idle' && (
              <button type="button" className="btn btn--solid" onClick={startMic}>{t('cta')}</button>
            )}
            {phase === 'starting' && (
              <button type="button" className="btn btn--solid" disabled>{t('starting')}</button>
            )}
            {phase === 'fallback' && (
              <button type="button" className="btn btn--ghost" onClick={startMic}>{t('retry')}</button>
            )}
            {phase === 'listening' && (
              <p className="candle-status">
                <span className="candle-dot" aria-hidden /> {t('listening')}
              </p>
            )}
            {isOut && <p className="candle-status candle-status--done">{t('blown')}</p>}
          </div>
        </div>
      )}
    </>
  )
}
