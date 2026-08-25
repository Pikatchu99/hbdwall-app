import { useCurrentFrame, interpolate } from 'remotion'
import { colors } from '../theme'

// Tracés compacts (bien à l'intérieur du viewBox 0-100) : un inset ~0
// doit déjà donner un cercle ajusté ; les appelants n'ont qu'à affiner.
const CIRCLE_PATHS = [
  'M22,52 C19,34 34,19 52,18 C71,17 84,32 81,50 C84,68 69,83 51,84 C33,85 19,70 22,52 Z',
  'M20,46 C24,28 39,15 57,18 C75,21 84,38 80,54 C84,72 65,84 47,81 C29,78 16,64 20,46 Z',
]
const UNDER_PATHS = [
  'M2,20 Q15,6 28,20 Q41,34 54,20 Q67,6 80,20 Q90,29 98,22',
  'M3,18 Q18,32 33,16 Q48,2 63,18 Q78,32 97,17',
]

interface Props {
  kind: 'circle' | 'under'
  variant?: number
  delay?: number
  color?: string
  /** Marge du doodle autour du mot, en `inset` CSS (vertical horizontal). À ajuster selon la taille de police de l'appelant. Cercle uniquement. */
  inset?: string
  /** Décalage vertical du soulignement sous le mot. Les valeurs par défaut sont pensées pour du texte ~26-30px ; à réduire (en magnitude) pour un très gros texte, sinon le trait déborde sur la ligne suivante. */
  underBottom?: string
  underHeight?: string
  children: React.ReactNode
}

// Doodle qui se dessine progressivement autour d'un mot, façon annotation
// dessinée à la main — utilisé pour mettre en avant un mot-clé par scène.
// Le pourcentage d'inset est relatif à la boîte du texte englobant : une
// même valeur donne un résultat très différent selon la taille de police,
// donc chaque appelant doit fournir un `inset` adapté à sa propre police.
export function HighlightWord({ kind, variant = 0, delay = 12, color = colors.violet, inset, underBottom = '-55%', underHeight = '45%', children }: Props) {
  const frame = useCurrentFrame()
  const dashoffset = interpolate(frame, [delay, delay + 22], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const path = kind === 'circle' ? CIRCLE_PATHS[variant % CIRCLE_PATHS.length] : UNDER_PATHS[variant % UNDER_PATHS.length]
  // Le "line box" d'un mot déborde nettement sous la ligne de base (espace
  // réservé aux descendantes, même sans lettre qui en a) : sans correction,
  // le cercle centré sur cette boîte paraît décalé vers le bas par rapport
  // au mot visible. On remonte donc le cercle par défaut (haut très négatif,
  // bas ramené vers l'intérieur) plutôt qu'un inset symétrique.
  const box = kind === 'circle'
    ? (inset ? { inset } : { top: '-6%', right: '2%', bottom: '5%', left: '2%' })
    : { left: '-6%', right: '-6%', bottom: underBottom, height: underHeight }

  return (
    <span style={{ position: 'relative', display: 'inline-block', lineHeight: 1 }}>
      {children}
      <svg
        viewBox={kind === 'circle' ? '0 0 100 100' : '0 0 100 40'}
        preserveAspectRatio="none"
        style={{ position: 'absolute', pointerEvents: 'none', overflow: 'visible', ...box }}
      >
        <path
          d={path}
          pathLength={1}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={1}
          strokeDashoffset={dashoffset}
        />
      </svg>
    </span>
  )
}
