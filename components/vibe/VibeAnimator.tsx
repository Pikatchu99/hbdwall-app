'use client'
import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

// Anime le contenu (rendu côté serveur) de la page /vibe : entrée, reveals au
// scroll, et vie des mascottes (bob + salut). Tout est coupé si reduced-motion.
export default function VibeAnimator({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const q = (s: string) => Array.from(root.current!.querySelectorAll<HTMLElement>(s))

        // Entrée du hero au chargement.
        gsap.from(['.vibe-eyebrow', '.vibe-hero'].flatMap(q), {
          y: 32, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12,
        })

        // Reveal au scroll des sections.
        q('.vibe-steps-sec, .vibe-band, .vibe-cards, .vibe-spotlight, .vibe-proof, .vibe-final').forEach(el => {
          gsap.from(el, {
            y: 44, opacity: 0, duration: 0.7, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 95%', toggleActions: 'play none none reverse' },
          })
        })

        // Notes : apparition + flottement (sur le wrapper → le hover reste sur la note).
        const wraps = q('.note-wrap')
        gsap.from(wraps, { opacity: 0, duration: 0.5, ease: 'power2.out', stagger: 0.1, delay: 0.35 })
        wraps.forEach((w, i) => {
          gsap.to(w, { y: -8, duration: 1.3 + i * 0.12, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.18 })
        })

        // Doodles : tous flottent + se balancent (vivant), certains scintillent en plus.
        q('.hero-doodle').forEach((el, i) => {
          gsap.to(el, {
            y: -18, rotation: i % 2 ? 14 : -14,
            duration: 1.8 + (i % 5) * 0.22, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: (i % 4) * 0.18,
          })
          if (i % 3 === 0) {
            gsap.to(el, { opacity: 0.5, duration: 1.1 + (i % 3) * 0.2, ease: 'sine.inOut', yoyo: true, repeat: -1 })
          }
        })

        // Marquee en pilule : s'ouvre depuis le centre quand la section entre (clip-path, pas de distorsion).
        const frame = q('.vibe-marquee-frame')
        if (frame.length) {
          gsap.from(frame, {
            clipPath: 'inset(0px 50% 0px 50% round 9999px)', duration: 1.1, ease: 'power3.out',
            scrollTrigger: { trigger: '.vibe-marquee-frame', start: 'top 82%', toggleActions: 'play none none reverse' },
          })
        }

        // Années : effet roulette — chaque nombre roule jusqu'à tomber sur le bon (au scroll).
        const years = q('.year-num')
        if (years.length) {
          const SPAN = 40 // nombre de crans à dérouler avant de se poser
          // Valeur de départ posée tout de suite (évite le flash valeur finale → départ).
          years.forEach(el => { el.textContent = String(+el.dataset.year! - SPAN) })
          ScrollTrigger.create({
            trigger: '.vibe-spotlight', start: 'top 78%', once: true,
            onEnter: () => {
              years.forEach((el, i) => {
                const target = +el.dataset.year!
                const o = { v: target - SPAN }
                // Durée croissante → les années se posent l'une après l'autre (haut → bas).
                gsap.to(o, {
                  v: target, duration: 2.2 + i * 0.5, ease: 'power2.out', snap: { v: 1 },
                  onUpdate: () => { el.textContent = String(Math.round(o.v)) },
                })
              })
            },
          })
        }

        // Constellation : les avatars apparaissent un par un, du centre vers l'extérieur.
        const btiles = q('.bcloud-tile')
        if (btiles.length) {
          gsap.from(btiles, {
            scale: 0, opacity: 0, duration: 0.4, ease: 'back.out(1.7)',
            stagger: 0.03, transformOrigin: 'center center', clearProps: 'transform,opacity',
            scrollTrigger: { trigger: '.bcloud', start: 'top 80%', toggleActions: 'play none none none' },
          })
        }

        // Footer : le wordmark monte lettre par lettre au scroll.
        const letters = q('.wm-letter')
        if (letters.length) {
          gsap.from(letters, {
            yPercent: 130, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.05,
            scrollTrigger: { trigger: '.vibe-footer', start: 'top 92%', toggleActions: 'play none none reverse' },
          })
        }
      })
    },
    { scope: root },
  )

  return <div ref={root}>{children}</div>
}
