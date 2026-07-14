import { ImageResponse } from 'next/og'
import { PAPER, INK, VIOLET, YELLOW, LIME, MAGENTA, MUTED, Star, Spark, Heart, Shout, loadCardFonts } from '@/lib/og-shared'

// OG de marque : sert pour la home + les pages sans OG propre (blog index, comparatif…).
// Les murs et les articles ont le leur (ils ne sont pas affectés).
export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isFr = locale === 'fr'
  const fonts = await loadCardFonts()
  const title = isFr ? 'Le mur d’anniversaire en ligne' : 'The online birthday wall'
  const sub = isFr
    ? 'Tes proches y laissent un mot et une photo. Tu gardes le collage souvenir.'
    : 'Friends leave a note and a photo. You keep the memory collage.'
  const cta = isFr ? 'Crée ton mur →' : 'Create your wall →'

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', background: PAPER, display: 'flex', padding: 28, fontFamily: 'Space Mono' }}>
        <div style={{
          position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          background: '#ffffff', border: `6px solid ${INK}`, borderRadius: 32, boxShadow: `14px 14px 0 ${INK}`,
          padding: '44px 56px', overflow: 'hidden',
        }}>
          {/* Doodles festifs */}
          <Star s={50} c={YELLOW} style={{ top: 78, right: 118, transform: 'rotate(-12deg)' }} />
          <Spark s={44} c={LIME} style={{ top: 210, left: 70, transform: 'rotate(8deg)' }} />
          <Heart s={38} c={MAGENTA} style={{ bottom: 128, right: 132, transform: 'rotate(10deg)' }} />
          <Star s={30} c={VIOLET} style={{ bottom: 176, left: 150, transform: 'rotate(14deg)' }} />
          <div style={{ position: 'absolute', top: 150, right: 320, width: 16, height: 16, background: MAGENTA, transform: 'rotate(20deg)', display: 'flex' }} />

          {/* Top : logo W + hbdwall */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
            <div style={{ position: 'relative', width: 56, height: 56, background: INK, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 32, color: PAPER }}>W</span>
              <div style={{ position: 'absolute', top: 10, right: 10, width: 9, height: 9, background: VIOLET, display: 'flex' }} />
            </div>
            <span style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 30, color: INK }}>hbdwall</span>
          </div>

          {/* Middle : shout + titre + sous-titre */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', position: 'relative' }}>
            <div style={{ display: 'flex', marginBottom: 18 }}>
              <Shout text="IT'S MY BIRTHDAY" size={44} align="flex-start" />
            </div>
            <span style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 62, color: INK, lineHeight: 1.02, maxWidth: 880 }}>{title}</span>
            <span style={{ fontSize: 24, color: MUTED, marginTop: 18, maxWidth: 760, lineHeight: 1.4 }}>{sub}</span>
          </div>

          {/* Bottom : url + CTA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `4px solid ${INK}`, paddingTop: 22, position: 'relative' }}>
            <span style={{ color: MUTED, fontSize: 22, letterSpacing: '0.06em' }}>hbdwall.xyz</span>
            <div style={{ display: 'flex', background: VIOLET, border: `4px solid ${INK}`, borderRadius: 999, padding: '12px 30px', boxShadow: `5px 5px 0 ${INK}` }}>
              <span style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 24, color: '#fff' }}>{cta}</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, ...(fonts.length ? { fonts } : {}) }
  )
}
