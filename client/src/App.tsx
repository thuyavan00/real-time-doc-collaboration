import { useEffect, useRef, useState } from 'react'
import { createStomp } from './lib/ws'

type RosterUser = { userId: string; display: string; color: string }

export default function App() {
  const [docId, setDocId] = useState('')
  const [display, setDisplay] = useState('Guest')
  const [connected, setConnected] = useState(false)
  const [roster, setRoster] = useState<RosterUser[]>([])
  const [log, setLog] = useState<string[]>([])
  const [content, setContent] = useState('')


  const stompRef = useRef<ReturnType<typeof createStomp> | null>(null)
  const versionRef = useRef<number>(0)

  const addLog = (m: string) => setLog((l) => [m, ...l].slice(0, 200))

  const connect = () => {
    if (!docId) return alert('Enter a document ID (UUID)')
    stompRef.current = createStomp(() => {
      setConnected(true)
      addLog('Connected')

      // subscribe presence
      stompRef.current?.subscribe(`/topic/doc/${docId}/presence`, (f) => {
        const data = JSON.parse(f.body)
        if (data.type === 'roster') {
          setRoster(data.users)
          addLog('Roster received')
        } else if (data.type === 'left') {
          addLog(`Left: ${data.userId}`)
          // re-fetch roster would be nicer; MVP keeps it simple
        }
      })

      // subscribe cursor
      stompRef.current?.subscribe(`/topic/doc/${docId}/cursor`, (f) => {
        addLog(`Cursor: ${f.body}`)
      })

      // subscribe ops (optional if you want to observe edits)
      stompRef.current?.subscribe(`/topic/doc/${docId}`, (f) => {
        const data = JSON.parse(f.body)
        versionRef.current = data.newVersion
        addLog(`Op newVersion=${data.newVersion}`)
      })

      // join
      stompRef.current?.publish({
        destination: `/app/doc/${docId}/presence`,
        body: JSON.stringify({ type: 'join', display }),
      })

      // subscribe to ops (you already have)
      stompRef.current?.subscribe(`/topic/doc/${docId}`, async (f) => {
        const data = JSON.parse(f.body)
        versionRef.current = data.newVersion
        addLog(`Op newVersion=${data.newVersion}`)

        // fetch latest snapshot
        const res = await fetch(`/api/docs/${docId}`)
        const doc = await res.json()
        setContent(doc.content ?? '')
      })

      // heartbeat ping
      const ping = setInterval(() => {
        stompRef.current?.publish({
          destination: `/app/doc/${docId}/presence`,
          body: JSON.stringify({ type: 'ping' }),
        })
      }, 15000)
      // store cleanup on element
      ;(stompRef.current as any).__ping = ping
    })
  }

  const disconnect = () => {
    const c = stompRef.current
    if (c) {
      try {
        c.publish({ destination: `/app/doc/${docId}/presence`, body: JSON.stringify({ type: 'leave' }) })
      } catch {}
      clearInterval((c as any).__ping)
      c.deactivate()
    }
    setConnected(false)
    addLog('Disconnected')
  }

  // cursor throttling
  const lastCursor = useRef(0)
  const sendCursor = (pos: number, selFrom: number, selTo: number) => {
    const now = performance.now()
    if (now - lastCursor.current < 50) return
    lastCursor.current = now
    stompRef.current?.publish({
      destination: `/app/doc/${docId}/cursor`,
      body: JSON.stringify({ pos, selFrom, selTo }),
    })
  }

  useEffect(() => {
    const onBeforeUnload = () => disconnect()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  return (
    <div style={{ fontFamily: 'system-ui', padding: 16, maxWidth: 900, margin: '0 auto' }}>
      <h2>Real-Time Docs — Presence & Cursor (Vite)</h2>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input placeholder="Document UUID" value={docId} onChange={e => setDocId(e.target.value)} style={{ flex: 1, padding: 8 }} />
        <input placeholder="Display name" value={display} onChange={e => setDisplay(e.target.value)} style={{ width: 200, padding: 8 }} />
        {!connected ? (
          <button onClick={connect}>Connect</button>
        ) : (
          <button onClick={disconnect}>Leave</button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 2 }}>
          <Editor onCursor={sendCursor} />
        </div>
        <div style={{ flex: 1 }}>
          <h4>Online</h4>
          <ul>
            {roster.map(u => (
              <li key={u.userId} style={{ listStyle: 'none', marginBottom: 6 }}>
                <span style={{
                  display: 'inline-block',
                  width: 10, height: 10, borderRadius: 9999,
                  background: u.color, marginRight: 8
                }} />
                <strong>{u.display}</strong> <small style={{ opacity: .6 }}>({u.userId})</small>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ marginTop: 12 }}>
  <h4>Server snapshot</h4>
  <pre style={{ background:'#f6f8fa', padding:12 }}>{content}</pre>
</div>
      </div>
      <button onClick={() => {
  if (!docId) return
  const op = { type: 'text', ops: [{ action: 'insert', text: 'Hello from Vite' }], baseVersion: 0, clientId: 'vite-client' }
  // in a real client, track and use the latest baseVersion from broadcasts
  stompRef.current?.publish({ destination: `/app/doc/${docId}/op`, body: JSON.stringify(op) })
}}>Send Insert Op</button>

      <h4>Log</h4>
      <pre style={{ background: '#111', color: '#9ef', padding: 12, minHeight: 120 }}>{log.join('\n')}</pre>
    </div>
  )
}

function Editor({ onCursor }: { onCursor: (pos: number, selFrom: number, selTo: number) => void }) {
  const ref = useRef<HTMLTextAreaElement | null>(null)

  const report = () => {
    const el = ref.current!
    onCursor(el.selectionStart, el.selectionStart, el.selectionEnd)
  }

  return (
    <textarea
      ref={ref}
      placeholder="Type, click, select to send cursor updates…"
      rows={12}
      style={{ width: '100%', padding: 12, fontFamily: 'ui-monospace, Menlo, Consolas, monospace' }}
      onKeyUp={report}
      onClick={report}
      onSelect={report}
    />
  )
}
