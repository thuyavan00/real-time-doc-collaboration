import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createStomp } from '../lib/ws'
import { api } from '../lib/api'
import { useAuth } from '../main'
import { PresenceBar } from '../components/PresenceBar'
import { StatusBar } from '../components/StatusBar'

type RosterUser = { userId: string; display: string; color: string }
type ConnStatus = 'connected' | 'disconnected' | 'connecting'
type Span = { action: string; count?: number; text?: string }

/** Compute minimal OT spans from old → new string using common prefix/suffix. */
function diffToSpans(oldStr: string, newStr: string): Span[] {
  let prefix = 0
  while (prefix < oldStr.length && prefix < newStr.length && oldStr[prefix] === newStr[prefix]) {
    prefix++
  }

  let suffix = 0
  const maxSuffix = Math.min(oldStr.length - prefix, newStr.length - prefix)
  while (suffix < maxSuffix && oldStr[oldStr.length - 1 - suffix] === newStr[newStr.length - 1 - suffix]) {
    suffix++
  }

  const deleted = oldStr.length - prefix - suffix
  const inserted = newStr.slice(prefix, newStr.length - suffix || undefined)

  const spans: Span[] = []
  if (prefix > 0) spans.push({ action: 'retain', count: prefix })
  if (deleted > 0) spans.push({ action: 'delete', count: deleted })
  if (inserted.length > 0) spans.push({ action: 'insert', text: inserted })
  if (suffix > 0) spans.push({ action: 'retain', count: suffix })
  return spans
}

/** Apply OT spans to a string (mirrors OtText.apply on the server). */
function applySpans(text: string, spans: Span[]): string {
  let out = ''
  let idx = 0
  for (const s of spans) {
    if (s.action === 'retain') {
      out += text.slice(idx, idx + (s.count ?? 0))
      idx += s.count ?? 0
    } else if (s.action === 'insert') {
      out += s.text ?? ''
    } else if (s.action === 'delete') {
      idx += s.count ?? 0
    }
  }
  out += text.slice(idx)
  return out
}

export function DocumentPage() {
  const { id: docId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const display = user?.username ?? 'Guest'

  const [connStatus, setConnStatus] = useState<ConnStatus>('disconnected')
  const [roster, setRoster] = useState<RosterUser[]>([])
  const [content, setContent] = useState('')
  const [docTitle, setDocTitle] = useState('')

  const stompRef = useRef<ReturnType<typeof createStomp> | null>(null)
  const version = useRef(0)
  const prevContent = useRef('')
  const clientId = useRef(
    crypto.randomUUID?.() ?? `c-${Math.random().toString(36).slice(2)}`
  )
  const lastCursor = useRef(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load initial document content
  useEffect(() => {
    if (!docId) return
    api.getDoc(docId).then(doc => {
      setDocTitle(doc.title)
      const c = doc.content ?? ''
      setContent(c)
      prevContent.current = c
      version.current = doc.version
    })
  }, [docId])

  const connect = () => {
    if (!docId) return
    setConnStatus('connecting')
    stompRef.current = createStomp(() => {
      setConnStatus('connected')

      stompRef.current?.subscribe(`/topic/doc/${docId}/presence`, (f) => {
        const data = JSON.parse(f.body)
        if (data.type === 'roster') setRoster(data.users)
      })

      stompRef.current?.subscribe(`/topic/doc/${docId}`, (f) => {
        const data = JSON.parse(f.body)
        version.current = data.newVersion

        // Only apply the op if it came from another client
        if (data.op?.clientId !== clientId.current) {
          const updated = applySpans(prevContent.current, data.op.ops ?? [])
          prevContent.current = updated
          setContent(updated)
        }
      })

      stompRef.current?.publish({
        destination: `/app/doc/${docId}/presence`,
        body: JSON.stringify({ type: 'join', display }),
      })

      const ping = setInterval(() => {
        stompRef.current?.publish({
          destination: `/app/doc/${docId}/presence`,
          body: JSON.stringify({ type: 'ping' }),
        })
      }, 15000)
      ;(stompRef.current as any).__ping = ping
    }, () => setConnStatus('disconnected'))
  }

  const disconnect = () => {
    const c = stompRef.current
    if (c) {
      try {
        c.publish({
          destination: `/app/doc/${docId}/presence`,
          body: JSON.stringify({ type: 'leave' }),
        })
      } catch {}
      clearInterval((c as any).__ping)
      c.deactivate()
    }
    stompRef.current = null
    setConnStatus('disconnected')
    setRoster([])
  }

  useEffect(() => {
    const onUnload = () => disconnect()
    window.addEventListener('beforeunload', onUnload)
    return () => {
      window.removeEventListener('beforeunload', onUnload)
      disconnect()
    }
  }, [])

  const sendCursor = (pos: number, selFrom: number, selTo: number) => {
    const now = performance.now()
    if (now - lastCursor.current < 50) return
    lastCursor.current = now
    stompRef.current?.publish({
      destination: `/app/doc/${docId}/cursor`,
      body: JSON.stringify({ pos, selFrom, selTo }),
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    const oldContent = prevContent.current
    const spans = diffToSpans(oldContent, newContent)

    // Optimistically update local state
    prevContent.current = newContent
    setContent(newContent)

    // Send op to server if connected and there's an actual change
    if (connStatus === 'connected' && spans.length > 0) {
      stompRef.current?.publish({
        destination: `/app/doc/${docId}/op`,
        body: JSON.stringify({
          type: 'text',
          ops: spans,
          baseVersion: version.current,
          clientId: clientId.current,
        }),
      })
    }
  }

  const handleTextareaEvent = () => {
    const el = textareaRef.current
    if (!el) return
    sendCursor(el.selectionStart, el.selectionStart, el.selectionEnd)
  }

  const shortId = docId ? docId.slice(0, 8) + '…' : ''

  return (
    <div className="doc-page">
      <header className="doc-toolbar">
        <button className="btn-ghost back-btn" onClick={() => navigate('/')}>
          ← Back
        </button>

        <span className="doc-toolbar-title">{docTitle || shortId}</span>

        <div className="toolbar-right">
          <PresenceBar roster={roster} />

          <span className="toolbar-username">{display}</span>

          {connStatus !== 'connected' ? (
            <button
              className="btn-primary"
              onClick={connect}
              disabled={connStatus === 'connecting'}
            >
              {connStatus === 'connecting' ? 'Connecting…' : 'Connect'}
            </button>
          ) : (
            <button className="btn-danger" onClick={disconnect}>
              Leave
            </button>
          )}
        </div>
      </header>

      <div className="doc-editor-wrap">
        <textarea
          ref={textareaRef}
          className="doc-editor"
          placeholder="Start typing…"
          value={content}
          onChange={handleChange}
          onKeyUp={handleTextareaEvent}
          onClick={handleTextareaEvent}
          onSelect={handleTextareaEvent}
        />
      </div>

      <StatusBar
        status={connStatus}
        version={version.current}
        content={content}
      />
    </div>
  )
}
