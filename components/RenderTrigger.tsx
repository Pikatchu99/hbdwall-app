'use client'
import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

interface RenderJob {
  id: string
  status: 'pending' | 'rendering' | 'done' | 'failed'
  videoUrl: string | null
  errorMessage: string | null
  finishedAt: string | null
}

interface InitialRenderJob {
  id: string
  status: string
  videoUrl: string | null
  errorMessage: string | null
  finishedAt: string | null
}

export default function RenderTrigger({ wallSlug, initialJob }: { wallSlug: string; initialJob: InitialRenderJob | null }) {
  const t = useTranslations('wallAdmin')
  const [job, setJob] = useState<RenderJob | null>(initialJob as RenderJob | null)
  const [loading, setLoading] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
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

  useEffect(() => {
    // Reprend le suivi d'un rendu déjà en cours au moment où la page a été chargée
    // (ex: le propriétaire a lancé un rendu puis a rafraîchi/rouvert la page).
    if (initialJob && (initialJob.status === 'pending' || initialJob.status === 'rendering')) {
      startPolling(initialJob.id)
    }
    return stopPolling
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function trigger() {
    setLoading(true)
    setShowVideo(false)
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

  const finishedLabel = job.finishedAt
    ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(job.finishedAt))
    : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)', alignItems: 'flex-end' }}>
      <p className="t-small">
        {t('renderDone')}{finishedLabel ? ` · ${finishedLabel}` : ''}
      </p>
      <div style={{ display: 'flex', gap: 'var(--s-3)', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {job.videoUrl && <a href={job.videoUrl} download className="t-small link">{t('renderDownload')}</a>}
        {job.videoUrl && (
          <button className="t-small link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => setShowVideo(v => !v)}>
            {showVideo ? t('renderHide') : t('renderPreview')}
          </button>
        )}
        <button className="btn btn--ghost" onClick={trigger} disabled={loading}>
          {t('renderRetry')}
        </button>
      </div>
      {showVideo && job.videoUrl && (
        <video src={job.videoUrl} controls style={{ maxWidth: '220px', borderRadius: '8px' }} />
      )}
    </div>
  )
}
