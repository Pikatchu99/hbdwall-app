'use client'
import { useRef, useState } from 'react'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import BoringAvatar from 'boring-avatars'
import { useTranslations, useLocale } from 'next-intl'
import Avatar from '@/components/Avatar'
import { Sparkle, Heart, Star, Confetti } from '@/components/joyful/Doodles'

// Nid d'abeilles : hexagones (tessellation parfaite). Anniv du JOUR au centre (halo).
// On complète jusqu'à TARGET cases avec des places LIBRES (atténuées + "+") → clic =
// "crée ton mur et apparais ici". Remplit l'espace + hook de croissance. Clic → bulle.
export type Person = { slug: string; name: string; pseudo: string; image: string | null; day: number; month: number; isToday?: boolean }

const FRAMES = ['var(--v-yellow)', 'var(--v-lime)', 'var(--v-violet)', 'var(--v-magenta)', 'var(--v-blue)', 'var(--v-orange)']
const CONFETTI_COLORS = ['#7C5CFF', '#FFE26A', '#C7F25E', '#FF9ECF', '#5C9BFF']
const POP_W = 290
const SQRT3 = 1.7320508
const TARGET = 19 // nid d'abeilles complet (2 anneaux) : plein sur PC, bonne liste sur mobile
const MAXW = 20

function hexSpiral(n: number) {
  const out = [{ q: 0, r: 0 }]
  const dirs = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]]
  let k = 1
  while (out.length < n) {
    let q = dirs[4][0] * k, r = dirs[4][1] * k
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < k; j++) { out.push({ q, r }); q += dirs[i][0]; r += dirs[i][1] }
    }
    k++
  }
  return out.slice(0, n)
}

type Placed = Partial<Person> & { x: number; y: number; color: string; placeholder?: boolean }

function place(people: Person[]): { tiles: Placed[]; w: number; h: number } {
  // Vrais d'abord (anniv du jour au centre), puis on complète avec des cases libres.
  const real = [...people.filter(p => p.isToday), ...people.filter(p => !p.isToday)].slice(0, TARGET)
  const items: (Person | { placeholder: true })[] = [
    ...real,
    ...Array.from({ length: Math.max(0, TARGET - real.length) }, () => ({ placeholder: true as const })),
  ]
  const coords = hexSpiral(items.length)
  const raw = coords.map(({ q, r }) => ({ rx: 0.75 * q, ry: (SQRT3 / 2) * (r + q / 2) }))
  const maxX = Math.max(...raw.map(p => Math.abs(p.rx))) + 0.5
  const maxY = Math.max(...raw.map(p => Math.abs(p.ry))) + SQRT3 / 4
  const w = (50 - 2.5) / Math.max(maxX, maxY)
  const h = (SQRT3 / 2) * w
  const tiles: Placed[] = items.map((it, i) => ({
    ...it,
    x: 50 + raw[i].rx * w,
    y: 50 + raw[i].ry * w,
    color: FRAMES[i % FRAMES.length],
  }))
  return { tiles, w, h }
}

