import { buildWordCloud } from './wordCloud'
import type { WallReplayInputProps, WallReplayMessage } from '@/remotion/types'

const HBDWALL_SOCIALS = { instagram: 'instagram.com/hbdwall', tiktok: 'tiktok.com/@hbdwall' }
const MAX_FEATURED_MESSAGES = 4
// Un message avec photo dépasse quasi toujours un message texte seul, même long —
// la valeur est plus grande que la longueur habituelle d'un message pour peser lourd.
const PHOTO_SCORE_BONUS = 200

interface WallForReplay {
  slug: string
  recipientName: string | null
  title: string
  date: Date
}

interface MessageForReplay {
  id: string
  authorName: string | null
  content: string
  photoUrl: string | null
  isPinned: boolean
}

function messageScore(m: MessageForReplay) {
  return m.content.length + (m.photoUrl ? PHOTO_SCORE_BONUS : 0)
}

// Les messages épinglés (choix explicite du propriétaire) passent toujours en premier ;
// le reste est classé par score pour éviter qu'un mur avec beaucoup de messages courts
// ("Bon anniv !") ne finisse avec un replay peu spectaculaire.
function selectFeaturedMessages(messages: MessageForReplay[]): WallReplayMessage[] {
  const pinned = messages.filter(m => m.isPinned)
  const rest = messages.filter(m => !m.isPinned).sort((a, b) => messageScore(b) - messageScore(a))
  return [...pinned, ...rest]
    .slice(0, MAX_FEATURED_MESSAGES)
    .map(({ id, authorName, content, photoUrl }) => ({ id, authorName, content, photoUrl }))
}

export function buildWallReplayInputProps(
  wall: WallForReplay,
  allMessages: MessageForReplay[]
): WallReplayInputProps {
  const authorCount = new Set(allMessages.map(m => m.authorName?.trim()).filter(Boolean)).size
  const photoCount = allMessages.filter(m => m.photoUrl).length
  const wordCloud = buildWordCloud(allMessages.map(m => m.content))
  const messages = selectFeaturedMessages(allMessages)

  return {
    wallSlug: wall.slug,
    recipientName: wall.recipientName?.trim() || wall.title,
    wallDateLabel: new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(wall.date),
    stats: { messageCount: allMessages.length, authorCount, photoCount },
    messages,
    wordCloud,
    socials: HBDWALL_SOCIALS,
  }
}
