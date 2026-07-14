'use client'
import { useEffect, useRef, useState } from 'react'
// Arrivée du voyage de thème : un champ d'étoiles décélère depuis l'hyperespace,
// un message s'affiche, puis tout se fond pour révéler la nouvelle page.
// L'overlay est rendu dès le SSR (prop warpTo via cookie) → aucun flash, une seule
// animation. Le cookie est effacé au montage côté client.

const MSG: Record<string, { fr: string; en: string }> = {
  joyful: { fr: 'Cap sur le nouveau look', en: 'Off to the new look' },
  classic: { fr: 'Retour au thème classique', en: 'Back to the classic look' },
}

export default function ThemeWarp({ warpTo }: { warpTo: string | null }) {
  const [show, setShow] = useState(Boolean(warpTo))
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!warpTo) return
    document.cookie = 'hbd-warp=; path=/; max-age=0; samesite=lax'
    const canvas = canvasRef.current
    if (!canvas) { setShow(false); return }
    const ctx = canvas.getContext('2d')!
    const DPR = Math.min(window.devicePixelRatio || 1, 2)
    let running = true
    let raf = 0
    const resize = () => { canvas.width = window.innerWidth * DPR; canvas.height = window.innerHeight * DPR }
    resize()
    window.addEventListener('resize', resize)

    const N = 460
    const stars = Array.from({ length: N }, () => ({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() * 0.9 + 0.1 }))
    const prev: Array<{ x: number; y: number } | null> = stars.map(() => null)
    const dur = 3800
    const t0 = performance.now()

    const frame = (now: number) => {
      if (!running) return
      const p = Math.min(1, (now - t0) / dur)
      const speed = 0.06 * (1 - p) * (1 - p) + 0.002 // décélération depuis l'hyperespace
      const cx = canvas.width / 2, cy = canvas.height / 2
      const scale = canvas.width * 0.65
      const alpha = 1 - p * 0.9

      ctx.fillStyle = 'rgba(8, 6, 22, 0.32)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < N; i++) {
        const s = stars[i]
        s.z -= speed
        if (s.z <= 0.02) { s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; s.z = 1; prev[i] = null; continue }
        const sx = cx + (s.x / s.z) * scale
        const sy = cy + (s.y / s.z) * scale
        const pr = prev[i]
        ctx.strokeStyle = `rgba(${(205 + Math.random() * 50) | 0}, 200, 255, ${alpha})`
        ctx.lineWidth = Math.max(0.5, (1 - s.z) * 2.6) * DPR
        ctx.beginPath()
        if (pr) { ctx.moveTo(pr.x, pr.y); ctx.lineTo(sx, sy) } else { ctx.moveTo(sx, sy); ctx.lineTo(sx + 0.1, sy) }
        ctx.stroke()
        prev[i] = { x: sx, y: sy }
      }

      if (p < 1) raf = requestAnimationFrame(frame)
      else setShow(false)
    }
    raf = requestAnimationFrame(frame)
    return () => { running = false; cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!show || !warpTo) return null
  const lang = typeof location !== 'undefined' && location.pathname.startsWith('/en') ? 'en' : 'fr'
  const msg = MSG[warpTo]?.[lang] ?? ''
  return (
    <div className="theme-warp theme-warp--out" aria-hidden>
      <canvas ref={canvasRef} className="theme-warp-canvas" />
      <p className="theme-warp-msg">{msg}</p>
    </div>
  )
}