export default function BirthdayCloud({ people }: { people: Person[] }) {
  const t = useTranslations('joyfulLanding')
  const locale = useLocale()
  const arenaRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<number | null>(null)
  const [pos, setPos] = useState<{ top: number; left: number; side: 'left' | 'right' | 'top'; width: number } | null>(null)
  if (!people.length) return null
  const { tiles, w, h } = place(people)
  const p = active !== null ? tiles[active] : null
  // Arène rétrécie (k) pour épouser le cluster, et taille d'hexagone plafonnée.
  const k = Math.min(1, MAXW / w)
  const avSize = Math.min(240, Math.max(72, Math.round(Math.min(w, MAXW) * 6)))

  const fmtDate = (d: number, m: number) =>
    new Date(2025, m - 1, d).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long' })

  function onTile(i: number, e: React.MouseEvent<HTMLButtonElement>) {
    if (active === i) { setActive(null); return }
    const g = arenaRef.current?.getBoundingClientRect()
    const r = e.currentTarget.getBoundingClientRect()
    if (g) {
      const cx = r.left + r.width / 2 - g.left
      const cy = r.top + r.height / 2 - g.top
      const width = Math.min(POP_W, g.width - 24)
      if (g.width < 520) {
        setPos({ top: cy + 42, left: Math.max(8, Math.min(cx - width / 2, g.width - width - 8)), side: 'top', width })
      } else {
        const right = cx + 44 + width <= g.width
        setPos({ top: cy, left: right ? cx + 44 : cx - 44 - width, side: right ? 'right' : 'left', width })
      }
    }
    setActive(i)
    confetti({
      particleCount: 90, spread: 75, startVelocity: 38,
      origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
      colors: CONFETTI_COLORS,
    })
  }

  return (
    <section className="bcloud">
      <p className="vibe-kicker" style={{ textAlign: 'center' }}>{t('birthdays.kicker')}</p>
      <h2 className="vibe-h2-big" style={{ textAlign: 'center' }}>
        {t.rich('birthdays.title', { mark: (c) => <span className="vibe-mark mark-y">{c}</span> })}
      </h2>
      <p className="bcloud-hint">{t('birthdays.hint')}</p>

      <div className="bcloud-deco" aria-hidden>
        <span className="hero-doodle" style={{ top: '14%', left: '7%' }}><Confetti size={56} /></span>
        <span className="hero-doodle" style={{ top: '36%', left: '13%' }}><Star size={32} color="var(--v-lime)" /></span>
        <span className="hero-doodle" style={{ top: '60%', left: '5%' }}><Heart size={30} color="var(--v-magenta)" /></span>
        <span className="hero-doodle" style={{ bottom: '9%', left: '11%' }}><Sparkle size={40} color="var(--v-violet)" /></span>
        <span className="hero-doodle" style={{ top: '12%', right: '8%' }}><Star size={30} color="var(--v-yellow)" /></span>
        <span className="hero-doodle" style={{ top: '40%', right: '4%' }}><Confetti size={50} /></span>
        <span className="hero-doodle" style={{ top: '66%', right: '12%' }}><Sparkle size={36} color="var(--v-blue)" /></span>
        <span className="hero-doodle" style={{ bottom: '12%', right: '7%' }}><Heart size={28} color="var(--v-yellow)" /></span>
      </div>

      <div
        ref={arenaRef}
        className={`bcloud-arena${active !== null ? ' is-active' : ''}`}
        style={{ width: `calc(min(94vw, 600px) * ${k.toFixed(3)})` }}
        onClick={(e) => { if (e.target === e.currentTarget) setActive(null) }}
      >
        {tiles.map((tile, i) => tile.placeholder ? (
          <button
            key={`ph-${i}`}
            type="button"
            className={`bcloud-tile bcloud-ph${active === i ? ' on' : ''}`}
            style={{ left: `${tile.x}%`, top: `${tile.y}%`, width: `${w * 0.94}%`, height: `${h * 0.94}%`, background: tile.color }}
            onClick={(e) => onTile(i, e)}
            aria-label={t('birthdays.joinAria')}
          >
            <span className="bcloud-ph-av"><BoringAvatar size={avSize} name={`spot-${i}`} variant="beam" colors={CONFETTI_COLORS} square /></span>
            <span className="bcloud-ph-plus" aria-hidden>+</span>
          </button>
        ) : (
          <button
            key={`${tile.slug}-${i}`}
            type="button"
            className={`bcloud-tile${tile.isToday ? ' today' : ''}${active === i ? ' on' : ''}`}
            style={{ left: `${tile.x}%`, top: `${tile.y}%`, width: `${w * 0.94}%`, height: `${h * 0.94}%`, background: tile.color }}
            onClick={(e) => onTile(i, e)}
            aria-label={`${tile.name} @${tile.pseudo}`}
          >
            <Avatar name={tile.name!} src={tile.image ?? null} size={avSize} />
          </button>
        ))}

        {p && pos && (
          <div className="bcloud-pop" data-side={pos.side} role="dialog" aria-label={p.placeholder ? t('birthdays.joinTitle') : p.name} style={{ top: pos.top, left: pos.left, width: pos.width }}>
            <button className="bcloud-close" onClick={() => setActive(null)} aria-label="Fermer" type="button">×</button>
            {p.placeholder ? (
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="bcloud-card-name">{t('birthdays.joinTitle')}</p>
                <p className="bcloud-card-date">{t('birthdays.joinBody')}</p>
                <Link href="/register" className="vibe-pill vibe-pill--ink sm" style={{ marginTop: 12 }}>
                  {t('birthdays.joinCta')}
                </Link>
              </div>
            ) : (
              <>
                <div className="bcloud-card-av">
                  {p.image
                    ? <img src={p.image} alt={p.name} width={56} height={56} style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover', display: 'block' }} />
                    : <Avatar name={p.name!} src={null} size={56} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="bcloud-card-name">{p.name}</p>
                  <p className="bcloud-card-handle">@{p.pseudo}</p>
                  <p className="bcloud-card-date">{p.isToday ? t('birthdays.todayLabel') : t('birthdays.dateLabel', { date: fmtDate(p.day!, p.month!) })}</p>
                  <Link href={`/wall/${p.slug}`} className="vibe-pill vibe-pill--ink sm" style={{ marginTop: 12 }}>
                    {t('birthdays.cta')}
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
