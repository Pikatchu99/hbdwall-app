'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'

const DRAW_MS    = 1200
const CARD_MS    = 900
const HOLD_MS    = 3000

type Phase = 'drawing' | 'filling' | 'done'

export default function DemoCollage() {
  const t = useTranslations('landing')
  const [phase, setPhase] = useState<Phase>('drawing')
  const [visible, setVisible] = useState(0)
  const [cycle, setCycle] = useState(0)

  const cards = [
    { id: '1', kind: 'photo' as const, author: 'Inès',    img: '/yemalin.jpg',  text: t('demoCard1') },
    { id: '2', kind: 'text'  as const, author: 'Karim',   text: t('demoCard2') },
    { id: '3', kind: 'photo' as const, author: 'Chloé',   img: '/yemalin2.jpg', text: t('demoCard3') },
    { id: '4', kind: 'text'  as const, author: 'Mama',    text: t('demoCard4') },
    { id: '5', kind: 'text'  as const, author: 'Yasmine', text: t('demoCard5') },
    { id: '6', kind: 'photo' as const, author: 'Jade',    img: '/yemalin3.jpg', text: t('demoCard6') },
  ]

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    if (phase === 'drawing') {
      timer = setTimeout(() => { setPhase('filling'); setVisible(0) }, DRAW_MS)
    } else if (phase === 'filling') {
      if (visible < cards.length) {
        timer = setTimeout(() => setVisible(v => v + 1), CARD_MS)
      } else {
        setPhase('done')
      }
    } else if (phase === 'done') {
      timer = setTimeout(() => {
        setCycle(c => c + 1)
        setPhase('drawing')
        setVisible(0)
      }, HOLD_MS)
    }

    return () => clearTimeout(timer)
  }, [phase, visible, cards.length])

  const drawing = phase === 'drawing'

  return (
    <div style={{ width: '100%', maxWidth: '520px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingBottom: 'var(--s-3)',
        borderBottom: '2px solid var(--fg)',
      }}>
        <div>
          <h2 className="t-h2" style={{ marginBottom: 'var(--s-1)' }}>{t('demoTitle')}</h2>
          <span className="t-label t-muted">{t('demoSubtitle')}</span>
        </div>
        <span className="dot-accent" />
      </div>

      {/* Grid */}
      <div style={{ position: 'relative' }}>

        {/* SVG draws the border — key changes each cycle to restart animation */}
        <AnimatePresence>
          {drawing && (
            <motion.svg
              key={`svg-${cycle}`}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none' }}
            >
              <motion.rect
                x="1" y="1" width="98" height="98"
                fill="none"
                stroke="var(--fg)"
                strokeWidth="1.2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: DRAW_MS / 1000, ease: 'easeInOut' }}
              />
            </motion.svg>
          )}
        </AnimatePresence>

        {/* Cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          borderTop: 'none',
          borderLeft:   drawing ? 'none' : '1px solid var(--border-strong)',
          borderRight:  drawing ? 'none' : '1px solid var(--border-strong)',
          borderBottom: drawing ? 'none' : '1px solid var(--border-strong)',
          minHeight: '280px',
        }}>
          {cards.map((card, i) => {
            const show = !drawing && i < visible
            return (
              <div
                key={card.id}
                style={{
                  borderRight:  drawing ? 'none' : '1px solid var(--border)',
                  borderBottom: drawing ? 'none' : '1px solid var(--border)',
                  minHeight: '93px',
                  background: 'var(--bg)',
                  overflow: 'hidden',
                }}
              >
                <AnimatePresence>
                  {show && (
                    <motion.div
                      key={`${cycle}-${card.id}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
                      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                    >
                      {card.kind === 'photo' ? (
                        <>
                          <img src={card.img} alt="" className="img-bw"
                            style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                          <div style={{ padding: '6px 8px' }}>
                            <p style={{ fontFamily: "'Space Mono',monospace", fontSize: '9px', lineHeight: 1.5, marginBottom: '3px' }}>{card.text}</p>
                            <span className="t-label t-muted" style={{ fontSize: '8px' }}>— {card.author}</span>
                          </div>
                        </>
                      ) : (
                        <div style={{ padding: '10px 8px', minHeight: '93px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <p style={{ fontFamily: "'Space Mono',monospace", fontSize: '9px', lineHeight: 1.5, color: 'var(--fg)' }}>"{card.text}"</p>
                          <span className="t-label t-muted" style={{ fontSize: '8px', marginTop: '4px' }}>— {card.author}</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>

      {/* Fake toolbar */}
      <div style={{ display: 'flex', gap: 'var(--s-2)', marginTop: 'var(--s-3)', alignItems: 'center' }}>
        <span className="btn btn--solid" style={{ cursor: 'default', opacity: 0.5, fontSize: '9px', padding: '4px 8px' }}>↓ PNG</span>
        <span className="t-caption t-muted" style={{ fontSize: '9px' }}>
          {visible} / {cards.length} {t('demoMessages')}
        </span>
      </div>
    </div>
  )
}
