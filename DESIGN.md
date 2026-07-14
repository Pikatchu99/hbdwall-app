---
name: HBDWall — Sable Joyeux
description: Joyful neo-brutalist sticker-scrapbook system for a birthday-wall product.
colors:
  violet: "oklch(0.60 0.23 295)"
  magenta: "oklch(0.64 0.26 350)"
  blue: "oklch(0.60 0.18 250)"
  orange: "oklch(0.72 0.19 47)"
  yellow: "oklch(0.90 0.17 100)"
  lime: "oklch(0.86 0.21 132)"
  ink: "oklch(0.17 0.03 290)"
  paper: "oklch(0.97 0.012 300)"
typography:
  display:
    fontFamily: "Baloo 2, system-ui, sans-serif"
    fontSize: "clamp(42px, 6.2vw, 92px)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Baloo 2, system-ui, sans-serif"
    fontSize: "clamp(32px, 5vw, 60px)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Space Mono, ui-monospace, Menlo, monospace"
    fontSize: "clamp(15px, 2vw, 18px)"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0"
  label:
    fontFamily: "Baloo 2, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.14em"
rounded:
  sm: "16px"
  md: "20px"
  lg: "28px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "18px"
  lg: "22px"
  xl: "40px"
  section: "clamp(40px, 7vw, 88px)"
components:
  pill-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "14px 26px"
  pill-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "14px 26px"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "clamp(24px, 3vw, 32px)"
  badge:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "5px 12px"
  note:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "16px 20px"
---

# Design System: HBDWall — Sable Joyeux

## 1. Overview

**Creative North Star: "Le carnet de stickers"** (The Sticker Scrapbook)

This is joyful neo-brutalism for a birthday product. Imagine a kid's birthday scrapbook where every element is a hand-cut sticker: thick black ink outlines, a hard drop shadow as if each piece is physically peeled and pressed onto the page, a slight playful tilt, and a riot of festive color. Big, rounded, chunky type does the shouting; floating doodles (sparkles, hearts, confetti) carry the joy; a friendly mascot waves from the corners. It feels like a party invitation, not a SaaS dashboard.

The system is **loud, warm, and confident**. Color is voice: violet drenches the heroes, and a full festive palette (magenta, blue, orange, yellow, lime) color-blocks the page section by section. Surfaces are flat and graphic, never glassy or gradient-y. Motion is everywhere but soft (gentle floating, satisfying press-down buttons, scroll reveals, a marquee of love), and it collapses entirely under reduced-motion.

This system explicitly rejects: austere corporate minimalism, the legacy "classic Sable" coldness (monochrome + sharp 0-radius), AI-landing slop (purple→blue gradients, glassmorphism, gradient text), dark techy dashboards, and emoji-as-UI.

**Key Characteristics:**
- Thick black outlines (3px) on everything: nav, cards, buttons, badges, doodles.
- Hard, un-blurred offset shadows (the "peeled sticker" depth).
- Generous rounded corners (16-28px) and 999px pills.
- Rounded chunky display type (Baloo 2 800) over a mono body (Space Mono).
- Full festive palette, color-blocked per section.
- Playful tilts, marker-highlighted words, hand-drawn animated SVG doodles, a mascot.

> **Two themes.** "Sable Joyeux" (this document) is the canonical, forward direction. A legacy **"classic Sable"** theme also exists in the live app: austere editorial-brutalist (Inter 900 + Space Mono, monochrome on `#EAEAEA`, `--radius: 0`, single violet accent, no doodles). Classic is shipped via an opt-in `[data-theme]` toggle and is *not* the direction for new work. When building new surfaces, build Joyeux.

## 2. Colors

A full festive palette: one violet anchor plus a band of bright secondaries, all on warm tinted neutrals. Every value is **OKLCH** (project doctrine; the Stitch linter warns on non-hex, which is accepted here).

### Primary
- **Fête Violet** (oklch(0.60 0.23 295)): The brand anchor. Drenches hero and CTA blocks (white text on top), fills the marker-highlight inside light contexts, and tints the giant footer wordmark. The one color a visitor will remember.

### Secondary (the festive band)
- **Confetti Magenta** (oklch(0.64 0.26 350)): Color-block bands and the final CTA; white text.
- **Balloon Blue** (oklch(0.60 0.18 250)): Step/feature accents; white text.
- **Sunset Orange** (oklch(0.72 0.19 47)): Sparingly, in confetti and accents; dark text.
- **Birthday Yellow** (oklch(0.90 0.17 100)): Highlight marker, badges, note stickers; always dark text.
- **Party Lime** (oklch(0.86 0.21 132)): Badges, "OUVERT" tags, note stickers; always dark text.

