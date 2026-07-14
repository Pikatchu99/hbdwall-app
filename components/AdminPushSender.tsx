'use client'
import { useState } from 'react'


export default function AdminPushSender({ totalSubs }: { totalSubs: number }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function send() {
    setLoading(true)
    setResult(null)
    const res = await fetch('/api/admin/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body }),
    })
    const data = await res.json()
    setResult(res.ok ? `Envoyé à ${data.sent} appareil(s)` : 'Erreur')
    setLoading(false)
  }

  return (
    <div style={{ border: '1px solid var(--border)', padding: 'var(--s-5)', marginBottom: 'var(--s-10)' }}>
      <p className="t-label t-muted" style={{ marginBottom: 'var(--s-4)' }}>
        PUSH NOTIFICATIONS · {totalSubs} abonné(s)
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)', marginBottom: 'var(--s-4)' }}>
        <input
          type="text"
          placeholder="Titre"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ height: '36px', padding: '0 var(--s-3)', border: '1px solid var(--border)', background: 'var(--bg)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
        />
        <input
          type="text"
          placeholder="Message"
          value={body}
          onChange={e => setBody(e.target.value)}
          style={{ height: '36px', padding: '0 var(--s-3)', border: '1px solid var(--border)', background: 'var(--bg)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-4)' }}>
        <button
          onClick={send}
          disabled={loading || !title || !body}
          className="btn btn--solid"
          style={{ fontSize: '11px' }}
        >
          {loading ? '...' : `Envoyer à tous →`}
        </button>
        {result && <span className="t-caption t-muted">{result}</span>}
      </div>
    </div>
  )
}
