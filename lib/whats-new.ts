import { Gift, History, type LucideIcon } from 'lucide-react'

/*
 * ─── HOW TO SHIP A NEW "WHAT'S NEW" UPDATE ───────────────────────────────────
 *
 * 1. BUMP THE VERSION (this file)
 *    Increment WHATS_NEW_VERSION by 1.
 *    → The modal re-appears automatically for every existing user
 *      because the localStorage key changes (seen_whats_new_vN).
 *
 * 2. UPDATE THE MODAL CARDS (this file)
 *    Edit WHATS_NEW_FEATURES: add/remove/reorder entries.
 *    Each entry needs: icon (Lucide), title + titleEn, desc + descEn.
 *    Mark the most important feature with highlight: true.
 *
 * 3. UPDATE THE FULL PAGE
 *    Edit the CONTENT object in app/[locale]/nouveautes/page.tsx.
 *    Both "fr" and "en" keys must be updated together.
 *    Add images to /public/nouveautes/ and reference them via ImageSlot.
 *
 * 4. UPDATE THE BADGE DATE
 *    In nouveautes/page.tsx → CONTENT.fr.badge / CONTENT.en.badge
 *    e.g. "MISE À JOUR · JUIN 2026" / "UPDATE · JUNE 2026"
 *
 * Files touched every release:
 *   lib/whats-new.ts                        ← version + modal cards
 *   app/[locale]/nouveautes/page.tsx        ← full page content
 *   public/nouveautes/                      ← screenshots / images
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const WHATS_NEW_VERSION = 2

export const STORAGE_KEY = `seen_whats_new_v${WHATS_NEW_VERSION}`

export type WhatsNewFeature = {
  icon: LucideIcon
  title: string
  titleEn: string
  desc: string
  descEn: string
  highlight?: boolean
}

export const WHATS_NEW_FEATURES: WhatsNewFeature[] = [
  {
    icon: Gift,
    title: 'Liste d\'envies',
    titleEn: 'Wishlist',
    desc: 'Ajoutez votre wishlist : vos invités la découvrent sur votre mur et savent enfin quoi vous offrir.',
    descEn: 'Add your wishlist: your guests discover it on your wall and finally know what to give you.',
    highlight: true,
  },
  {
    icon: History,
    title: 'Vos anniversaires, année après année',
    titleEn: 'Your birthdays, year after year',
    desc: 'Chaque année garde son mur et ses messages. Revisitez vos éditions passées depuis votre dashboard.',
    descEn: 'Each year keeps its own wall and messages. Revisit your past editions from your dashboard.',
    highlight: true,
  },
]
