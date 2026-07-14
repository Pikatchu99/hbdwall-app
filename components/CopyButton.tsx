'use client'
import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { track } from '@/lib/analytics'

export default function CopyButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)
  const [fullUrl, setFullUrl] = useState('')

  useEffect(() => {
    setFullUrl(`${window.location.origin}/wall/${slug}`)
  }, [slug])

  function handleCopy() {
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
    track('wall_link_copied', { slug })
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', border: 'var(--border-w) solid var(--border-strong)', borderRadius: 'var(--radius)', overflow: 'hidden', maxWidth: '420px', width: '100%' }}>
      <span className="t-small t-muted" style={{ flex: 1, padding: 'var(--s-2) var(--s-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        wall/{slug}
      </span>
      <button onClick={handleCopy} className="btn btn--solid" style={{ borderLeft: 'var(--border-w) solid var(--border-strong)', borderRadius: 0, padding: 'var(--s-2) var(--s-4)', flexShrink: 0 }}>
        {copied ? <Check size={14} /> : 'Copier'}
      </button>
    </div>
  )
}
