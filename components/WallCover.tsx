import type { ReactNode } from 'react'
import type { WallSignature } from '@/lib/wall-signature'
import { Sparkle, Heart, Star, Confetti } from '@/components/joyful/Doodles'

interface Props {
  signature: WallSignature
  name: string
  dateLabel: string
  eyebrow: string
  description: string
  messageCount: number
  countLabel: string
  /** Compte à rebours (client) rendu sous le texte. */
  countdown: ReactNode
  /** Bouton wishlist, sur sa propre ligne sous la description. */
  wishlist: ReactNode
}

// Couronne dessinée à la main, dans la veine des doodles du design system.
function Crown({ size = 78, color = 'var(--sig-d1)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 30 24" fill="none" aria-hidden>
      <path d="M3 20 1.5 7l7 5.5L15 2l6.5 10.5 7-5.5L27 20Z" fill={color} stroke="#0d0b14" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M3 20h24" stroke="#0d0b14" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="9" cy="14.5" r="1.4" fill="#0d0b14" />
      <circle cx="15" cy="12.5" r="1.4" fill="#0d0b14" />
      <circle cx="21" cy="14.5" r="1.4" fill="#0d0b14" />
    </svg>
  )
}

/**
 * Hero « signature » : une bannière horizontale pleine largeur (façon chaîne
 * YouTube / profil LinkedIn) décorée comme une page de carnet (scotch, ruban,
 * stickers dessinés), le portrait collé à cheval en bas à gauche, une petite
 * photo carrée à droite, puis le prénom en grand. Tokenisé : suit le thème du
 * visiteur. Server component, zéro JS propre.
 */
export default function WallCover({
  signature, name, dateLabel, eyebrow, description, messageCount, countLabel, countdown, wishlist,
}: Props) {
  const { banner, cover, extra } = signature
  const [day, ...monthParts] = dateLabel.split(' ')
  const month = monthParts.join(' ')
  const monthShort = month.length > 5 ? `${month.slice(0, 4)}.` : month

  return (
    <section className="sig-cover" aria-labelledby="sig-name">
      {/* Doodles flottants (joyeux seulement), purement décoratifs */}
      <span className="sig-doodle" style={{ top: '6%', left: '2%', '--rot': '-12deg' } as React.CSSProperties} aria-hidden>
        <Sparkle size={34} color="var(--v-yellow)" />
      </span>
      <span className="sig-doodle" style={{ top: '10%', right: '3%', '--rot': '10deg', animationDelay: '-2s' } as React.CSSProperties} aria-hidden>
        <Heart size={30} color="var(--v-magenta)" />
      </span>
      <span className="sig-doodle" style={{ bottom: '14%', right: '8%', '--rot': '18deg', animationDelay: '-4s' } as React.CSSProperties} aria-hidden>
        <Star size={26} color="var(--v-violet)" />
      </span>

      <div className="sig-banner-wrap">
        {/* Cadre : la photo + le ruban, coupés aux bords arrondis. */}
        <div className="sig-banner-frame">
          <img
            className="sig-banner"
            src={banner.src}
            alt={banner.alt}
            style={{ objectPosition: banner.position ?? 'center' }}
            fetchPriority="high"
          />
          <span className="sig-ribbon" aria-hidden>
            <span>Happy birthday</span><span>✦</span><span>Happy birthday</span><span>✦</span>
          </span>
        </div>

        {/* Scotch aux coins */}
        <span className="sig-tape sig-tape--tl" aria-hidden />
        <span className="sig-tape sig-tape--tr" aria-hidden />
        <span className="sig-tape sig-tape--br" aria-hidden />

        {/* Stickers dessinés collés sur la photo */}
        <span className="sig-sticker sig-sticker--crown" aria-hidden><Crown /></span>
        <span className="sig-sticker sig-sticker--star1" aria-hidden><Star size={40} color="var(--sig-d1)" /></span>
        <span className="sig-sticker sig-sticker--star2" aria-hidden><Star size={26} color="var(--sig-d3)" /></span>
        <span className="sig-sticker sig-sticker--heart" aria-hidden><Heart size={38} color="var(--sig-d2)" /></span>
        <span className="sig-sticker sig-sticker--sparkle" aria-hidden><Sparkle size={30} color="var(--sig-d1)" /></span>
        <span className="sig-sticker sig-sticker--confetti" aria-hidden><Confetti size={40} /></span>

        {/* Sticker date : gros jour, mois en dessous */}
        <span className="sig-badge sig-badge--date">
          <b>{day}</b>
          <small>{monthShort}</small>
        </span>

        <figure className="sig-profile">
          <img src={cover.src} alt={cover.alt} style={{ objectPosition: cover.position ?? 'center' }} />
          {messageCount > 0 && <span className="sig-badge sig-badge--count">{countLabel}</span>}
        </figure>

        {extra && (
          <figure className="sig-extra">
            <img src={extra.src} alt={extra.alt} style={{ objectPosition: extra.position ?? 'center' }} />
          </figure>
        )}
      </div>

      <div className="sig-body">
        <div className="sig-text">
          <p className="sig-eyebrow">{eyebrow}</p>
          <h1 id="sig-name" className="sig-name"><mark>{name}</mark></h1>
          <p className="sig-desc">{description}</p>
          <div className="sig-actions">{wishlist}</div>
          <div className="sig-countdown">{countdown}</div>
        </div>
      </div>
    </section>
  )
}
