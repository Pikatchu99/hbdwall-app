'use client'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'

export default function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function toggle() {
    const next = locale === 'fr' ? 'en' : 'fr'
    const stripped = pathname.replace(/^\/(fr|en)/, '') || '/'
    router.push(`/${next}${stripped}`)
  }

  return (
    <button
      onClick={toggle}
      className="btn btn--ghost"
      style={{ fontSize: '11px', padding: '4px 8px', minWidth: '36px' }}
    >
      {locale === 'fr' ? 'EN' : 'FR'}
    </button>
  )
}
