'use client'
import { useRef, useState } from 'react'
import { toBlob } from 'html-to-image'
import { useTranslations } from 'next-intl'
import { track } from '@/lib/analytics'

interface Word {
  word: string
  count: number
}

interface Props {
  words: Word[]
  recipientName: string
}

// Palette "Sable Joyeux", dupliquée ici (comme dans remotion/theme.ts) plutôt
// qu'importée depuis remotion/ — ce composant tourne dans le navigateur, pas
// dans le pipeline de rendu vidéo, pas de raison de coupler les deux.
const colors = {
  paper: 'oklch(0.97 0.012 300)',
  ink: 'oklch(0.17 0.03 290)',
  muted: 'oklch(0.52 0.035 290)',
  violet: 'oklch(0.60 0.23 295)',
  magenta: 'oklch(0.64 0.26 350)',
  blue: 'oklch(0.60 0.18 250)',
  orange: 'oklch(0.72 0.19 47)',
}
const WORD_COLORS = [colors.violet, colors.magenta, colors.blue, colors.orange]
const ROTATIONS = [-4, 3, -2, 5, -3, 2, -5, 4]
const MIN_SIZE = 16
const MAX_SIZE = 54

export default function WordCloudCanvas({ words, recipientName }: Props) {
  const t = useTranslations('wordcloud')
  const ref = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  const maxCount = words[0]?.count ?? 1
  const minCount = words[words.length - 1]?.count ?? 1
  const range = Math.max(maxCount - minCount, 1)

  async function handleDownload() {
    if (!ref.current) return
    setExporting(true)
    try {
      const blob = await toBlob(ref.current, { backgroundColor: colors.paper, pixelRatio: 2 })
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${recipientName.toLowerCase().replace(/\s+/g, '-')}-mots.png`
      a.click()
      URL.revokeObjectURL(url)
      track('wordcloud_downloaded', { wordCount: words.length })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--s-4)' }}>
        <button className="btn btn--solid" onClick={handleDownload} disabled={exporting || words.length === 0}>
          {exporting ? t('exporting') : t('download')}
        </button>
      </div>

      {words.length === 0 ? (
        <p className="t-small t-muted">{t('empty')}</p>
      ) : (
        <div style={{ overflowX: 'auto', paddingBottom: 'var(--s-4)' }}>
          <div
            ref={ref}
            style={{
              width: 540,
              height: 540,
              background: colors.paper,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '36px 32px 28px',
              flexShrink: 0,
            }}
          >
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.muted, textAlign: 'center' }}>
              {t('eyebrow', { name: recipientName })}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '2px 10px' }}>
              {words.map((w, i) => {
                const scale = Math.sqrt((w.count - minCount) / range)
                const size = MIN_SIZE + (MAX_SIZE - MIN_SIZE) * scale
                return (
                  <span
                    key={w.word}
                    style={{
                      fontFamily: "'Baloo 2', sans-serif",
                      fontWeight: 800,
                      fontSize: size,
                      lineHeight: 1,
                      color: WORD_COLORS[i % WORD_COLORS.length],
                      transform: `rotate(${ROTATIONS[i % ROTATIONS.length]}deg)`,
                      display: 'inline-block',
                    }}
                  >
                    {w.word}
                  </span>
                )
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <WallIconTile size={26} />
                <span style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 18, color: colors.ink }}>hbdwall</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <SocialPill label="instagram.com/hbdwall" />
                <SocialPill label="tiktok.com/@hbdwall" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function WallIconTile({ size }: { size: number }) {
  const dot = size * 0.32
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: colors.ink,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: size * 0.1,
        flexShrink: 0,
      }}
    >
      <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900, fontSize: size * 0.6, color: colors.paper, lineHeight: 1 }}>W</span>
      <div style={{ position: 'absolute', top: -dot * 0.3, right: -dot * 0.3, width: dot, height: dot, borderRadius: dot * 0.25, background: colors.violet }} />
    </div>
  )
}

function SocialPill({ label }: { label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: '#fff',
        border: `1.5px solid ${colors.ink}`,
        borderRadius: 999,
        padding: '4px 10px',
        fontFamily: "'Space Mono', monospace",
        fontWeight: 700,
        fontSize: 9,
        color: colors.ink,
      }}
    >
      {label}
    </span>
  )
}
