High value / low effort:

- DELETE /api/docs/{id} — delete documents from the homepage
- PATCH /api/docs/{id}/title — rename documents inline
- Persist display name preference (currently anonymous every refresh)

Medium complexity:

- JWT auth — replace anonymous x-user-id with real user identity; protect endpoints
- Document history endpoint GET /api/docs/{id}/ops — show an op-by-op audit trail
- Render other users' cursors — currently cursor positions are received but never displayed in the editor; add colored cursor markers inside the textarea (or switch to a rich text editor
  like CodeMirror/ProseMirror to render them properly)

Larger features:

- Redis message broker — replace enableSimpleBroker with Redis STOMP relay for horizontal scaling
- Document search GET /api/docs?q=keyword — full-text search via PostgreSQL tsvector
- Presence eviction — currently in-memory presence never expires on server crash; add TTL via Redis or periodic cleanup
- Rich text support — move from plain textarea + OT spans to ProseMirror/Slate with a richer op format
- Export — GET /api/docs/{id}/export?format=md|txt — download document content