### Neutral
- **Ink** (oklch(0.17 0.03 290)): Near-black, tinted toward violet. All outlines, all shadows, default text. Never pure `#000`.
- **Paper** (oklch(0.97 0.012 300)): Warm off-white page background and white sticker surfaces. Never pure `#fff`.

### Named Rules
**The Color-Block Rule.** Sections own a color. A hero is drenched violet, the next band is magenta, the CTA is magenta again: large saturated fields, not timid accents. Restraint reads as the wrong (classic) theme.

**The Text-On-Color Rule.** Yellow, lime, orange, and paper always take **ink** text. Violet, magenta, blue, and ink always take **paper/white** text. Never violet text on magenta, never light-on-light.

## 3. Typography

**Display Font:** Baloo 2 (with system-ui, sans-serif)
**Body Font:** Space Mono (with ui-monospace, Menlo, monospace)
**Label/Mono Font:** Baloo 2 for labels/badges; Space Mono for technical/meta text.

**Character:** A deliberate odd-couple. Baloo 2 is rounded, heavy, friendly, almost balloon-like: it carries all the warmth and shout. Space Mono underneath keeps a slightly techy, honest, "receipt" feel for body and metadata, and stops the page from going saccharine. The contrast is the personality.

### Hierarchy
- **Mega / Display** (Baloo 2 800, clamp(42px, 6.2vw, 92px), line-height 0.9, uppercase, tracking -0.02em): Hero headlines and the closing CTA. One dominant idea per fold.
- **Headline** (Baloo 2 800, clamp(32px, 5vw, 60px), line-height 1, uppercase): Section titles ("Comment ça marche", "Tout ce que tu gardes").
- **Title** (Baloo 2 800, clamp(22px, 2.6vw, 28px), line-height 1): Card and step titles.
- **Body** (Space Mono 400, clamp(15px, 2vw, 18px), line-height 1.6, max ~40ch): Paragraphs, leads, note text. Keep measure tight (≤45ch); mono runs wide.
- **Label** (Baloo 2 800, 13px, tracking 0.14em, UPPERCASE): Kickers above headings, badges, sticker tags.

