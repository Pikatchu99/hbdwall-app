import { buildWordCloud } from './wordCloud'
import type { WallReplayInputProps, WallReplayMessage } from '@/remotion/types'

const HBDWALL_SOCIALS = { instagram: 'instagram.com/hbdwall', tiktok: 'tiktok.com/@hbdwall' }

interface WallForReplay {
  slug: string
  recipientName: string | null
  title: string
  date: Date
}

interface MessageForReplay {
  authorName: string | null
  content: string
  photoUrl: string | null
}

export function buildWallReplayInputProps(
  wall: WallForReplay,
  featuredMessages: WallReplayMessage[],
  allMessages: MessageForReplay[]
): WallReplayInputProps {
  const authorCount = new Set(allMessages.map(m => m.authorName?.trim()).filter(Boolean)).size
  const photoCount = allMessages.filter(m => m.photoUrl).length
  const wordCloud = buildWordCloud(allMessages.map(m => m.content))

  return {
    wallSlug: wall.slug,
    recipientName: wall.recipientName?.trim() || wall.title,
    wallDateLabel: new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(wall.date),
    stats: { messageCount: allMessages.length, authorCount, photoCount },
    messages: featuredMessages,
    wordCloud,
    socials: HBDWALL_SOCIALS,
  }
}
