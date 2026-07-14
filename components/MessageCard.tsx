interface Message {
  id: string
  authorName: string | null
  content: string
  photoUrl: string | null
  createdAt: string
}

interface Props {
  message: Message
  onDelete?: (id: string) => void
}

export default function MessageCard({ message, onDelete }: Props) {
  return (
    <div style={{ background: 'var(--bg)', padding: 'var(--s-6)', position: 'relative' }}>
      {message.photoUrl && (
        <img
          src={message.photoUrl}
          alt=""
          className="img-bw"
          style={{ marginBottom: 'var(--s-4)', aspectRatio: '16/9', objectFit: 'cover' }}
        />
      )}
      <p className="t-body" style={{ marginBottom: 'var(--s-3)' }}>{message.content}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="t-label t-muted">
          {message.authorName || 'Anonyme'}
        </span>
        <span className="t-caption t-muted">
          {new Date(message.createdAt).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'short',
          })}
        </span>
      </div>
      {onDelete && (
        <button
          onClick={() => onDelete(message.id)}
          className="btn btn--ghost"
          style={{
            position: 'absolute',
            top: 'var(--s-3)',
            right: 'var(--s-3)',
            padding: '2px var(--s-2)',
            fontSize: '14px',
            lineHeight: 1,
            border: 'none',
          }}
          aria-label="Supprimer"
        >
          ×
        </button>
      )}
    </div>
  )
}
