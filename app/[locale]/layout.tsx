import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import LangSetter from '@/components/LangSetter'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'

export const metadata: Metadata = {
  title: { default: 'hbdwall', template: '%s · hbdwall' },
  description: 'Crée une page pour ton anniversaire. Tes amis laissent un mot, toi tu gardes le collage.',
  metadataBase: new URL('https://hbdwall.xyz'),
  openGraph: {
    siteName: 'hbdwall',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'fr' | 'en')) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LangSetter locale={locale} />
      <ServiceWorkerRegister />
      {children}
    </NextIntlClientProvider>
  )
}
