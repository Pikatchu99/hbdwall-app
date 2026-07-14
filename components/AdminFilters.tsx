'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)
const SORTS = [
  { key: 'recent', label: 'Récent' },
  { key: 'birthday', label: 'Date anniv' },
  { key: 'messages', label: 'Messages' },
]
const VIEWS = [
  { key: '', label: 'Tous' },
  { key: 'today', label: "Aujourd'hui" },
  { key: 'week', label: '7 prochains j.' },
  { key: 'month30', label: '30 prochains j.' },
  { key: 'tiktok', label: 'Veulent TikTok' },
  { key: 'featured', label: 'Featured' },
]

export default function AdminFilters({ total }: { total: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const q = searchParams.get('q') ?? ''
  const month = searchParams.get('month') ?? ''
  const day = searchParams.get('day') ?? ''
  const sort = searchParams.get('sort') ?? 'recent'
  const view = searchParams.get('view') ?? ''
  const display = searchParams.get('display') ?? 'list'

  function update(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    startTransition(() => router.replace(`${pathname}?${params.toString()}`))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-5)' }}>

      {/* Search */}
      <div>
        <p className="t-label" style={{ fontSize: '9px', marginBottom: 'var(--s-2)' }}>RECHERCHE</p>
        <input
          className="input"
          placeholder="Pseudo ou prénom..."
          defaultValue={q}
          onChange={e => update({ q: e.target.value, view: '' })}
          style={{ width: '100%' }}
        />
      </div>

      {/* Display toggle */}
      <div>
        <p className="t-label" style={{ fontSize: '9px', marginBottom: 'var(--s-2)' }}>AFFICHAGE</p>
        <div style={{ display: 'flex', gap: 'var(--s-1)' }}>
          {[{ k: 'list', l: 'Liste' }, { k: 'mosaic', l: 'Mosaïque' }].map(({ k, l }) => (
            <button
              key={k}
              onClick={() => update({ display: k })}
              className={`btn ${display === k ? 'btn--solid' : 'btn--ghost'}`}
              style={{ fontSize: '10px', padding: 'var(--s-1) var(--s-2)', flex: 1 }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Quick views */}
      <div>
        <p className="t-label" style={{ fontSize: '9px', marginBottom: 'var(--s-2)' }}>VUE RAPIDE</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-1)' }}>
          {VIEWS.map(v => (
            <button
              key={v.key}
              onClick={() => update({ view: v.key, month: '', day: '', q: '' })}
              className={`btn ${view === v.key ? 'btn--solid' : 'btn--ghost'}`}
              style={{ fontSize: '10px', padding: 'var(--s-2) var(--s-3)', textAlign: 'left', justifyContent: 'flex-start' }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Month filter */}
      <div>
        <p className="t-label" style={{ fontSize: '9px', marginBottom: 'var(--s-2)' }}>MOIS</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s-1)' }}>
          {MONTHS.map((label, i) => {
            const val = String(i + 1)
            return (
              <button
                key={val}
                onClick={() => update({ month: month === val ? '' : val, day: '', view: '' })}
                className={`btn ${month === val ? 'btn--solid' : 'btn--ghost'}`}
                style={{ fontSize: '10px', padding: 'var(--s-1) 0' }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Day filter */}
      {month && (
        <div>
          <p className="t-label" style={{ fontSize: '9px', marginBottom: 'var(--s-2)' }}>JOUR</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--s-1)' }}>
            {DAYS.map(d => {
              const val = String(d)
              return (
                <button
                  key={val}
                  onClick={() => update({ day: day === val ? '' : val })}
                  className={`btn ${day === val ? 'btn--solid' : 'btn--ghost'}`}
                  style={{ fontSize: '10px', padding: 'var(--s-1) 0' }}
                >
                  {d}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Sort */}
      <div>
        <p className="t-label" style={{ fontSize: '9px', marginBottom: 'var(--s-2)' }}>TRI</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-1)' }}>
          {SORTS.map(s => (
            <button
              key={s.key}
              onClick={() => update({ sort: s.key })}
              className={`btn ${sort === s.key ? 'btn--solid' : 'btn--ghost'}`}
              style={{ fontSize: '10px', padding: 'var(--s-2) var(--s-3)', textAlign: 'left', justifyContent: 'flex-start' }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <p className="t-caption t-muted" style={{ paddingTop: 'var(--s-2)', borderTop: '1px solid var(--border)' }}>
        {total} résultat{total > 1 ? 's' : ''}
      </p>

    </div>
  )
}
