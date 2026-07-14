'use client'
import { useState, useEffect } from 'react'

interface Wall {
  slug: string
  pseudo: string
  name: string
  isToday: boolean
  daysUntil: number
}

interface Post {
  id: string
  url: string
  createdAt: string
  walls: { slug: string; user: { pseudo: string } }[]
}

function Thumbnail({ url }: { url: string }) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/instagram-preview?url=${encodeURIComponent(url)}`)
      .then(r => r.json())
      .then(d => { if (d.image) setSrc(d.image) })
  }, [url])

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
      {src ? (
        <img src={src} alt="" style={{ width: 72, height: 72, objectFit: 'cover', display: 'block', borderRadius: 6 }} />
      ) : (
        <div style={{ width: 72, height: 72, background: 'var(--border)', borderRadius: 6 }} />
      )}
    </a>
  )
}

function PostRow({ post, allWalls, onDelete }: {
  post: Post
  allWalls: Wall[]
  onDelete: (id: string) => void
}) {
  const linkedSlugs = new Set(post.walls.map(w => w.slug))
  const [linked, setLinked] = useState(linkedSlugs)
  const [saving, setSaving] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const visibleWalls = search.trim()
    ? allWalls.filter(w => w.name.toLowerCase().includes(search.toLowerCase()) || w.pseudo.toLowerCase().includes(search.toLowerCase()))
    : allWalls.filter(w => linked.has(w.slug) || w.daysUntil <= 7)

  async function toggle(slug: string) {
    const next = new Set(linked)
    next.has(slug) ? next.delete(slug) : next.add(slug)
    setLinked(next)
    setSaving(slug)
    await fetch(`/api/instagram-posts/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallSlugs: [...next] }),
    })
    setSaving(null)
  }

  const shortUrl = post.url.replace('https://www.instagram.com/p/', '').split('/')[0]

  return (
    <div style={{ border: '1px solid var(--border)', padding: 'var(--s-4)', display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
      <div style={{ display: 'flex', gap: 'var(--s-4)', alignItems: 'center' }}>
        <Thumbnail url={post.url} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <a href={post.url} target="_blank" rel="noopener noreferrer" className="t-small link" style={{ fontFamily: 'var(--font-mono)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            /p/{shortUrl}
          </a>
          <p className="t-caption t-muted">{new Date(post.createdAt).toLocaleDateString('fr-FR')}</p>
        </div>
        <button onClick={() => onDelete(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', fontSize: 18, lineHeight: 1, padding: 4, flexShrink: 0 }}>×</button>
      </div>

      <div>
        <input
          className="input"
          placeholder="Rechercher un mur..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', marginBottom: 'var(--s-2)', fontSize: 12, padding: '4px 8px' }}
        />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)' }}>
        {visibleWalls.length === 0 && search && <span className="t-caption t-muted">Aucun résultat</span>}
        {visibleWalls.map(w => {
          const isLinked = linked.has(w.slug)
          return (
            <button
              key={w.slug}
              onClick={() => toggle(w.slug)}
              disabled={saving === w.slug}
              style={{
                border: `1px solid ${isLinked ? 'var(--accent)' : 'var(--border)'}`,
                background: isLinked ? 'var(--accent)' : 'transparent',
                color: isLinked ? '#fff' : 'var(--fg-muted)',
                borderRadius: 999,
                padding: '3px 10px',
                fontSize: 11,
                cursor: 'pointer',
                opacity: saving === w.slug ? 0.5 : 1,
                transition: 'all 0.15s',
              }}
            >
              {w.isToday ? '🎂 ' : w.daysUntil <= 7 ? `J-${w.daysUntil} ` : ''}{w.name} <span style={{ opacity: 0.6 }}>@{w.pseudo}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function InstagramCRUD({ initialPosts, allWalls }: { initialPosts: Post[]; allWalls: Wall[] }) {
  const [posts, setPosts] = useState(initialPosts)
  const [newUrl, setNewUrl] = useState('')
  const [adding, setAdding] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newUrl.includes('instagram.com')) return
    setAdding(true)
    try {
      const res = await fetch('/api/instagram-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl }),
      })
      const post = await res.json()
      setPosts(prev => [{ ...post, walls: [] }, ...prev])
      setNewUrl('')
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/instagram-posts/${id}`, { method: 'DELETE' })
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div>
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 'var(--s-3)', marginBottom: 'var(--s-8)', maxWidth: 560 }}>
        <input
          className="input"
          type="url"
          placeholder="https://www.instagram.com/p/..."
          value={newUrl}
          onChange={e => setNewUrl(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="btn btn--solid" type="submit" disabled={adding || !newUrl.includes('instagram.com')} style={{ flexShrink: 0 }}>
          {adding ? '...' : '+ Ajouter'}
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
        {posts.length === 0 && <p className="t-small t-muted">Aucun post pour l'instant.</p>}
        {posts.map(post => (
          <PostRow key={post.id} post={post} allWalls={allWalls} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  )
}
