'use client'
import { useTranslations } from 'next-intl'

export default function InstagramCard({ postUrl }: { postUrl: string }) {
  const t = useTranslations('wall')

  return (
    <div className="ig-card" style={{
      background: 'var(--accent)',
      color: '#fff',
      padding: 'var(--s-4) var(--s-6)',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--s-4)',
      flexWrap: 'nowrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', minWidth: 0, overflow: 'hidden' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" style={{ flexShrink: 0 }}>
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <circle cx="12" cy="12" r="4"/>
          <circle cx="17.5" cy="6.5" r="1" fill="#fff" stroke="none"/>
        </svg>
        <span className="t-small" style={{ color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('instagramPostNotice')}</span>
      </div>
      <a href={postUrl} target="_blank" rel="noopener noreferrer" className="btn btn--ghost" style={{ fontSize: '10px', padding: '3px 8px', color: '#fff', background: 'transparent', borderColor: 'rgba(255,255,255,0.6)', borderRadius: '999px', flexShrink: 0, whiteSpace: 'nowrap' }}>
        {t('viewInstagramPost')}
      </a>
    </div>
  )
}
