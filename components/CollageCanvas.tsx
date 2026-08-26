'use client'
import { useRef, useState, useEffect } from 'react'
import { toBlob as htmlToBlob } from 'html-to-image'
import { useTranslations } from 'next-intl'
import { track } from '@/lib/analytics'

type Format = 'square' | 'portrait' | 'landscape'
type Style = 'clean' | 'colored' | 'confetti' | 'poster'
type PhotoTreatment = 'bw' | 'color'
type ContentType = 'words' | 'images' | 'mixed'

interface Message {
  id: string
  authorName: string | null
  content: string
  photoUrl: string | null
  createdAt: string
}

interface Props {
  messages: Message[]
  wallTitle: string
  ownerName: string
  recipientName?: string
  isOwn?: boolean
  defaultType?: ContentType
}

const FORMAT_SIZES = {
  square:    { w: 540, h: 540,  label: '1:1 Instagram' },
  portrait:  { w: 390, h: 693,  label: '9:16 Stories' },
  landscape: { w: 693, h: 390,  label: '16:9 Banner' },
}

// Palette "mimi" : cartes-stickers pastel (texte ink lisible), accents festifs.
const INKC = '#1A1626'
const CARD_COLORS: Record<Style, Array<{ bg: string; fg: string }>> = {
  clean:    Array(9).fill({ bg: '#FFFFFF', fg: INKC }),
  colored: [
    { bg: '#FFFFFF', fg: INKC },
    { bg: '#FFE26A', fg: INKC },
    { bg: '#C7F25E', fg: INKC },
    { bg: '#FFFFFF', fg: INKC },
    { bg: '#7C5CFF', fg: '#FFFFFF' },
    { bg: '#FF9ECF', fg: INKC },
  ],
  confetti: [
    { bg: '#FFE26A', fg: INKC },
    { bg: '#FFFFFF', fg: INKC },
    { bg: '#C7F25E', fg: INKC },
    { bg: '#FF9ECF', fg: INKC },
    { bg: '#FFFFFF', fg: INKC },
    { bg: '#7C5CFF', fg: '#FFFFFF' },
  ],
  poster: [
    { bg: '#FFFFFF', fg: INKC },
    { bg: '#FFE26A', fg: INKC },
    { bg: '#FFFFFF', fg: INKC },
    { bg: '#C7F25E', fg: INKC },
    { bg: '#FFFFFF', fg: INKC },
    { bg: '#A9D7FF', fg: INKC },
  ],
}

const BAR_COLORS = ['#7C5CFF', '#FF9ECF', '#C7F25E', '#FFE26A']

const CONFETTI = [
  { type: 'square', x: 2,  y: 14, s: 10, c: '#7C5CFF' },
  { type: 'square', x: 91, y: 7,  s: 7,  c: '#111111' },
  { type: 'square', x: 95, y: 87, s: 5,  c: '#7C5CFF' },
  { type: 'square', x: 2,  y: 84, s: 8,  c: '#CCCCCC' },
  { type: 'square', x: 50, y: 5,  s: 5,  c: '#CCCCCC' },
  { type: 'bar',    x: 8,  y: 32, w: 28, h: 2, c: '#111111' },
  { type: 'bar',    x: 68, y: 57, w: 22, h: 2, c: '#7C5CFF' },
  { type: 'bar',    x: 45, y: 94, w: 32, h: 2, c: '#CCCCCC' },
  { type: 'plus',   x: 15, y: 72, s: 14, c: '#111111' },
  { type: 'plus',   x: 84, y: 36, s: 9,  c: '#7C5CFF' },
  { type: 'plus',   x: 48, y: 50, s: 6,  c: '#CCCCCC' },
]

type ConfettiEl = typeof CONFETTI[number]

