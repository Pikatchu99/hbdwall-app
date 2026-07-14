# Product

## Register

brand

> HBDWall is a consumer product, but its forward-facing surfaces (landing, the wall itself, leaving a message, the collage) are emotional and design-led: the *feeling* is a core part of the product. Treat consumer surfaces as **brand**. Internal/utility surfaces (admin dashboard, settings, moderation) are **product** and may stay more restrained, but they still consume the same design tokens.

## Users

- **The birthday person (creator).** Someone whose birthday is coming up, or who creates a wall for a loved one. Mobile-first, emotional context, wants to feel celebrated and to *keep* the love they receive. Creates a wall in ~30 seconds.
- **The guests (no account).** Friends and family who receive a link and leave a message + photo. They must succeed in under a minute, with zero friction, no signup, no app. Most arrive on mobile, tapping a link from WhatsApp/Instagram/SMS.

The job to be done: *"All the love I get on my birthday is scattered and disappears the next day. Gather it in one place, and let me keep it forever."*

## Product Purpose

HBDWall turns the flood of birthday love (messages, photos) into a single place that lasts. You create a page, share one stable link, your people write, and you keep everything: an exportable memory **collage**, and a new **edition every year** so your wall becomes a time capsule of who loved you, year after year.

Success = **walls created per week** (the north star). The growth engine is the **guest→creator viral loop**: every guest who leaves a message experiences the product from the inside and is invited to create their own. Each wall plants the next.

## Brand Personality

Joyful, warm, sincere, celebratory, generous. Three words: **joyeux, chaleureux, sincère**.

The interface should feel like a birthday: color, confetti, hand-placed stickers, a friendly mascot, big playful type. It should make people *feel* something (delight, warmth, nostalgia, the relief of love kept instead of lost) before it explains a single feature. Playful but never cheap; loud but never chaotic.

## Anti-references

- **Austere / corporate SaaS** and cold minimalism. A birthday is not a B2B dashboard.
- **The old "classic Sable" coldness** (austere editorial-brutalist: pure monochrome, sharp 0-radius everywhere, no color, no joy) — it reads as serious and distant, wrong for celebration. (It survives as a *legacy theme*, see DESIGN.md, but it is not the forward direction.)
- **Generic AI-landing slop**: purple-to-blue gradients, glassmorphism, neon-on-dark, gradient text on big metrics, identical icon-title-text card grids.
- **Dark techy dashboards.** This product is light, warm, daytime.
- **Emoji as UI.** Personality comes from custom SVG doodles, the mascot, and lucide icons, never from emoji in the interface.

## Design Principles

1. **Zéro friction pour l'invité.** The viral loop dies if guests have to sign up. Every guest-facing decision removes steps. No account, no app, 30 seconds.
2. **La joie d'abord.** Emotion before features. The first thing a visitor should *feel* is celebration; the explanation comes after.
3. **L'éphémère devient tangible.** The whole product fights "love that disappears." Keep, don't lose: the collage, the yearly editions, the stable link for life.
4. **Croissance par l'amour, pas par la pub.** Every wall is a seed. Reinforce the guest→creator loop everywhere; it is the only real growth lever.
5. **Opt-in, jamais imposé.** Redesigns and new themes ship as an opt-in toggle with a way back. Never break an existing user's bearings ("repère") without their consent.

## Accessibility & Inclusion

- **WCAG AA** minimum. The bright palette is bold, so text contrast must be verified per surface (dark text on yellow/lime/paper; white text on violet/magenta/blue/ink).
- **`prefers-reduced-motion` is fully honored.** The joyful theme is motion-heavy (floating doodles, reveals, marquees, animated wordmark); all of it must collapse to a static, legible state when reduced motion is requested. This is non-negotiable, not a nice-to-have.
- Keyboard navigability and visible focus on all interactive elements (pills, links, inputs).
- Decorative SVG (doodles, mascot) carries `aria-hidden`; meaning lives in text.
