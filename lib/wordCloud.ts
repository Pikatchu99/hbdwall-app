import { removeStopwords, eng, fra } from 'stopword'

const STOPWORDS = [...eng, ...fra]
const MIN_WORD_LENGTH = 3
const MAX_WORDS = 24

export interface WordCount {
  word: string
  count: number
}

export function buildWordCloud(texts: string[]): WordCount[] {
  const counts = new Map<string, number>()

  for (const text of texts) {
    const tokens = text
      .toLowerCase()
      .replace(/[’']/g, ' ')
      .replace(/[^a-zàâäéèêëïîôöùûüçñ\s]/gi, ' ')
      .split(/\s+/)
      .filter(Boolean)

    const words = removeStopwords(tokens, STOPWORDS).filter(w => w.length >= MIN_WORD_LENGTH)

    for (const word of words) {
      counts.set(word, (counts.get(word) ?? 0) + 1)
    }
  }

  return Array.from(counts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_WORDS)
}
