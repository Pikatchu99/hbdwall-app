import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/db'
import { YELLOW, LIME, MAGENTA, BLUE, VIOLET, INK, SITE, resolveAvatar, makeQr, loadCardFonts, cardTheme, Star, Spark, Heart, Shout } from '@/lib/og-shared'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Carte portrait (1080×1350) — suit le thème actif (joyeux / classique).
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const sp = new URL(req.url).searchParams
  const locale = sp.get('locale') === 'en' ? 'en' : 'fr'
  const theme = sp.get('theme') === 'classic' ? 'classic' : 'joyful'
  const isFr = locale === 'fr'
  const isJoy = theme === 'joyful'
  const th = cardTheme(theme)
  const tilt = (deg: number) => (isJoy ? `rotate(${deg}deg)` : 'translate(0px, 0px)')
  const flat = '0px 0px 0px rgba(0,0,0,0)' // ombre neutre (Satori n'aime ni 'none' ni undefined)

  const wall = await prisma.wall.findUnique({
    where: { slug },
    select: { date: true, description: true, recipientName: true, user: { select: { pseudo: true, name: true, image: true } } },
  })

  const pseudo = wall?.user.pseudo ?? 'someone'
  const name = wall?.recipientName || wall?.user.name || pseudo
  const dateStr = wall?.date
    ? new Date(wall.date).toLocaleDateString(isFr ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long' })
    : ''

  const count = wall
    ? await prisma.message.count({ where: { wall: { slug }, isHidden: false, fromPlatform: false } })
    : 0
  const proof =
    count === 0 ? (isFr ? `sois le premier à m'écrire` : `be the first to write to me`)
    : count === 1 ? (isFr ? `1 ami a déjà écrit` : `1 friend already wrote`)
    : (isFr ? `${count} amis ont déjà écrit` : `${count} friends already wrote`)

  const defaultWarm = isFr
    ? "Aujourd'hui c'est mon jour. Laisse-moi un petit mot — je le garderai pour toujours."
    : 'Today is my day. Leave me a little note — I’ll keep it forever.'
  let warm = (wall?.description?.trim() || defaultWarm)
  if (warm.length > 150) warm = warm.slice(0, 147).trimEnd() + '…'

  const cta = isFr ? 'Laisse ton mot →' : 'Add your note →'
  const scanLabel = isFr ? 'SCANNE POUR ÉCRIRE' : 'SCAN TO WRITE'
  const kicker = isFr ? 'ANNIVERSAIRE' : 'BIRTHDAY'
  const shout = "IT'S MY BIRTHDAY"

  const wallUrl = `${SITE}/${locale}/wall/${slug}`
  const [qr, avatar, fonts] = await Promise.all([
    makeQr(wallUrl),
    resolveAvatar(wall?.user.image ?? null, pseudo),
    loadCardFonts(),
  ])

  const nameSize = name.length > 16 ? 52 : name.length > 10 ? 64 : 76

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', background: th.bg, display: 'flex', padding: 34, fontFamily: 'Space Mono' }}>
        <div style={{
          position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          background: th.card, border: `${th.borderW}px solid ${th.ink}`, borderRadius: th.radius, boxShadow: isJoy ? th.shadow : flat,
          padding: '44px 44px', overflow: 'hidden',
        }}>
          {/* Doodles (joyeux uniquement) */}
          {th.doodles ? (
            <div style={{ display: 'flex' }}>
              <Star s={50} c={YELLOW} style={{ top: 250, right: 50, transform: 'rotate(-12deg)' }} />
              <Spark s={42} c={LIME} style={{ top: 540, left: 44, transform: 'rotate(10deg)' }} />
              <Heart s={38} c={MAGENTA} style={{ top: 860, right: 60, transform: 'rotate(12deg)' }} />
              <Star s={30} c={VIOLET} style={{ top: 520, right: 70, transform: 'rotate(14deg)' }} />
              <Spark s={28} c={BLUE} style={{ top: 240, left: 70 }} />
            </div>
          ) : null}

          {/* Top : logo W + hbdwall | @pseudo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ position: 'relative', width: 58, height: 58, background: th.ink, borderRadius: isJoy ? 16 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: th.display, fontWeight: th.displayWeight, fontSize: 34, color: th.bg }}>W</span>
                <div style={{ position: 'absolute', top: 10, right: 10, width: 10, height: 10, background: th.accent, display: 'flex' }} />
              </div>
              <span style={{ fontFamily: th.display, fontWeight: th.displayWeight, fontSize: 32, color: th.ink }}>hbdwall</span>
            </div>
            <span style={{ color: th.muted, fontSize: 24, letterSpacing: '0.06em' }}>{`@${pseudo}`}</span>
          </div>

          {/* Headline */}
          <div style={{ display: 'flex', position: 'relative' }}>
            {isJoy ? (
              <Shout text={shout} size={72} />
            ) : (
              <span style={{ fontFamily: th.display, fontWeight: 700, fontSize: 58, color: th.ink, letterSpacing: '-0.02em', lineHeight: 1 }}>{shout}</span>
            )}
          </div>

          {/* Avatar + badges + nom */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 26, position: 'relative' }}>
            <img
              src={avatar.url}
              width={148}
              height={148}
              style={{ width: 148, height: 148, borderRadius: 74, border: `${Math.min(5, th.borderW)}px solid ${th.ink}`, objectFit: avatar.fit, background: isJoy ? YELLOW : '#ffffff', transform: tilt(-3) }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ display: 'flex', background: th.accent, border: `${isJoy ? 3 : 2}px solid ${th.ink}`, borderRadius: th.badgeRadius, padding: '5px 16px', transform: tilt(-2) }}>
                  <span style={{ fontFamily: 'Space Mono', fontWeight: 700, fontSize: 17, color: '#fff', letterSpacing: '0.1em' }}>{kicker}</span>
                </div>
                {dateStr ? (
                  <div style={{ display: 'flex', background: th.dateBg, border: `${isJoy ? 3 : 2}px solid ${th.ink}`, borderRadius: isJoy ? 10 : 0, padding: '4px 12px' }}>
                    <span style={{ fontFamily: th.display, fontWeight: th.displayWeight, fontSize: 19, color: th.ink }}>{dateStr}</span>
                  </div>
                ) : null}
              </div>
              <span style={{ fontFamily: th.display, fontWeight: th.displayWeight, fontSize: nameSize, color: th.ink, lineHeight: 1 }}>{name}</span>
            </div>
          </div>

          {/* Message chaleureux */}
          <div style={{ display: 'flex', position: 'relative', borderLeft: `6px solid ${th.accent}`, paddingLeft: 22 }}>
            <span style={{ fontFamily: th.display, fontWeight: th.displayWeight, fontSize: isJoy ? (warm.length > 90 ? 32 : 38) : (warm.length > 90 ? 26 : 30), color: th.ink, lineHeight: 1.3 }}>{warm}</span>
          </div>

          {/* QR + CTA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `${Math.min(5, th.borderW)}px solid ${th.ink}`, paddingTop: 26, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
              <div style={{ display: 'flex', background: '#fff', border: `${Math.min(5, th.borderW)}px solid ${th.ink}`, borderRadius: isJoy ? 22 : 0, boxShadow: isJoy ? th.qrShadow : flat, padding: 14, transform: tilt(-3) }}>
                <img src={qr} width={142} height={142} style={{ width: 142, height: 142 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontFamily: th.display, fontWeight: th.displayWeight, fontSize: 28, color: th.ink, lineHeight: 1.1 }}>{scanLabel}</span>
                <span style={{ fontSize: 22, color: th.muted, marginTop: 4 }}>{proof}</span>
              </div>
            </div>
            <div style={{ display: 'flex', background: th.accent, border: `${Math.min(5, th.borderW)}px solid ${th.ink}`, borderRadius: isJoy ? 999 : 0, padding: '14px 26px', boxShadow: isJoy ? `6px 6px 0 ${th.ink}` : flat }}>
              <span style={{ fontFamily: th.display, fontWeight: th.displayWeight, fontSize: 23, color: '#fff' }}>{cta}</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1350, ...(fonts.length ? { fonts } : {}) }
  )
}
