export interface DocSummary {
  id: string
  title: string
  version: number
  updatedAt: string
}

export interface DocDetail extends DocSummary {
  content: string | null
}

const opts: RequestInit = { credentials: 'include' }

export const api = {
  listDocs: (): Promise<DocSummary[]> =>
    fetch('/api/docs', opts).then(r => r.json()),

  getDoc: (id: string): Promise<DocDetail> =>
    fetch(`/api/docs/${id}`, opts).then(r => r.json()),

  createDoc: (title: string): Promise<{ id: string; title: string; version: number }> =>
    fetch('/api/docs', {
      ...opts,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    }).then(r => r.json()),
}
