'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Gift } from 'lucide-react'
import { useTranslations } from 'next-intl'

type Item = {
  id: string
  title: string
  url: string | null
  price: string | null
}

// Bouton pulsant à côté du titre du wall. Au clic, ouvre la wishlist dans une
// modale avec un effet « reveal » (comme si on ouvrait une page). Invités uniquement.
export default function WishlistButton({ ownerName, items }: { ownerName: string; items: Item[] }) {
  const t = useTranslations('wishlist')
  const [open, setOpen] = useState(false)

  if (items.length === 0) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="t-label wishlist-pulse"
        style={{
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--s-2)',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          color: 'var(--accent)',
          letterSpacing: 'var(--tracking-label)',
        }}
      >
        <Gift size={14} aria-hidden /> {t('buttonLabel')}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--s-6)',
              zIndex: 1000,
              perspective: '1200px',
            }}
          >
            <motion.div
              initial={{ opacity: 0, rotateX: -16, y: -14, scale: 0.95 }}
              animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, rotateX: -12, y: -8, scale: 0.97 }}
              transition={{ duration: 0.34, ease: [0.2, 0.6, 0.2, 1] }}
              onClick={e => e.stopPropagation()}
              className="card"
              style={{
                width: '100%',
                maxWidth: '440px',
                maxHeight: '80vh',
                overflowY: 'auto',
                transformOrigin: 'top center',
                background: 'var(--surface)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--s-4)', marginBottom: 'var(--s-6)' }}>
                <div>
                  <p className="t-label t-muted" style={{ marginBottom: 'var(--s-2)', letterSpacing: 'var(--tracking-label)' }}>
                    {t('guestKicker')}
                  </p>
                  <h2 className="t-h2">{t('guestTitle', { name: ownerName })}</h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="t-body"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, flexShrink: 0 }}
                >
                  ✕
                </button>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {items.map(item => (
                  <li
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 'var(--s-3)',
                      padding: 'var(--s-3) 0',
                      borderTop: '1px solid var(--border)',
                    }}
                  >
                    <span style={{ color: 'var(--accent)', flexShrink: 0 }}>→</span>
                    <span className="t-body" style={{ flex: 1 }}>
                      {item.url ? (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="link">{item.title}</a>
                      ) : (
                        item.title
                      )}
                    </span>
                    {item.price && (
                      <span className="t-small t-muted" style={{ fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{item.price}</span>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
