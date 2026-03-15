export interface AuthUser {
  username: string
}

export async function getMe(): Promise<AuthUser | null> {
  try {
    const r = await fetch('/api/auth/me', { credentials: 'include' })
    if (!r.ok) return null
    return r.json()
  } catch {
    return null
  }
}

export async function login(username: string, password: string): Promise<AuthUser> {
  const r = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  })
  if (!r.ok) throw new Error((await r.json()).error ?? 'Login failed')
  return r.json()
}

export async function register(username: string, password: string): Promise<AuthUser> {
  const r = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  })
  if (!r.ok) throw new Error((await r.json()).error ?? 'Registration failed')
  return r.json()
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
}
