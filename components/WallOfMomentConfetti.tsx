'use client'
import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'

export default function WallOfMomentConfetti({ date }: { date?: string }) {
  const fired = useRef(false)
  const confettiFiredRef = useRef(false)
  const ref = useRef<HTMLDivElement>(null)
  const [countdown, setCountdown] = useState<string | null>('')

  const now = new Date()
  const today = now.getDate()
  const currentMonth = now.getMonth()
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1)

  const isToday = date ? (() => {
    const d = new Date(date)
    return d.getDate() === today && d.getMonth() === currentMonth
  })() : false

  const isTomorrow = date ? (() => {
    const d = new Date(date)
    return d.getDate() === tomorrow.getDate() && d.getMonth() === tomorrow.getMonth()
  })() : false

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

  useEffect(() => {
    if (!isTomorrow && !isToday) return
    setCountdown(computeCountdown())
    const interval = setInterval(() => {
      const val = computeCountdown()
      setCountdown(val)
      if (val === null && !confettiFiredRef.current) {
        confettiFiredRef.current = true
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#7B61FF', '#ffffff', '#111111', '#cccccc'] })
        setTimeout(() => confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#7B61FF', '#ffffff', '#111111', '#cccccc'] }), 700)
        setTimeout(() => confetti({ particleCount: 60, spread: 90, origin: { y: 0.6 }, colors: ['#7B61FF', '#ffffff', '#111111', '#cccccc'] }), 1400)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired.current) {
          fired.current = true
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#7B61FF', '#ffffff', '#111111', '#cccccc'] })
          setTimeout(() => confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 }, colors: ['#7B61FF', '#ffffff', '#111111', '#cccccc'] }), 600)
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div ref={ref} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      {isTomorrow && countdown && (
        <p style={{
          position: 'absolute', top: 'var(--s-6)', right: 'var(--s-8)', zIndex: 2,
          fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.06em',
          color: 'var(--accent)',
        }}>
          ✦ {countdown}
        </p>
      )}
      {isToday && (
        <p style={{
          position: 'absolute', top: 'var(--s-6)', right: 'var(--s-8)', zIndex: 2,
          fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--accent)',
        }}>
          ✦ AUJOURD'HUI
        </p>
      )}
    </>
  )
}