function ConfettiLayer() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {CONFETTI.map((el: ConfettiEl, i) => {
        if (el.type === 'square') return (
          <div key={i} style={{ position: 'absolute', left: `${el.x}%`, top: `${el.y}%`, width: el.s, height: el.s, background: el.c }} />
        )
        if (el.type === 'bar') return (
          <div key={i} style={{ position: 'absolute', left: `${el.x}%`, top: `${el.y}%`, width: el.w, height: el.h, background: el.c }} />
        )
        if (el.type === 'plus') return (
          <div key={i} style={{ position: 'absolute', left: `${el.x}%`, top: `${el.y}%`, width: el.s, height: el.s }}>
            <div style={{ position: 'absolute', width: '100%', height: 2, background: el.c, top: '50%', transform: 'translateY(-50%)' }} />
            <div style={{ position: 'absolute', height: '100%', width: 2, background: el.c, left: '50%', transform: 'translateX(-50%)' }} />
          </div>
        )
        return null
      })}
    </div>
  )
}

export default function CollageCanvas({ messages, wallTitle, ownerName, recipientName, isOwn, defaultType = 'words' }: Props) {
  const t = useTranslations('collage')
  const [format, setFormat] = useState<Format>('square')
  const [style, setStyle] = useState<Style>('colored')
  const [photoTreatment, setPhotoTreatment] = useState<PhotoTreatment>('bw')
  const [contentType, setContentType] = useState<ContentType>(defaultType)
  const [exporting, setExporting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(messages.slice(0, 9).map(m => m.id))
  )
  const [title, setTitle] = useState(wallTitle)
  const [perPage, setPerPage] = useState(9)
  const [zipProgress, setZipProgress] = useState<{ current: number; total: number } | null>(null)
  const [zipPageMessages, setZipPageMessages] = useState<Message[] | null>(null)
  const [infoOpen, setInfoOpen] = useState(false)
  const [shuffleOrder, setShuffleOrder] = useState<string[] | null>(null)
  const [customizing, setCustomizing] = useState(false)
  const [selectingMessages, setSelectingMessages] = useState(false)
  const [exported, setExported] = useState(false)
  const [captionCopied, setCaptionCopied] = useState(false)
  const [nativeShare, setNativeShare] = useState(false)
  const collageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const testFile = new File([''], 'test.png', { type: 'image/png' })
    setNativeShare('share' in navigator && !!navigator.canShare?.({ files: [testFile] }))
    track('collage_generated', { messageCount: messages.length })
  }, [])

  const basePool = {
    words:  messages,
    images: messages.filter(m => m.photoUrl),
    mixed:  messages,
  }[contentType]

  const pool = shuffleOrder
    ? [...basePool].sort((a, b) => shuffleOrder.indexOf(a.id) - shuffleOrder.indexOf(b.id))
    : basePool

  const filtered = pool.filter(m => selectedIds.has(m.id))
  const displayMessages = zipPageMessages ?? filtered

  function shuffle() {
    const shuffled = [...basePool].sort(() => Math.random() - 0.5)
    const picked = shuffled.slice(0, perPage)
    setShuffleOrder(shuffled.map(m => m.id))
    setSelectedIds(new Set(picked.map(m => m.id)))
  }

  function toggleId(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  function selectAll() { setSelectedIds(new Set(pool.map(m => m.id))) }
  function selectNone() { setSelectedIds(new Set()) }

  const { w } = FORMAT_SIZES[format]
  const cols = format === 'portrait' ? 2 : format === 'landscape' ? 4 : 3
  const palette = CARD_COLORS[style]
  const darkHeader = style === 'colored' || style === 'poster'

  const pageCount = filtered.length > 0 ? Math.ceil(filtered.length / perPage) : 1

  async function toGrayscaleDataUrl(src: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const c = document.createElement('canvas')
        c.width = img.naturalWidth
        c.height = img.naturalHeight
        const ctx = c.getContext('2d')!
        ctx.filter = 'grayscale(1) contrast(1.1)'
        ctx.drawImage(img, 0, 0)
        resolve(c.toDataURL('image/png'))
      }
      img.onerror = () => resolve(src)
      img.src = src
    })
  }

  async function captureCollage(): Promise<Blob> {
    if (!collageRef.current) throw new Error('No ref')

    const imgs = collageRef.current.querySelectorAll<HTMLImageElement>('img[data-photo]')
    const origSrcs: string[] = []
    if (photoTreatment === 'bw') {
      for (const img of imgs) {
        origSrcs.push(img.src)
        img.src = await toGrayscaleDataUrl(img.src)
        img.style.filter = 'none'
      }
    }

    const TARGET_PX: Record<Format, number> = { square: 1080, portrait: 1080, landscape: 1920 }
    const exportScale = Math.ceil(TARGET_PX[format] / w)

    const blob = await htmlToBlob(collageRef.current, {
      backgroundColor: '#F3F0EA',
      pixelRatio: exportScale,
      cacheBust: true,
    })

    imgs.forEach((img, i) => {
      if (origSrcs[i]) {
        img.src = origSrcs[i]
        img.style.filter = ''
      }
    })

    return blob!
  }

  function getCaption() {
    return isOwn
      ? t('shareCaptionOwn')
      : t('shareCaption', { name: recipientName ?? title })
  }

  async function handleExport() {
    if (!collageRef.current) return
    setExporting(true)
    try {
      const blob = await captureCollage()
      const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-${format}.png`
      if (nativeShare) {
        const file = new File([blob], filename, { type: 'image/png' })
        await navigator.share({ files: [file], text: getCaption() })
        setExported(true)
        track('collage_downloaded', { method: 'share', format, style, contentType })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
        setExported(true)
        track('collage_downloaded', { method: 'download', format, style, contentType })
      }
    } finally {
      setExporting(false)
    }
  }

  function handleCopyCaption() {
    navigator.clipboard.writeText(getCaption())
    setCaptionCopied(true)
    setTimeout(() => setCaptionCopied(false), 2500)
  }

  async function handleExportZip() {
    if (filtered.length === 0) return
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()

    const chunks: Message[][] = []
    for (let i = 0; i < filtered.length; i += perPage) {
      chunks.push(filtered.slice(i, i + perPage))
    }

    setZipProgress({ current: 0, total: chunks.length })

    for (let p = 0; p < chunks.length; p++) {
      setZipPageMessages(chunks[p])
      // Let React re-render with the new page messages before capturing
      await new Promise(r => setTimeout(r, 350))

      const blob = await captureCollage()
      const slug = title.toLowerCase().replace(/\s+/g, '-')
      zip.file(`${slug}-page-${p + 1}-of-${chunks.length}.png`, blob)
      setZipProgress({ current: p + 1, total: chunks.length })
    }

    setZipPageMessages(null)

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-collage.zip`
    a.click()
    URL.revokeObjectURL(url)
    setZipProgress(null)
    track('collage_downloaded', { method: 'zip', format, style, contentType, pages: chunks.length })
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isZipping = zipProgress !== null

  const INFO_STEPS = [
    { title: t('infoStep1Title'), body: t('infoStep1Body') },
    { title: t('infoStep2Title'), body: t('infoStep2Body') },
    { title: t('infoStep3Title'), body: t('infoStep3Body') },
    { title: t('infoStep4Title'), body: t('infoStep4Body') },
    { title: t('infoStep5Title'), body: t('infoStep5Body') },
  ]

  return (
    <div>
      {/* ── Info sidebar ── */}
      {infoOpen && (
        <div
          onClick={() => setInfoOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 100 }}
        />
      )}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 'min(300px, 100vw)',
        background: 'var(--bg)',
        borderLeft: 'var(--border-w) solid var(--border)',
        zIndex: 101,
        overflowY: 'auto',
        transform: infoOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 200ms ease-out',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--s-5) var(--s-5) var(--s-4)', borderBottom: 'var(--border-w) solid var(--border)' }}>
          <p className="t-label">{t('infoTitle')}</p>
          <button
            onClick={() => setInfoOpen(false)}
            className="btn btn--ghost"
            style={{ fontSize: '10px', padding: 'var(--s-2) var(--s-4)', minHeight: '40px' }}
          >
            {t('infoClose')}
          </button>
        </div>
        <div style={{ padding: 'var(--s-5)', display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
          {INFO_STEPS.map((step, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--s-3)' }}>
              <div style={{ width: 20, height: 20, background: '#111111', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '9px', color: '#FFFFFF', fontWeight: 400 }}>{i + 1}</span>
              </div>
              <div>
                <p className="t-small" style={{ marginBottom: 'var(--s-1)' }}>{step.title}</p>
                <p className="t-caption t-muted" style={{ lineHeight: 1.6 }}>{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Config panel ── */}
      <div style={{ marginBottom: 'var(--s-6)', border: 'var(--border-w) solid var(--border)' }}>
        <button
          onClick={() => setCustomizing(c => !c)}
          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--s-4) var(--s-6)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <span className="t-label">{customizing ? t('hideCustomize') : t('customize')}</span>
          <span className="t-caption t-muted">{customizing ? '↑' : '↓'}</span>
        </button>
      </div>
      <div style={{ display: customizing ? 'flex' : 'none', flexDirection: 'column', gap: 'var(--s-4)', marginBottom: 'var(--s-6)', padding: 'var(--s-6)', border: 'var(--border-w) solid var(--border)', borderTop: 'none', marginTop: 'calc(-1 * var(--s-6))' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 'var(--s-3)', flexWrap: 'wrap' }}>
          <ConfigGroup label={t('titleLabel')}>
            <input
              className="input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ width: '100%', maxWidth: '320px' }}
            />
          </ConfigGroup>
          <button
            onClick={() => setInfoOpen(true)}
            className="btn btn--ghost"
            style={{ fontSize: '10px', padding: 'var(--s-2) var(--s-4)', minHeight: '40px', flexShrink: 0 }}
          >
            {t('infoButton')} Guide
          </button>
        </div>

        <div style={{ display: 'flex', gap: 'var(--s-8)', flexWrap: 'wrap' }}>
          <ConfigGroup label={t('format')}>
            {(Object.keys(FORMAT_SIZES) as Format[]).map(f => (
              <button key={f} className={`btn ${format === f ? 'btn--solid' : 'btn--ghost'}`} onClick={() => setFormat(f)}>
                {FORMAT_SIZES[f].label}
              </button>
            ))}
          </ConfigGroup>

          <ConfigGroup label={t('style')}>
            {(['clean', 'colored', 'confetti', 'poster'] as Style[]).map(s => (
              <button key={s} className={`btn ${style === s ? 'btn--solid' : 'btn--ghost'}`} onClick={() => setStyle(s)}>
                {s === 'clean' ? t('styleClean') : s === 'colored' ? t('styleColored') : s === 'confetti' ? t('styleConfetti') : t('stylePoster')}
              </button>
            ))}
          </ConfigGroup>
        </div>

        <div style={{ display: 'flex', gap: 'var(--s-8)', flexWrap: 'wrap' }}>
          <ConfigGroup label={t('photos')}>
            <button className={`btn ${photoTreatment === 'bw' ? 'btn--solid' : 'btn--ghost'}`} onClick={() => setPhotoTreatment('bw')}>{t('bw')}</button>
            <button className={`btn ${photoTreatment === 'color' ? 'btn--solid' : 'btn--ghost'}`} onClick={() => setPhotoTreatment('color')}>{t('color')}</button>
          </ConfigGroup>

          <ConfigGroup label={t('content')}>
            {(['words', 'images', 'mixed'] as ContentType[]).map(c => (
              <button key={c} className={`btn ${contentType === c ? 'btn--solid' : 'btn--ghost'}`} onClick={() => setContentType(c)}>
                {c === 'words' ? t('words') : c === 'images' ? t('images') : t('mixed')}
              </button>
            ))}
          </ConfigGroup>

          <ConfigGroup label={t('perPage')}>
            {[6, 9, 12, 16].map(n => (
              <button key={n} className={`btn ${perPage === n ? 'btn--solid' : 'btn--ghost'}`} onClick={() => setPerPage(n)}>
                {n}
              </button>
            ))}
          </ConfigGroup>
        </div>
      </div>

      {/* ── Sélection des messages ── */}
      <div style={{ marginBottom: 'var(--s-6)', border: 'var(--border-w) solid var(--border)' }}>
        <button
          onClick={() => setSelectingMessages(s => !s)}
          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--s-3) var(--s-4)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <span className="t-label">{t('selectMessages')} — {filtered.length}/{pool.length}</span>
          <span className="t-caption t-muted">{selectingMessages ? '↑' : '↓'}</span>
        </button>
        {selectingMessages && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--s-2)', padding: 'var(--s-2) var(--s-4)', borderTop: 'var(--border-w) solid var(--border)', flexWrap: 'wrap' }}>
              <button className="btn btn--ghost" style={{ fontSize: '10px', padding: 'var(--s-2) var(--s-4)', minHeight: '40px' }} onClick={selectAll}>{t('selectAll')}</button>
              <button className="btn btn--ghost" style={{ fontSize: '10px', padding: 'var(--s-2) var(--s-4)', minHeight: '40px' }} onClick={selectNone}>{t('selectNone')}</button>
              <button className="btn btn--ghost" style={{ fontSize: '10px', padding: 'var(--s-2) var(--s-4)', minHeight: '40px' }} onClick={shuffle}>{t('shuffle')}</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
          {pool.map((msg, i) => {
            const on = selectedIds.has(msg.id)
            return (
              <button
                key={msg.id}
                onClick={() => toggleId(msg.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  alignItems: 'center',
                  gap: 'var(--s-3)',
                  padding: 'var(--s-3) var(--s-4)',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: i < pool.length - 1 ? 'var(--border-w) solid var(--border)' : 'none',
                  background: on ? 'var(--bg)' : 'rgba(0,0,0,0.03)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <div style={{ width: 10, height: 10, border: '1px solid var(--border-strong)', background: on ? '#111111' : 'transparent', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <span className="t-small" style={{ marginRight: 'var(--s-2)' }}>{msg.authorName || t('anonymous')}</span>
                  <span className="t-caption t-muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {msg.content.slice(0, 60)}{msg.content.length > 60 ? '…' : ''}
                  </span>
                </div>
                {msg.photoUrl && (
                  <img src={msg.photoUrl} alt="" style={{ width: 24, height: 24, objectFit: 'cover', filter: 'grayscale(1)', flexShrink: 0 }} />
                )}
              </button>
            )
          })}
            </div>
          </>
        )}
      </div>

      {/* ── Actions ── */}
      <div style={{ marginBottom: 'var(--s-6)' }}>
        {messages.length > 9 && !customizing && !selectingMessages && (
          <p className="t-caption t-muted" style={{ marginBottom: 'var(--s-3)' }}>
            {t('smartHint', { selected: filtered.length, total: messages.length })}
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--s-3)', flexWrap: 'wrap' }}>
          {isZipping && (
            <p className="t-caption t-muted">
              {t('zipProgress', { current: zipProgress.current, total: zipProgress.total })}
            </p>
          )}
          <button
            className="btn btn--ghost"
            onClick={handleExportZip}
            disabled={isZipping || exporting || filtered.length === 0}
          >
            {isZipping
              ? t('generatingZip', { current: zipProgress!.current, total: zipProgress!.total })
              : t('exportZipAll', { count: messages.length })}
          </button>
          <button className="btn btn--solid" onClick={handleExport} disabled={exporting || isZipping || filtered.length === 0}>
            {exporting ? t('exporting') : nativeShare ? t('shareNative') : t('exportSmart')}
          </button>
        </div>
      </div>

      {/* ── Post-export CTA ── */}
      {exported && (
        <div style={{
          marginBottom: 'var(--s-6)',
          padding: 'var(--s-6)',
          border: 'var(--border-w) solid var(--fg)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--s-4)',
        }}>
          <div>
            <p className="t-label" style={{ marginBottom: 'var(--s-1)' }}>{t('shareTitle')}</p>
            <p className="t-small t-muted">{t('shareSubtitle')}</p>
          </div>
          <div style={{
            background: 'rgba(0,0,0,0.04)',
            padding: 'var(--s-4)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            lineHeight: 1.6,
            color: 'var(--fg)',
          }}>
            {getCaption()}
          </div>
          <button className="btn btn--solid" onClick={handleCopyCaption} style={{ alignSelf: 'flex-start' }}>
            {captionCopied ? t('shareCaptionCopied') : t('shareCopyCaption')}
          </button>
        </div>
      )}

      {/* ── Collage poster ── */}
      <div style={{ overflowX: 'auto', paddingBottom: 'var(--s-4)' }}>
        <div ref={collageRef} style={{ width: w, background: '#F3F0EA', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>

          {/* Confetti layer */}
          {(style === 'confetti' || style === 'poster') && <ConfettiLayer />}

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div style={{
              padding: style === 'poster' ? '18px 22px 14px' : '12px 18px',
              background: darkHeader ? '#111111' : '#F3F0EA',
              borderBottom: darkHeader ? 'none' : '2px solid #111111',
              flexShrink: 0,
            }}>
              {style === 'poster' && (
                <p style={{ fontFamily: "'Space Mono',monospace", fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#555', marginBottom: '4px' }}>
                  BIRTHDAYWALL
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: style === 'poster' ? '28px' : '18px', letterSpacing: '-0.01em', lineHeight: 1, color: darkHeader ? '#FFFFFF' : INKC, margin: 0 }}>
                    {title}
                  </h2>
                  <p style={{ fontFamily: "'Space Mono',monospace", fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888888', marginTop: '5px' }}>
                    {ownerName} · {displayMessages.length} message{displayMessages.length > 1 ? 's' : ''}
                  </p>
                </div>
                <div style={{ width: '7px', height: '7px', background: '#7C5CFF', flexShrink: 0 }} />
              </div>
            </div>

            {/* Accent separator bar */}
            {style === 'colored' && (
              <div style={{ height: '3px', background: '#7C5CFF', flexShrink: 0 }} />
            )}

            {/* Card grid */}
            {displayMessages.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <p style={{ fontFamily: "'Space Mono',monospace", color: '#888', fontSize: '11px' }}>{t('noSelection')}</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoFlow: 'dense', gap: '8px', padding: '12px' }}>
                {displayMessages.map((msg, i) => {
                  const { bg, fg } = palette[i % palette.length]
                  const span = contentType === 'images' ? 1 : Math.min(cols, msg.content.length > 350 ? 3 : msg.content.length > 150 ? 2 : 1)
                  const fontSize = span === 3 ? '12px' : span === 2 ? '11px' : '10px'

                  return (
                    <div key={msg.id} style={{ gridColumn: `span ${span}`, position: 'relative' }}>
                      <div style={{
                        border: `2px solid ${INKC}`,
                        borderRadius: '14px',
                        boxShadow: `3px 3px 0 ${INKC}`,
                        background: bg,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        padding: contentType === 'images' && msg.photoUrl ? '0' : '12px',
                      }}>
                        {style === 'poster' && (
                          <div style={{ height: '3px', background: BAR_COLORS[i % BAR_COLORS.length], marginBottom: '8px', flexShrink: 0 }} />
                        )}

                        {contentType !== 'words' && msg.photoUrl && (
                          <img src={msg.photoUrl} alt="" data-photo="1" style={{ width: '100%', display: 'block', aspectRatio: contentType === 'images' ? '1' : '4/3', objectFit: 'cover', filter: photoTreatment === 'bw' ? 'grayscale(100%) contrast(1.1)' : 'none', flexShrink: 0 }} />
                        )}

                        {contentType !== 'images' && (
                          <p style={{ fontFamily: "'Space Mono',monospace", fontSize, lineHeight: 1.6, color: fg, margin: contentType === 'mixed' && msg.photoUrl ? '6px 0 4px' : '0 0 6px' }}>
                            {msg.content}
                          </p>
                        )}

                        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.08em', color: fg === '#FFFFFF' ? 'rgba(255,255,255,0.5)' : '#888888', display: 'block', padding: contentType === 'images' ? '5px 8px' : '0' }}>
                          {msg.authorName ? `- ${msg.authorName}` : `- ${t('anonymous')}`}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* CTA strip */}
            <div style={{
              flexShrink: 0,
              background: '#F3F0EA',
              borderTop: '1px solid #CCCCCC',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 14px',
              gap: '8px',
            }}>
              <p style={{ fontFamily: "'Space Mono',monospace", fontSize: '7px', color: '#999999', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                {t('ctaText')}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '4px', height: '4px', background: '#7C5CFF', flexShrink: 0 }} />
                <p style={{ fontFamily: "'Space Mono',monospace", fontSize: '7px', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                  hbdwall.xyz
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

function ConfigGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="t-label" style={{ marginBottom: 'var(--s-2)' }}>{label}</p>
      <div style={{ display: 'flex', gap: 'var(--s-1)', flexWrap: 'wrap' }}>{children}</div>
    </div>
  )
}
