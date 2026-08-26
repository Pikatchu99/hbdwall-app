export interface WallReplayMessage {
  id: string
  authorName: string | null
  content: string
  photoUrl: string | null
}

export interface WordCount {
  word: string
  count: number
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
  wordCloud: WordCount[]
  socials: {
    instagram: string
    tiktok: string
  }
} & Record<string, unknown>
