import { useNavigate } from 'react-router-dom'
import type { DocSummary } from '../lib/api'

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function DocCard({ doc }: { doc: DocSummary }) {
  const navigate = useNavigate()

  return (
    <div
      className="doc-card"
      onClick={() => navigate(`/doc/${doc.id}`)}
      title={`Open "${doc.title}"`}
    >
      <div className="doc-card-title">{doc.title || 'Untitled'}</div>
      <div className="doc-card-meta">
        <span className="version-badge">v{doc.version}</span>
        <span className="doc-card-time">{relativeTime(doc.updatedAt)}</span>
      </div>
    </div>
  )
}
