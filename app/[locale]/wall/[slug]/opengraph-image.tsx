import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/db'
import { PAPER, INK, VIOLET, YELLOW, LIME, MAGENTA, MUTED, SITE, resolveAvatar, makeQr, loadCardFonts, Star, Spark, Heart, Shout } from '@/lib/og-shared'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params
  const isFr = locale === 'fr'

  const wall = await prisma.wall.findUnique({
    where: { slug },
    select: { date: true, recipientName: true, user: { select: { pseudo: true, name: true, image: true } } },
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
    count === 0 ? (isFr ? `sois le premier à écrire` : `be the first to write`)
    : count === 1 ? (isFr ? `1 ami a déjà écrit` : `1 friend already wrote`)
    : (isFr ? `${count} amis ont déjà écrit` : `${count} friends already wrote`)
  const cta = isFr ? 'Laisse ton mot →' : 'Add your note →'
  const scanLabel = isFr ? 'SCANNE-MOI' : 'SCAN ME'

  const wallUrl = `${SITE}/${locale}/wall/${slug}`
  const [qr, avatar, fonts] = await Promise.all([
    makeQr(wallUrl),
    resolveAvatar(wall?.user.image ?? null, pseudo),
    loadCardFonts(),
  ])

  const nameSize = name.length > 12 ? 56 : name.length > 8 ? 70 : 84

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', background: PAPER, display: 'flex', padding: 28, fontFamily: 'Space Mono' }}>
        <div style={{
          position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          background: '#ffffff', border: `6px solid ${INK}`, borderRadius: 32, boxShadow: `14px 14px 0 ${INK}`,
          padding: '38px 46px', overflow: 'hidden',
        }}>
          {/* Doodles festifs */}
          <Star s={46} c={YELLOW} style={{ top: 96, left: 360, transform: 'rotate(-12deg)' }} />
          <Spark s={40} c={LIME} style={{ top: 150, right: 300, transform: 'rotate(8deg)' }} />
          <Heart s={34} c={MAGENTA} style={{ bottom: 150, left: 330, transform: 'rotate(10deg)' }} />
          <Star s={28} c={VIOLET} style={{ bottom: 120, right: 360, transform: 'rotate(14deg)' }} />
          <div style={{ position: 'absolute', top: 220, left: 250, width: 16, height: 16, background: MAGENTA, transform: 'rotate(20deg)', display: 'flex' }} />
          <div style={{ position: 'absolute', bottom: 200, right: 260, width: 14, height: 14, background: YELLOW, transform: 'rotate(12deg)', display: 'flex' }} />

          {/* Top : logo W + hbdwall | @pseudo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ position: 'relative', width: 52, height: 52, background: INK, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 30, color: PAPER }}>W</span>
                <div style={{ position: 'absolute', top: 9, right: 9, width: 9, height: 9, background: VIOLET, display: 'flex' }} />
              </div>
              <span style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 28, color: INK }}>hbdwall</span>
            </div>
            <span style={{ color: MUTED, fontSize: 20, letterSpacing: '0.06em' }}>{`@${pseudo}`}</span>
          </div>

          {/* Middle : avatar | nom | QR */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, flex: 1 }}>
              <img
                src={avatar.url}
                width={168}
                height={168}
                style={{ width: 168, height: 168, borderRadius: 84, border: `5px solid ${INK}`, objectFit: avatar.fit, background: YELLOW, transform: 'rotate(-3deg)' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', width: '100%', marginBottom: 8 }}>
                  <Shout text="IT'S MY BIRTHDAY" size={36} align="flex-start" />
                </div>
                <span style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: nameSize, color: INK, lineHeight: 1 }}>{name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
                  {dateStr ? (
                    <div style={{ display: 'flex', background: LIME, border: `3px solid ${INK}`, borderRadius: 10, padding: '4px 12px' }}>
                      <span style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 20, color: INK }}>{dateStr}</span>
                    </div>
                  ) : null}
                  <span style={{ fontSize: 19, color: MUTED }}>{proof}</span>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              background: '#fff', border: `5px solid ${INK}`, borderRadius: 22, boxShadow: `8px 8px 0 ${VIOLET}`, padding: 16, transform: 'rotate(3deg)',
            }}>
              <img src={qr} width={162} height={162} style={{ width: 162, height: 162 }} />
              <span style={{ fontFamily: 'Space Mono', fontWeight: 700, fontSize: 15, color: INK, letterSpacing: '0.08em' }}>{scanLabel}</span>
            </div>
          </div>

          {/* Bottom : url | CTA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `4px solid ${INK}`, paddingTop: 20, position: 'relative' }}>
            <span style={{ color: MUTED, fontSize: 20, letterSpacing: '0.06em' }}>hbdwall.xyz</span>
            <div style={{ display: 'flex', background: VIOLET, border: `4px solid ${INK}`, borderRadius: 999, padding: '10px 26px', boxShadow: `5px 5px 0 ${INK}` }}>
              <span style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 22, color: '#fff' }}>{cta}</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, ...(fonts.length ? { fonts } : {}) }
  )
}
