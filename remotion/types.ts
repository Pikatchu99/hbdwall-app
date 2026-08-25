export interface WallReplayMessage {
  id: string
  authorName: string | null
  content: string
  photoUrl: string | null
}

export interface WallReplayTile {
  id: string
  authorName: string | null
  photoUrl: string | null
}

export type WallReplayInputProps = {
  wallSlug: string
  recipientName: string
  wallDateLabel: string // e.g. "14 mars", pre-formatted by the worker
  stats: {
    messageCount: number
    authorCount: number
    photoCount: number
  }
  messages: WallReplayMessage[]
  wallTiles: WallReplayTile[]
  socials: {
    instagram: string
    tiktok: string
  }
} & Record<string, unknown>
