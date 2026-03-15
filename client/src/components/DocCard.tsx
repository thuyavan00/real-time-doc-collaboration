import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { DocSummary } from '../store/api'

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

interface Props {
  doc: DocSummary
  onRename: (id: string, newTitle: string) => void
  onDelete: (id: string) => void
}

export function DocCard({ doc, onRename, onDelete }: Props) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [draftTitle, setDraftTitle] = useState(doc.title)
  const inputRef = useRef<HTMLInputElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const openRename = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    setDraftTitle(doc.title)
    setRenaming(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const commitRename = () => {
    const t = draftTitle.trim()
    setRenaming(false)
    if (t && t !== doc.title) onRename(doc.id, t)
    else setDraftTitle(doc.title)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    if (confirm(`Delete "${doc.title}"? This cannot be undone.`)) {
      onDelete(doc.id)
    }
  }

  return (
    <div
      className="doc-card"
      onClick={() => !renaming && navigate(`/doc/${doc.id}`)}
      title={renaming ? undefined : `Open "${doc.title}"`}
    >
      {renaming ? (
        <input
          ref={inputRef}
          className="doc-card-rename-input"
          value={draftTitle}
          autoFocus
          onClick={e => e.stopPropagation()}
          onChange={e => setDraftTitle(e.target.value)}
          onBlur={commitRename}
          onKeyDown={e => {
            if (e.key === 'Enter') commitRename()
            if (e.key === 'Escape') { setRenaming(false); setDraftTitle(doc.title) }
          }}
        />
      ) : (
        <div className="doc-card-title">{doc.title || 'Untitled'}</div>
      )}

      <div className="doc-card-meta">
        <span className="version-badge">v{doc.version}</span>
        <span className="doc-card-time">{relativeTime(doc.updatedAt)}</span>

        <div className="doc-card-actions" ref={actionsRef} onClick={e => e.stopPropagation()}>
          <button
            className="doc-card-menu-btn"
            title="More options"
            onClick={() => setMenuOpen(o => !o)}
          >
            ···
          </button>
          {menuOpen && (
            <div className="doc-card-menu">
              <button onClick={openRename}>Rename</button>
              <button className="danger" onClick={handleDelete}>Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