### Named Rules
**The Round-Shouts-Mono-Speaks Rule.** Baloo 2 only for things that should feel joyful and loud (headings, labels, buttons, badges, the mascot's energy). Space Mono only for things being *read* (body, names, meta). Never set body copy in Baloo, never set a hero in mono.

**The Marker Rule.** Emphasis in a headline is a **highlight box** (`.mark`): a solid rounded rectangle behind the word, slightly tilted (`rotate(-2deg)`), ink-on-yellow or violet-on-white or paper-on-ink. One marked phrase per headline, never two.

## 4. Elevation

This system is **flat with hard graphic shadows**. There is no soft, blurred, ambient elevation anywhere. Depth is the "peeled sticker" illusion: a solid, un-blurred offset shadow in **ink**, paired with the 3px ink border, so every card, button, and badge looks physically cut out and pressed onto the page. Shadows are decorative-structural and always present at rest (not only on hover).

### Shadow Vocabulary
- **Sticker** (`box-shadow: 8px 8px 0 var(--ink)`): Default for cards, steps, notes, color-block bands.
- **Sticker Small** (`box-shadow: 4px 4px 0 var(--ink)`): Pills, badges, tiles, swatches.
- **Sticker Large** (`box-shadow: 14px 14px 0 var(--ink)`): Heroes, CTA blocks, spotlight, and the hover/lift state of any card.

### Named Rules
**The Hard Shadow Rule.** Shadows are **solid color, zero blur, fixed offset**, always `var(--ink)`. A blurred shadow (`box-shadow: 0 4px 24px rgba(...)`) is forbidden: it instantly reads as generic SaaS and breaks the sticker metaphor.

**The Press Rule.** Interactive elements move *with* their shadow. Buttons press in on `:active` (translate +3px, shadow shrinks to 1px). Cards lift on `:hover` (translate -3px, shadow grows to Sticker Large). The shadow is the affordance.

## 5. Components

Every surface element shares the same grammar: **3px ink border + a hard ink shadow + rounded corners**, often with a small playful tilt at rest.

### Buttons (Pills)
- **Shape:** Fully round (`999px`), `14px 26px` padding (`.sm` variant: `10px 18px`). Baloo 2 800.
- **Primary:** Ink fill, paper text. **Secondary:** Paper fill, ink text. Both carry Sticker Small shadow + 3px ink border.
- **Hover / Active:** Hover translates -2px and grows the shadow; `:active` presses +3px and shrinks the shadow to 1px (the satisfying click). Easing `cubic-bezier(.2,.6,.2,1)`, ~130ms. Honor reduced-motion (no transition).

### Badges (color-coded pills)
- **Style:** Small round pill (`5px 12px`), Baloo 2 800 uppercase, 3px ink border, Sticker Small shadow. The fill is color-coded by meaning (ÉTAPE 01 lime, 02 blue, 03 magenta). Dark or light text per the Text-On-Color Rule.

### Cards / Containers
- **Corner Style:** `20px` (`rounded.md`); big blocks (hero, CTA, spotlight) use `28px` (`rounded.lg`); notes/tiles use `16px`.
- **Background:** Paper, or a saturated palette fill for feature cards.
- **Shadow Strategy:** Sticker at rest, Sticker Large on hover (see Elevation).
- **Border:** Always 3px ink.
- **Internal Padding:** `clamp(24px, 3vw, 32px)`.
- **Tilt:** Cards/steps/badges/tiles wear a small static rotation (`-2.5deg` / `2deg` / `-1.2deg`) and straighten to `0deg` on hover. This is the hand-placed sticker feel; use it, don't overdo it.

### Inputs / Fields
- **Style:** Paper fill, 3px ink (or border) stroke, `16px` radius, Space Mono text.
- **Focus:** Border darkens to ink (no glow, no ring blur). Keep it crisp.

### Navigation
- **Style:** A simple top bar: Baloo 2 wordmark left, pill actions right. Border-bottom optional. No glass, no blur. Pills follow the button rules.

### Signature components
- **Doodles.** Hand-authored inline SVG (sparkle, heart, star, confetti) with 1.5-2.2px ink strokes, recolored per context. Scattered as absolutely-positioned decoration; animated (float + wobble, some twinkle). Always `aria-hidden`.
- **Note stickers.** Small paper/colored message cards (rotated, hard shadow) shown in an overlapping "pile" in the hero; gently float, lift on hover.
- **Testimonial marquee.** Two rows of note-style tiles auto-scrolling in opposite directions (seamless `translateX(-50%)` loop), paused on hover, frozen under reduced-motion.
- **Giant wordmark footer.** A full-bleed `hbdwall` in Baloo 2 violet at `clamp(64px, 23vw, 360px)`, letters animating up on scroll.
- **The mascot.** A two-tone (currentColor + white + ink outline) sticker character, recolorable per section via CSS `color`. Used playfully (peeking, presenting). Real limb animation (wave/walk) is reserved for a future Rive rig; until then, whole-body float only. (Currently parked: see `public/mascots/`.)

## 6. Do's and Don'ts

### Do:
- **Do** outline everything with a **3px ink border** and lift it with a **hard offset shadow** (`8px 8px 0 ink`). Border + hard shadow is the whole look.
- **Do** color-block by section (drenched violet/magenta blocks); let one saturated color own a fold.
- **Do** set headings/labels/buttons in **Baloo 2 800** and body/meta in **Space Mono**.
- **Do** emphasize with a single tilted **marker highlight** per headline.
- **Do** give cards/badges a small static tilt and straighten on hover; press buttons in on click.
- **Do** decorate with animated hand-drawn **SVG doodles**, and recolor them per section.
- **Do** keep all neutrals tinted toward violet (Ink `oklch(0.17 0.03 290)`, Paper `oklch(0.97 0.012 300)`).
- **Do** collapse *all* motion under `prefers-reduced-motion` to a static, legible state.

### Don't:
- **Don't** use blurred / ambient shadows (`box-shadow: 0 4px 24px rgba(...)`). Solid, zero-blur, ink only.
- **Don't** use glassmorphism, purple→blue gradients, neon-on-dark, or gradient text. (Named AI-slop anti-references from PRODUCT.md.)
- **Don't** ship thin or timid borders, or `radius: 0` sharp corners — that is the legacy *classic Sable* coldness, not Joyeux.
- **Don't** use pure `#000` or `#fff`; always the tinted Ink/Paper.
- **Don't** put violet/magenta text on a violet/magenta field, or light text on yellow/lime/paper (Text-On-Color Rule).
- **Don't** use **emoji** in the UI. Personality comes from SVG doodles, the mascot, and lucide icons.
- **Don't** set body copy in Baloo 2 or a hero in mono.
- **Don't** force the new theme on users: it ships as an opt-in `[data-theme]` toggle with a way back.
