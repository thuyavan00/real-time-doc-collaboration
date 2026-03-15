import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, type DocSummary } from '../lib/api'
import { logout } from '../lib/auth'
import { useAuth } from '../main'
import { DocCard } from '../components/DocCard'

export function HomePage() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const [docs, setDocs] = useState<DocSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    api.listDocs().then(d => {
      setDocs(d)
      setLoading(false)
    })
  }, [])

  const handleNewDoc = async () => {
    setCreating(true)
    const doc = await api.createDoc('Untitled')
    navigate(`/doc/${doc.id}`)
  }

  const handleLogout = async () => {
    await logout()
    setUser(null)
    navigate('/auth')
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <span className="home-logo">Costory Docs</span>
        <div className="home-header-right">
          <span className="home-username">{user?.username}</span>
          <button className="btn-ghost" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      <main className="home-main">
        <div className="home-hero">
          <h1 className="home-headline">Your documents, in real time.</h1>
          <button
            className="btn-primary"
            onClick={handleNewDoc}
            disabled={creating}
          >
            {creating ? 'Creating…' : '+ New Document'}
          </button>
        </div>

        {loading ? (
          <div className="doc-grid">
            {[1, 2, 3].map(i => (
              <div key={i} className="doc-card doc-card-skeleton" />
            ))}
          </div>
        ) : docs.length === 0 ? (
          <div className="empty-state">
            <p>No documents yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="doc-grid">
            {docs.map(doc => (
              <DocCard key={doc.id} doc={doc} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
