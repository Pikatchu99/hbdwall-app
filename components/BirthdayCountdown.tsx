'use client'
import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'

interface Props {
  date: string
  name: string
}

function getCountdown(targetDate: string) {
  const now = new Date()
  const bday = new Date(targetDate)

  const next = new Date(now.getFullYear(), bday.getMonth(), bday.getDate())

  // Check today FIRST (same day regardless of time)
  const isToday = next.getMonth() === now.getMonth() && next.getDate() === now.getDate()
  if (isToday) return { isToday: true, days: 0, hours: 0, minutes: 0, seconds: 0 }

  // If birthday has passed this year, push to next year
  if (next.getTime() < now.getTime()) {
    next.setFullYear(now.getFullYear() + 1)
  }

  const diff = next.getTime() - now.getTime()
  const days    = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { isToday: false, days, hours, minutes, seconds }
}

export default function BirthdayCountdown({ date, name }: Props) {
  const [countdown, setCountdown] = useState<ReturnType<typeof getCountdown> | null>(null)

  useEffect(() => {
    setCountdown(getCountdown(date))
    const interval = setInterval(() => setCountdown(getCountdown(date)), 1000)
    return () => clearInterval(interval)
  }, [date])

  useEffect(() => {
    if (!countdown?.isToday) return
    const burst = () => confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#7B61FF', '#ffffff', '#111111', '#cccccc'],
    })
    burst()
    const t1 = setTimeout(burst, 800)
    const t2 = setTimeout(burst, 1600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [countdown?.isToday])

  if (!countdown) return null

  if (countdown.isToday) {
    return (
      <div className="countdown-today">
        <div>
          <p className="countdown-today-eyebrow">AUJOURD'HUI</p>
          <p className="countdown-today-title">Joyeux anniversaire, {name} !</p>
        </div>
        <div className="countdown-today-dot" />
      </div>
    )
  }

  const units = [
    { value: countdown.days,    label: countdown.days > 1 ? 'JOURS' : 'JOUR' },
    { value: countdown.hours,   label: countdown.hours > 1 ? 'HEURES' : 'HEURE' },
    { value: countdown.minutes, label: 'MIN' },
    { value: countdown.seconds, label: 'SEC' },
  ]

  return (
    <div className="countdown-wrap">
      <div className="countdown">
        {units.map((u, i) => (
          <div key={i} className={`countdown-cell${i === 0 ? ' countdown-cell--lead' : ''}`}>
            <p className="countdown-num">{String(u.value).padStart(2, '0')}</p>
            <p className="countdown-label">{u.label}</p>
          </div>
        ))}
      </div>
      <a href="#leave-message" className="countdown-cta">
        Laisse ton message avant son anniversaire →
      </a>
    </div>
  )
}
