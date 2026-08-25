'use client'
import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

interface RenderJob {
  id: string
  status: 'pending' | 'rendering' | 'done' | 'failed'
  videoUrl: string | null
  errorMessage: string | null
}

export default function RenderTrigger({ wallSlug }: { wallSlug: string }) {
  const t = useTranslations('wallAdmin')
  const [job, setJob] = useState<RenderJob | null>(null)
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function stopPolling() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  function startPolling(jobId: string) {
    stopPolling()
    intervalRef.current = setInterval(async () => {
      const res = await fetch(`/api/walls/${wallSlug}/render/${jobId}`)
      if (!res.ok) return
      const data: RenderJob = await res.json()
      setJob(data)
      if (data.status === 'done' || data.status === 'failed') stopPolling()
    }, 3000)
  }

  useEffect(() => stopPolling, [])

  async function trigger() {
    setLoading(true)
    const res = await fetch(`/api/walls/${wallSlug}/render`, { method: 'POST' })
    const data = await res.json()
    setLoading(false)

    if (res.status === 201) {
      setJob(data)
      startPolling(data.id)
    } else if (res.status === 409 && data.job) {
      setJob(data.job)
      startPolling(data.job.id)
    }
  }

  if (!job || job.status === 'failed') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)', alignItems: 'flex-end' }}>
        <button className="btn btn--solid" onClick={trigger} disabled={loading}>
          {loading ? t('renderPending') : t('renderLink')}
        </button>
        {job?.status === 'failed' && (
          <p className="t-small t-accent">{job.errorMessage || t('renderFailed')}</p>
        )}
      </div>
    )
  }

  if (job.status === 'pending' || job.status === 'rendering') {
    return <p className="t-small t-muted">{t('renderPending')}</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)', alignItems: 'flex-end' }}>
      {job.videoUrl && (
        <>
          <video src={job.videoUrl} controls style={{ maxWidth: '220px', borderRadius: '8px' }} />
          <a href={job.videoUrl} download className="t-small link">{t('renderDownload')}</a>
        </>
      )}
      <button className="btn btn--ghost" onClick={trigger} disabled={loading}>
        {t('renderRetry')}
      </button>
    </div>
  )
}
