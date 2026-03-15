type RosterUser = { userId: string; display: string; color: string }

const MAX_VISIBLE = 6

export function PresenceBar({ roster }: { roster: RosterUser[] }) {
  const visible = roster.slice(0, MAX_VISIBLE)
  const overflow = roster.length - MAX_VISIBLE

  return (
    <div className="presence-bar">
      {visible.map(u => (
        <div
          key={u.userId}
          className="avatar"
          style={{ background: u.color }}
          title={u.display}
        >
          {u.display.slice(0, 1).toUpperCase()}
        </div>
      ))}
      {overflow > 0 && (
        <div className="avatar avatar-overflow">+{overflow}</div>
      )}
    </div>
  )
}
