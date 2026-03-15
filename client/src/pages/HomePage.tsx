import { useNavigate } from 'react-router-dom'
import {
  useListDocsQuery,
  useCreateDocMutation,
  useRenameDocMutation,
  useDeleteDocMutation,
  useLogoutMutation,
} from '../store/api'
import { useAuth } from '../main'
import { DocCard } from '../components/DocCard'

export function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: docs = [], isLoading } = useListDocsQuery()
  const [createDoc, { isLoading: creating }] = useCreateDocMutation()
  const [renameDoc] = useRenameDocMutation()
  const [deleteDoc] = useDeleteDocMutation()
  const [logout] = useLogoutMutation()

  const handleNewDoc = async () => {
    const doc = await createDoc('Untitled').unwrap()
    navigate(`/doc/${doc.id}`)
  }

  const handleRename = async (id: string, title: string) => {
    await renameDoc({ id, title })
  }

  const handleDelete = async (id: string) => {
    await deleteDoc(id)
  }

  const handleLogout = async () => {
    await logout()
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

        {isLoading ? (
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
          <>
            <section className="doc-section">
              <h2 className="doc-section-heading">Recent</h2>
              <div className="doc-grid">
                {docs.slice(0, 4).map(doc => (
                  <DocCard key={doc.id} doc={doc} onRename={handleRename} onDelete={handleDelete} />
                ))}
              </div>
            </section>

            {docs.length > 0 && (
              <section className="doc-section">
                <h2 className="doc-section-heading">All Documents</h2>
                <div className="doc-grid">
                  {[...docs]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map(doc => (
                      <DocCard key={doc.id} doc={doc} onRename={handleRename} onDelete={handleDelete} />
                    ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}
