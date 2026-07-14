import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

// Hôte du bucket R2 lu depuis l'env (jamais codé en dur).
const r2Host = process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL).hostname : undefined

const nextConfig: NextConfig = {
  output: 'standalone',
  // Force la racine de tracing sur ce projet : sinon Next remonte jusqu'à
  // ~/pnpm-lock.yaml et trace tout le home (lent). Voir le warning multi-lockfiles.
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      ...(r2Host ? [{ protocol: 'https' as const, hostname: r2Host }] : []),
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
