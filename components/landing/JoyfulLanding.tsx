// Landing "Sable Joyeux" (design system : voir DESIGN.md).
// Rendue par la vraie landing quand le thème opt-in est "joyful", et par /vibe en preview.
// Auto-thémée (data-theme="joyful" sur sa racine) → joyeuse quel que soit le thème global.
// Textes : next-intl, namespace "joyfulLanding". Présentation (couleurs/icônes/doodles) ici.

import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import VibeAnimator from '@/components/vibe/VibeAnimator'
import LogoMark from '@/components/LogoMark'
import BirthdayCloud, { type Person } from '@/components/landing/BirthdayCloud'
import ThemeToggle from '@/components/ThemeToggle'
import ThemeFeedback from '@/components/ThemeFeedback'
import FaqSection from '@/components/landing/FaqSection'
import WhatIsSection from '@/components/landing/WhatIsSection'
import { Sparkle, Heart, Star, Confetti } from '@/components/joyful/Doodles'
import './joyful-landing.css'

// Surlignages "marker" réutilisés dans les titres (passés à t.rich).
const rich = {
  mark: (c: React.ReactNode) => <span className="vibe-mark mark-y">{c}</span>,
  markP: (c: React.ReactNode) => <span className="vibe-mark vibe-mark--paper">{c}</span>,
  markPlain: (c: React.ReactNode) => <span className="vibe-mark">{c}</span>,
  br: () => <br />,
}

// Présentation des notes du hero (le texte vient de l'i18n).
const NOTE_STYLES = [
  { cls: 'n1', bg: 'var(--v-yellow)', icon: <Heart size={15} /> },
  { cls: 'n2', bg: '#fff', icon: null },
  { cls: 'n3', bg: 'var(--v-lime)', icon: <Star size={15} color="var(--v-violet)" /> },
  { cls: 'n4', bg: '#fff', icon: null },
  { cls: 'n5', bg: 'var(--v-yellow)', icon: <Sparkle size={15} color="var(--v-violet)" /> },
]
const STEP_STYLES = [
  { tilt: 'tilt-a', badgeBg: 'var(--v-lime)', badgeColor: '#111', doodle: <Star size={44} color="var(--v-lime)" /> },
  { tilt: 'tilt-b', badgeBg: 'var(--v-blue)', badgeColor: '#fff', doodle: <Heart size={44} /> },
  { tilt: 'tilt-c', badgeBg: 'var(--v-magenta)', badgeColor: '#fff', doodle: <Confetti size={48} /> },
]
const FEATURE_STYLES = [
  { tilt: 'tilt-a', bg: 'var(--v-magenta)', color: '#fff', badge: '01', badgeBg: 'var(--v-yellow)', badgeColor: '#111', icon: <Star size={40} color="#fff" /> },
  { tilt: 'tilt-b', bg: 'var(--v-yellow)', color: '#111', badge: '02', badgeBg: 'var(--v-violet)', badgeColor: '#fff', icon: <Heart size={40} /> },
  { tilt: 'tilt-c', bg: 'var(--v-blue)', color: '#fff', badge: '03', badgeBg: 'var(--v-lime)', badgeColor: '#111', icon: <Confetti size={44} /> },
]
const TILE_COLORS = ['yellow', 'white', 'lime', 'magenta', 'white', 'blue', 'white', 'yellow', 'lime']

type Note = { msg: string; by: string }
type Step = { badge: string; title: string; body: string }
type Feature = { title: string; body: string }
type Tile = { msg: string; by: string }

