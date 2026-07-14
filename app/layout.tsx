import './globals.css'
import Script from 'next/script'
import { cookies } from 'next/headers'
import { getTheme } from '@/lib/theme'
import ThemeWarp from '@/components/ThemeWarp'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = await getTheme()
  const warpTo = (await cookies()).get('hbd-warp')?.value ?? null
  // Analytics Umami optionnel — activé seulement si les variables d'env sont définies.
  const umamiSrc = process.env.NEXT_PUBLIC_UMAMI_SRC
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
  return (
    <html suppressHydrationWarning data-theme={theme}>
      <head>
        {umamiSrc && umamiWebsiteId && (
          <Script defer src={umamiSrc} data-website-id={umamiWebsiteId} />
        )}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="hbdwall" />
        <meta name="theme-color" content="#111111" />
      </head>
      <body className="grain">{children}<ThemeWarp warpTo={warpTo} /></body>
    </html>
  )
}
