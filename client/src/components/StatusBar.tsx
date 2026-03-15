type Status = 'connected' | 'disconnected' | 'connecting'

interface Props {
  status: Status
  version: number
  content: string
}

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export function StatusBar({ status, version, content }: Props) {
  const dotColor =
    status === 'connected' ? 'var(--success)' :
    status === 'connecting' ? '#f5a623' :
    'var(--danger)'

  const statusLabel =
    status === 'connected' ? 'Connected' :
    status === 'connecting' ? 'Connecting…' :
    'Disconnected'

  return (
    <div className="status-bar">
      <span className="status-left">
        <span className="status-dot" style={{ background: dotColor }} />
        {statusLabel}
      </span>
      <span className="status-center">v{version}</span>
      <span className="status-right">{wordCount(content)} words</span>
    </div>
  )
}
