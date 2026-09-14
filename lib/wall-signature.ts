// Murs « signature » : une couche de personnalisation par slug, opt-in et
// invisible pour tous les autres murs. Un mur signature garde le thème choisi par
// le visiteur, mais remplace la palette par la sienne, affiche une bannière et un
// portrait, et propose des amorces d'écriture aux invités.
//
// Volontairement en config (pas en base) pour la première itération : zéro
// migration, facile à retirer. Les photos de couverture vivent sous
// /public/signatures/<slug>/ (dossier ignoré par git : photos privées).

export type Locale = 'fr' | 'en'

export type WallSignature = {
  /** Tokens joyeux surchargés (OKLCH). Appliqués en CSS custom properties sur la racine du mur. */
  palette: {
    paper: string
    ink: string
    accent: string
    badge: string
    heart: string
    muted: string
  }
  /** Mêmes couleurs en hex pour Satori (image OG), qui ne lit pas l'OKLCH. */
  og: {
    paper: string
    ink: string
    accent: string
    badge: string
    heart: string
  }
  /** Bannière horizontale (façon YouTube / LinkedIn), pleine largeur. */
  banner: {
    src: string
    alt: string
    /** object-position CSS, pour cadrer la photo (défaut : center). */
    position?: string
  }
  /** Portrait collé sur la bannière ; sert aussi d'image de partage (OG). */
  cover: {
    src: string
    alt: string
    position?: string
  }
  /** Photo secondaire, petit carré collé à droite de la bannière. */
  extra?: { src: string; alt: string; position?: string }
  /** Petit texte au-dessus du prénom (après la date). */
  eyebrow: Record<Locale, string>
  /** Amorces proposées aux invités : placeholder tournant + puces cliquables. */
  prompts: Record<Locale, string[]>
  /** Message vocal joué à l'invité une fois son mot envoyé (« merci »). */
  thanksAudio?: string
}

const SIGNATURES: Record<string, WallSignature> = {
  'asmaa16-birthday': {
    // Sable chaud, ciel, or : la palette de la photo.
    palette: {
      paper:  'oklch(0.975 0.014 80)',
      ink:    'oklch(0.21 0.035 250)',
      accent: 'oklch(0.58 0.15 240)',
      badge:  'oklch(0.88 0.16 88)',
      heart:  'oklch(0.68 0.19 30)',
      muted:  'oklch(0.50 0.03 250)',
    },
    og: {
      paper:  '#F8F4EC',
      ink:    '#1B2333',
      accent: '#3F7FCF',
      badge:  '#FFD65C',
      heart:  '#F0755A',
    },
    banner: {
      src: '/signatures/asmaa16-birthday/banner.jpg',
      alt: 'Asmaa, ciel et plage',
      position: '50% 40%',
    },
    cover: {
      src: '/signatures/asmaa16-birthday/cover.jpg',
      alt: 'Asmaa',
      position: '50% 30%',
    },
    extra: { src: '/signatures/asmaa16-birthday/extra.jpg', alt: 'Asmaa, lunettes de soleil' },
    eyebrow: {
      fr: "c'est son jour",
      en: 'her day',
    },
    prompts: {
      fr: [
        "Je me souviens du jour où on…",
        "Ce que j'admire chez toi, c'est…",
        "La chose que je ne t'ai jamais dite :",
        "Le fou rire qu'on a eu quand…",
        "Si je devais te décrire en trois mots…",
        "Pour l'année qui vient, je te souhaite…",
      ],
      en: [
        'I remember the day we…',
        'What I admire about you is…',
        "The thing I never told you:",
        'That laughing fit we had when…',
        'If I had to describe you in three words…',
        'For the year ahead, I wish you…',
      ],
    },
    thanksAudio: '/signatures/asmaa16-birthday/merci.m4a',
  },
}

export function getWallSignature(slug: string): WallSignature | null {
  return SIGNATURES[slug] ?? null
}

/**
 * Variables CSS à poser sur la racine du mur. En thème joyeux, toute la palette
 * est remappée ; en classique, seul l'accent change (le classique reste
 * monochrome, c'est son identité).
 */
export function signatureCssVars(sig: WallSignature): Record<string, string> {
  return {
    '--accent':    sig.palette.accent,
    '--accent-ink': '#ffffff',
    '--v-paper':   sig.palette.paper,
    '--v-ink':     sig.palette.ink,
    '--v-violet':  sig.palette.accent,
    '--v-yellow':  sig.palette.badge,
    '--v-lime':    sig.palette.badge,
    '--v-magenta': sig.palette.heart,
    '--v-blue':    sig.palette.accent,
    '--fg-muted':  sig.palette.muted,
  }
}

export function pickLocale(locale: string): Locale {
  return locale === 'en' ? 'en' : 'fr'
}
