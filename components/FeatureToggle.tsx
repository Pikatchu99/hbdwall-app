'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { SiInstagram, SiTiktok } from '@icons-pack/react-simple-icons'

export default function FeatureToggle() {
  const t = useTranslations('dashboard')

  return (
    <div className="panel tint-lime" style={{
      padding: 'var(--s-4)',
      marginBottom: 'var(--s-6)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)', marginBottom: 'var(--s-3)' }}>
        <SiInstagram size={12} color="var(--fg-muted)" />
        <SiTiktok size={12} color="var(--fg-muted)" />
        <span style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>
          @HBDWALL
        </span>
      </div>
      <p className="t-small" style={{ fontWeight: 700, marginBottom: 'var(--s-1)' }}>
        {t('featureTitle')}
      </p>
      <p className="t-caption t-muted" style={{ marginBottom: 'var(--s-4)' }}>
        {t('featureSubtitle')}
      </p>
      <Link href="/settings#reseaux-sociaux" className="btn btn--ghost" style={{ fontSize: '10px' }}>
        {t('featureCta')}
      </Link>
    </div>
  )
}