export default async function JoyfulLanding({ isLoggedIn = false, featuredSlug = null, birthdayPeople = [] }: { isLoggedIn?: boolean; featuredSlug?: string | null; birthdayPeople?: Person[] }) {
  const t = await getTranslations('joyfulLanding')
  const createHref = isLoggedIn ? '/dashboard' : '/register'
  const exampleHref = featuredSlug ? `/wall/${featuredSlug}` : '/register'

  const notes = t.raw('notes') as Note[]
  const steps = t.raw('steps.items') as Step[]
  const features = t.raw('features.items') as Feature[]
  const tiles = t.raw('tiles') as Tile[]

  return (
    <VibeAnimator>
      <div className="vibe-root" data-theme="joyful">
        <div className="vibe-wrap">

          {/* ─── NAV (barre arrondie contournée) ─── */}
          <nav className="j-nav">
            <Link href="/" className="j-logo" aria-label="hbdwall"><LogoMark /></Link>
            <div className="j-nav-right">
              <ThemeToggle compact />
              {isLoggedIn ? (
                <Link href="/dashboard" className="vibe-pill vibe-pill--ink sm">{t('nav.myWall')}</Link>
              ) : (
                <>
                  <Link href="/login" className="j-nav-link">{t('nav.login')}</Link>
                  <Link href="/register" className="vibe-pill vibe-pill--ink sm">
                    <span className="j-cta-full">{t('nav.create')}</span>
                    <span className="j-cta-short">{t('nav.createShort')}</span>
                  </Link>
                </>
              )}
            </div>
          </nav>

          <ThemeFeedback />

          {/* ─── HERO ─── */}
          <section className="vibe-hero">
            <span className="vibe-sticker-badge">{t('hero.badge')}</span>
            <span className="hero-doodle" style={{ top: '20px', left: '4%' }}><Sparkle size={48} color="var(--v-yellow)" /></span>
            <span className="hero-doodle" style={{ top: '11%', left: '45%' }}><Star size={30} color="var(--v-lime)" /></span>
            <span className="hero-doodle" style={{ top: '26px', left: '30%' }}><Heart size={28} color="#fff" /></span>
            <span className="hero-doodle" style={{ top: '44%', left: '2%' }}><Confetti size={58} /></span>
            <span className="hero-doodle" style={{ top: '64%', left: '13%' }}><Star size={34} color="var(--v-yellow)" /></span>
            <span className="hero-doodle" style={{ bottom: '20px', left: '40%' }}><Sparkle size={32} color="#fff" /></span>
            <span className="hero-doodle" style={{ bottom: '16%', right: '5%' }}><Heart size={36} color="var(--v-magenta)" /></span>
            <span className="hero-doodle" style={{ top: '38%', right: '3%' }}><Sparkle size={36} color="var(--v-lime)" /></span>
            <span className="hero-doodle" style={{ top: '8%', right: '34%' }}><Star size={24} color="#fff" /></span>
            <span className="hero-doodle" style={{ bottom: '40%', left: '46%' }}><Heart size={22} color="var(--v-yellow)" /></span>

            <div className="vibe-hero-grid">
              <div className="vibe-hero-left">
                <h1 className="vibe-mega">{t.rich('hero.title', rich)}</h1>
                <p className="vibe-lead">{t('hero.lead')}</p>
                <div className="vibe-cta-row">
                  <Link href={createHref} className="vibe-pill vibe-pill--ink">{t('hero.ctaCreate')}</Link>
                  <Link href={exampleHref} className="vibe-pill vibe-pill--paper">{t('hero.ctaExample')}</Link>
                </div>
              </div>
              <div className="vibe-hero-right">
                <div className="vibe-notes">
                  {notes.map((n, i) => {
                    const s = NOTE_STYLES[i]
                    return (
                      <div className="note-wrap" key={i}>
                        <div className={`vibe-note ${s.cls}`} style={{ background: s.bg, color: '#111' }}>
                          <p className="vibe-note-msg">{n.msg} {s.icon}</p>
                          <p className="vibe-note-by">— {n.by}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ─── NUÉE D'ANNIVERSAIRES ─── */}
          <BirthdayCloud people={birthdayPeople} />

          {/* ─── COMMENT ÇA MARCHE ─── */}
          <section className="vibe-steps-sec">
            <p className="vibe-kicker">{t('steps.kicker')}</p>
            <h2 className="vibe-h2-big">{t.rich('steps.title', rich)}</h2>
            <div className="vibe-steps">
              {steps.map((step, i) => {
                const s = STEP_STYLES[i]
                return (
                  <article className={`vibe-step ${s.tilt}`} key={i}>
                    <span className="vibe-step-badge" style={{ background: s.badgeBg, color: s.badgeColor }}>{step.badge}</span>
                    <span className="vibe-step-doodle">{s.doodle}</span>
                    <h3 className="vibe-step-title">{step.title}</h3>
                    <p className="vibe-step-body">{step.body}</p>
                  </article>
                )
              })}
            </div>
          </section>

          {/* ─── BAND ─── */}
          <section className="vibe-band">
            <span className="vibe-deco bd1"><Heart size={40} color="#fff" /></span>
            <h2 className="vibe-band-title">{t.rich('band', rich)}</h2>
          </section>

          {/* ─── FEATURES ─── */}
          <p className="vibe-kicker">{t('features.kicker')}</p>
          <h2 className="vibe-h2-big">{t.rich('features.title', rich)}</h2>
          <div className="vibe-cards">
            {features.map((f, i) => {
              const s = FEATURE_STYLES[i]
              return (
                <article className={`vibe-card ${s.tilt}`} style={{ background: s.bg, color: s.color }} key={i}>
                  <span className="vibe-card-badge" style={{ background: s.badgeBg, color: s.badgeColor }}>{s.badge}</span>
                  {s.icon}
                  <h3 className="vibe-card-title">{f.title}</h3>
                  <p className="vibe-card-body">{f.body}</p>
                </article>
              )
            })}
          </div>

          {/* ─── SPOTLIGHT : ANNÉES ─── */}
          <section className="vibe-spotlight">
            <div className="vibe-spot-left">
              <p className="vibe-kicker" style={{ color: 'var(--v-lime)' }}>{t('spotlight.kicker')}</p>
              <h2 className="vibe-h2-big" style={{ color: '#fff' }}>{t.rich('spotlight.title', rich)}</h2>
              <p className="vibe-spot-body">{t('spotlight.body')}</p>
            </div>
            <div className="vibe-years">
              <span className="vibe-year" style={{ color: 'var(--v-lime)' }}><span className="year-num" data-year="2023">2023</span></span>
              <span className="vibe-year" style={{ color: 'var(--v-yellow)' }}><span className="year-num" data-year="2024">2024</span></span>
              <span className="vibe-year" style={{ color: 'rgba(255,255,255,0.6)' }}><span className="year-num" data-year="2025">2025</span></span>
              <span className="vibe-year vibe-year--now"><span className="year-num" data-year="2026">2026</span> <span className="vibe-year-tag">{t('spotlight.openTag')}</span></span>
            </div>
          </section>

          {/* ─── PREUVE SOCIALE (marquee) ─── */}
          <section className="vibe-proof">
            <p className="vibe-kicker" style={{ textAlign: 'center' }}>{t('proof.kicker')}</p>
            <h2 className="vibe-h2-big" style={{ textAlign: 'center' }}>{t.rich('proof.title', rich)}</h2>
          </section>
          <div className="vibe-marquee-frame">
            <div className="vibe-marquees">
            {[tiles, [...tiles].reverse()].map((row, r) => (
              <div key={r} className={`vibe-marquee ${r ? 'vibe-marquee--rev' : ''}`}>
                <div className="vibe-marquee-track">
                  {[...row, ...row].map((tile, i) => {
                    const c = TILE_COLORS[i % TILE_COLORS.length]
                    const dark = c === 'magenta' || c === 'blue'
                    return (
                      <div key={i} className={`vibe-tile ${i % 2 ? 'tilt-b' : 'tilt-a'}`}
                        style={{ background: c === 'white' ? '#fff' : `var(--v-${c})`, color: dark ? '#fff' : '#111' }}>
                        <p className="vibe-tile-msg">{tile.msg}</p>
                        <p className="vibe-tile-by">— {tile.by}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
            </div>
          </div>

          {/* ─── CTA FINAL ─── */}
          <section className="vibe-final">
            <span className="hero-doodle" style={{ top: '18px', left: '8%' }}><Sparkle size={44} color="var(--v-yellow)" /></span>
            <span className="hero-doodle" style={{ top: '30px', right: '12%' }}><Star size={36} color="var(--v-lime)" /></span>
            <span className="hero-doodle" style={{ bottom: '24px', left: '16%' }}><Confetti size={52} /></span>
            <span className="hero-doodle" style={{ bottom: '20px', right: '10%' }}><Heart size={34} color="#fff" /></span>
            <h2 className="vibe-final-title">{t.rich('final.title', rich)}</h2>
            <p className="vibe-final-body">{t('final.body')}</p>
            <div className="vibe-cta-row" style={{ justifyContent: 'center' }}>
              <Link href={createHref} className="vibe-pill vibe-pill--ink">{t('final.cta')}</Link>
            </div>
          </section>

          <WhatIsSection />

          <FaqSection />

        </div>

        {/* ─── FOOTER (pleine largeur, hors wrap) ─── */}
        <footer className="vibe-footer">
          <div className="vibe-footer-inner">
            <div className="vibe-footer-links">
              <Link href="/cgu">{t('footerLinks.terms')}</Link>
              <Link href="/privacy">{t('footerLinks.privacy')}</Link>
              <Link href="/nouveautes">{t('footerLinks.news')}</Link>
              <Link href="/blog">{t('footerLinks.blog')}</Link>
              <Link href="/comparatif">{t('footerLinks.compare')}</Link>
              <a href="https://www.instagram.com/hbdwall" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://www.tiktok.com/@hbdwall" target="_blank" rel="noopener noreferrer">TikTok</a>
            </div>
          </div>
          <p className="vibe-wordmark" aria-label="hbdwall">
            {'hbdwall'.split('').map((ch, i) => (<span key={i} className="wm-letter">{ch}</span>))}
          </p>
        </footer>

      </div>
    </VibeAnimator>
  )
}
