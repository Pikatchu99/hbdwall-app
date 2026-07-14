export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { getLocale, getTranslations } from 'next-intl/server'
import LogoMark from '@/components/LogoMark'
import LocaleSwitcher from '@/components/LocaleSwitcher'
import DemoCollage from '@/components/DemoCollage'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import WallOfMomentConfetti from '@/components/WallOfMomentConfetti'
import BirthdayStrip from '@/components/BirthdayStrip'
import { getTheme } from '@/lib/theme'
import JoyfulLanding from '@/components/landing/JoyfulLanding'
import ThemeBanner from '@/components/ThemeBanner'
import JsonLd from '@/components/seo/JsonLd'
import FaqSection from '@/components/landing/FaqSection'
import WhatIsSection from '@/components/landing/WhatIsSection'
import { localizedAlternates, ogLocale, SITE_URL, type Locale } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  const title = t('home.title')
  const description = t('home.description')
  return {
    title: { absolute: title },
    description,
    alternates: localizedAlternates(locale as Locale, ''),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}`,
      locale: ogLocale(locale as Locale),
      type: 'website',
    },
  }
}

export default async function HomePage() {
  const session = await getSession()
  const isLoggedIn = !!session.userId
  const locale = (await getLocale()) as Locale

  // Opt-in "Sable Joyeux" : si activé, on rend la landing joyeuse (CTA branchés) ;
  // sinon, la landing classique inchangée.
  const theme = await getTheme()
  if (theme === 'joyful') {
    const [featured, birthdayWalls] = await Promise.all([
      prisma.wall.findFirst({ where: { featured: true }, select: { slug: true } }),
      prisma.wall.findMany({
        where: { isActive: true, isBirthday: true },
        select: { slug: true, date: true, recipientName: true, user: { select: { name: true, image: true, pseudo: true } } },
        take: 300,
        orderBy: { createdAt: 'desc' },
      }),
    ])
    // Anniversaires À VENIR uniquement (prochaine occurrence dans les 60 jours), du plus proche au plus lointain.
    const nowD = new Date()
    const today0 = new Date(nowD.getFullYear(), nowD.getMonth(), nowD.getDate())
    const WINDOW_DAYS = 60
    const birthdayPeople = birthdayWalls
      .map(w => {
        const d = new Date(w.date)
        const next = new Date(today0.getFullYear(), d.getMonth(), d.getDate())
        if (next < today0) next.setFullYear(today0.getFullYear() + 1)
        return {
          slug: w.slug,
          name: w.recipientName ?? w.user.name,
          pseudo: w.user.pseudo,
          image: w.user.image,
          day: d.getDate(),
          month: d.getMonth() + 1,
          until: (next.getTime() - today0.getTime()) / 86_400_000,
        }
      })
      .filter(p => p.until <= WINDOW_DAYS)
      .sort((a, b) => a.until - b.until)
      .slice(0, 42)
      .map(({ until, ...rest }) => ({ ...rest, isToday: until < 0.5 }))
    return (
      <>
        <JsonLd locale={locale} />
        <JoyfulLanding isLoggedIn={isLoggedIn} featuredSlug={featured?.slug ?? null} birthdayPeople={birthdayPeople} />
      </>
    )
  }


  const now = new Date()
  const currentMonth = now.getMonth() + 1

  // Window: today → end of current month
  const endOfMonth  = new Date(now.getFullYear(), now.getMonth() + 1, 0) // last day of month

  const [featuredWall, monthWalls] = await Promise.all([
    prisma.wall.findFirst({
      where: { featured: true },
      include: {
        user: { select: { pseudo: true } },
        _count: { select: { messages: true } },
      },
    }),
    prisma.wall.findMany({
      where: { isActive: true, isBirthday: true },
      select: {
        slug: true,
        user: { select: { name: true, pseudo: true } },
        recipientName: true,
        date: true,
        _count: { select: { messages: true } },
        messages: { select: { content: true, authorName: true }, where: { fromPlatform: false }, take: 10 },
      },
    }),
  ])

  const mapWall = (w: typeof monthWalls[0], month: number): BirthdayEntry => {
    const msgs = w.messages.filter(m => m.content.length > 10)
    const randomMsg = msgs.length > 0 ? msgs[Math.floor(Math.random() * msgs.length)] : null
    return {
      slug: w.slug,
      name: w.recipientName ?? w.user.name,
      pseudo: w.user.pseudo,
      day: new Date(w.date).getDate(),
      month,
      msgCount: w._count.messages,
      quote: randomMsg ? { content: randomMsg.content, author: randomMsg.authorName } : null,
    }
  }

  // Tier 1 : aujourd'hui → fin du mois courant
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const birthdaysThisMonth = monthWalls
    .filter(w => {
      const d = new Date(w.date)
      const candidate = new Date(now.getFullYear(), d.getMonth(), d.getDate())
      return candidate >= today && candidate <= endOfMonth
    })
    .map(w => mapWall(w, new Date(w.date).getMonth() + 1))
    .sort((a, b) => a.day - b.day)

  // Tier 2 : mois suivant complet
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1
  const birthdaysNextMonth = monthWalls
    .filter(w => new Date(w.date).getMonth() + 1 === nextMonth)
    .map(w => mapWall(w, nextMonth))
    .sort((a, b) => a.day - b.day)

  // Tier 3 : les 5 prochains anniversaires (tous mois confondus)
  const birthdaysUpcoming = monthWalls
    .map(w => {
      const d = new Date(w.date)
      const candidate = new Date(now.getFullYear(), d.getMonth(), d.getDate())
      if (candidate < today) candidate.setFullYear(now.getFullYear() + 1)
      return { ...mapWall(w, candidate.getMonth() + 1), _next: candidate }
    })
    .sort((a, b) => a._next.getTime() - b._next.getTime())
    .slice(0, 5)
    .map(({ _next: _, ...rest }) => rest)

  let birthdaysToShow: BirthdayEntry[]
  let displayMonth: number
  let isUpcoming = false

  if (birthdaysThisMonth.length > 0) {
    birthdaysToShow = birthdaysThisMonth
    displayMonth = currentMonth
  } else if (birthdaysNextMonth.length > 0) {
    birthdaysToShow = birthdaysNextMonth
    displayMonth = nextMonth
  } else {
    birthdaysToShow = birthdaysUpcoming
    displayMonth = birthdaysUpcoming[0]?.month ?? currentMonth
    isUpcoming = true
  }

  const monthName = new Date(2000, displayMonth - 1).toLocaleDateString(locale, { month: 'long' }).toUpperCase()

  return (
    <>
      <JsonLd locale={locale} />
      <ThemeBanner />
      <HomePageContent isLoggedIn={isLoggedIn} featuredWall={featuredWall} birthdaysThisMonth={birthdaysToShow} isUpcoming={isUpcoming} monthName={monthName} />
    </>
  )
}

type BirthdayEntry = { slug: string; name: string; pseudo: string; day: number; month: number; msgCount: number; quote: { content: string; author: string | null } | null }


function HomePageContent({ isLoggedIn, featuredWall, birthdaysThisMonth, isUpcoming, monthName }: {
  isLoggedIn: boolean
  featuredWall: { title: string; slug: string; date: Date; user: { pseudo: string }; _count: { messages: number } } | null
  birthdaysThisMonth: BirthdayEntry[]
  isUpcoming: boolean
  monthName: string
}) {
  const t = useTranslations()

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--s-4) var(--s-8)',
        borderBottom: '1px solid var(--border)',
      }}>
        <LogoMark />
        <div style={{ display: 'flex', gap: 'var(--s-3)', alignItems: 'center' }}>
          <LocaleSwitcher />
          {isLoggedIn ? (
            <Link href="/dashboard" className="btn btn--solid">{t('nav.myWall')}</Link>
          ) : (
            <>
              <Link href="/login" className="btn btn--ghost">{t('nav.login')}</Link>
              <Link href="/register" className="btn btn--solid">{t('nav.createWall')}</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="hero-grid" style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* Left - text */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'var(--s-8) var(--s-8)',
          borderRight: '1px solid var(--border)',
        }}>
          <h1 className="t-display-l" style={{ marginBottom: 'var(--s-6)' }}>
            BIRTHDAY<br />WALL
          </h1>
          <p className="t-body t-muted" style={{ maxWidth: '340px', marginBottom: 'var(--s-1)' }}>
            {t('landing.hero1')}
          </p>
          <p className="t-body t-muted" style={{ maxWidth: '340px', marginBottom: 'var(--s-1)' }}>
            {t('landing.hero2')}
          </p>
          <p className="t-body t-muted" style={{ maxWidth: '340px', marginBottom: 'var(--s-8)' }}>
            {t('landing.hero3')}
          </p>
          <div style={{ display: 'flex', gap: 'var(--s-4)', marginBottom: 'var(--s-6)' }}>
            <a href="https://www.instagram.com/hbdwall" target="_blank" rel="noopener noreferrer" className="t-caption t-muted link" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
              Instagram
            </a>
            <a href="https://www.tiktok.com/@hbdwall" target="_blank" rel="noopener noreferrer" className="t-caption t-muted link" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <img src="/vecteezy_tiktok-logo-icon_21495942.png" alt="TikTok" width={14} height={14} style={{ borderRadius: '50%' }} />
              TikTok
            </a>
          </div>

          <div style={{ display: 'flex', gap: 'var(--s-3)', flexWrap: 'wrap' }}>
            {isLoggedIn ? (
              <Link href="/dashboard" className="btn btn--solid">{t('nav.myWall')}</Link>
            ) : (
              <>
                <Link href="/register" className="btn btn--solid">{t('landing.cta')}</Link>
                <Link href="/login" className="btn btn--ghost">{t('nav.login')}</Link>
              </>
            )}
          </div>
          {!isLoggedIn && (
            <p className="t-caption t-muted" style={{ marginTop: 'var(--s-3)' }}>
              {t('landing.socialProof')}
            </p>
          )}
        </div>

        {/* Right - demo collage */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--s-6)',
          overflow: 'hidden',
        }}>
          <DemoCollage />
        </div>
      </div>

      {/* Anniversaires du mois */}
      {birthdaysThisMonth.length > 0 && (
        <section style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)', overflow: 'hidden', paddingBottom: 'var(--s-12)', position: 'relative' }}>
          {/* Watermark HAPPY BIRTHDAY */}
          <div aria-hidden style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            padding: '0 var(--s-8)',
            userSelect: 'none', pointerEvents: 'none', overflow: 'hidden',
          }}>
            <span className="wdm-watermark" style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 900,
              fontSize: '12vw',
              lineHeight: 0.9,
              letterSpacing: '-0.04em',
              color: 'var(--accent)',
              opacity: 0.06,
              width: '100%',
            }}>
              <span className="wdm-happy">HAPPY</span>
              <span className="wdm-birthday">
                <span className="wdm-birth">BIRTH</span><span className="wdm-day">DAY</span>
              </span>
            </span>
          </div>

          <p style={{
            padding: 'var(--s-6) var(--s-8) var(--s-2)',
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: '15px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--fg)',
            textAlign: 'center',
          }}>
            {isUpcoming
              ? t('landing.upcomingBirthdays')
              : t('landing.starsOfMonth', { month: monthName })
            }
          </p>
          <BirthdayStrip birthdays={birthdaysThisMonth} />
        </section>
      )}

      {/* Wall du moment */}
      {featuredWall && (
        <section style={{
          borderTop: '1px solid var(--border)',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '320px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--s-16) var(--s-8)',
        }}>
          <WallOfMomentConfetti date={featuredWall.date.toISOString()} />
          {/* Watermark */}
          <div aria-hidden style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 var(--s-8)',
            userSelect: 'none',
            pointerEvents: 'none',
            overflow: 'hidden',
          }}>
            <span className="wdm-watermark" style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 900,
              fontSize: '12vw',
              lineHeight: 0.9,
              letterSpacing: '-0.04em',
              color: 'var(--accent)',
              opacity: 0.18,
              width: '100%',
            }}>
              <span className="wdm-happy">HAPPY</span>
              <span className="wdm-birthday">
                <span className="wdm-birth">BIRTH</span><span className="wdm-day">DAY</span>
              </span>
            </span>
          </div>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p className="t-label t-muted" style={{ marginBottom: 'var(--s-3)' }}>{t('landing.wallOfMoment')}</p>
            <p className="t-h1" style={{ lineHeight: 1.1, marginBottom: 'var(--s-3)' }}>{featuredWall.title}</p>
            <p className="t-body t-muted" style={{ marginBottom: 'var(--s-5)' }}>
              @{featuredWall.user.pseudo} · <strong>{featuredWall._count.messages}</strong> messages
            </p>
            <Link href={`/wall/${featuredWall.slug}`} className="btn btn--solid">
              {t('landing.leaveWord')}
            </Link>
          </div>
        </section>
      )}

      <WhatIsSection />

      <FaqSection />

      {/* Footer */}
      <footer className="site-footer">
        <div className="site-footer__links">
          <span className="t-caption t-muted">BIRTHDAYWALL · {new Date().getFullYear()}</span>
          <Link href="/cgu" className="t-caption t-muted link">CGU</Link>
          <Link href="/privacy" className="t-caption t-muted link">Privacy</Link>
          <Link href="/nouveautes" className="t-caption t-muted link">{t('dashboard.whatsNew')}</Link>
          <Link href="/blog" className="t-caption t-muted link">Blog</Link>
          <Link href="/comparatif" className="t-caption t-muted link">Comparatif</Link>
        </div>
        <div className="site-footer__social">
          <a href="https://www.instagram.com/hbdwall" target="_blank" rel="noopener noreferrer" className="t-caption t-muted link" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
            Instagram
          </a>
          <a href="https://www.tiktok.com/@hbdwall" target="_blank" rel="noopener noreferrer" className="t-caption t-muted link" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <img src="/vecteezy_tiktok-logo-icon_21495942.png" alt="TikTok" width={16} height={16} style={{ borderRadius: '50%' }} />
            TikTok
          </a>
        </div>
      </footer>
      <style>{`
        .site-footer {
          padding: var(--s-3) var(--s-8);
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
          flex-wrap: wrap;
          gap: var(--s-3);
        }
        .site-footer__links {
          display: flex;
          align-items: center;
          gap: var(--s-4);
          flex-wrap: wrap;
        }
        .site-footer__social {
          display: flex;
          align-items: center;
          gap: var(--s-4);
        }
        @media (max-width: 480px) {
          .site-footer {
            flex-direction: column;
            align-items: flex-start;
            padding: var(--s-4) var(--s-4);
          }
        }
      `}</style>
    </main>
  )
}
