'use client'
import { useRef, useState } from 'react'
import Avatar from './Avatar'

interface Props {
  name: string
  currentSrc: string | null
  onClose: () => void
  onUpdate: (image: string | null) => void
}

export default function AvatarUploadModal({ name, currentSrc, onClose, onUpdate }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(currentSrc)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFile(f: File) {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setError(null)
  }

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      const res = await fetch('/api/auth/profile/avatar', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      onUpdate(data.image)
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/profile/avatar', { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur')
      onUpdate(null)
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 'var(--s-6)',
          width: 320,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--s-4)',
        }}
      >
        <p className="t-body" style={{ margin: 0, fontWeight: 600 }}>Photo de profil</p>

        <div
          onClick={() => inputRef.current?.click()}
          style={{ cursor: 'pointer', position: 'relative', display: 'inline-block' }}
        >
          <Avatar name={name} src={preview} size={80} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
          >
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 600, textAlign: 'center', padding: '0 4px' }}>
              Changer
            </span>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />

        <button
          className="btn btn--ghost"
          style={{ width: '100%' }}
          onClick={() => inputRef.current?.click()}
          disabled={loading}
        >
          Choisir une photo
        </button>

        {file && (
          <button
            className="btn btn--solid"
            style={{ width: '100%' }}
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? 'Upload…' : 'Enregistrer'}
          </button>
        )}

        {currentSrc && !file && (
          <button
            className="btn btn--ghost"
            style={{ width: '100%', color: 'var(--danger, #e53e3e)' }}
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? '…' : 'Supprimer la photo'}
          </button>
        )}

        {error && <p className="t-small" style={{ color: 'var(--danger, #e53e3e)', margin: 0 }}>{error}</p>}

        <button
          className="t-small link"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onClick={onClose}
        >
          Annuler
        </button>
      </div>
    </div>
  )
}
