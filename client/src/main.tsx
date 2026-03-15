import './shims-global'
import { StrictMode, createContext, useContext, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './index.css'
import { getMe, type AuthUser } from './lib/auth'
import { AuthPage } from './pages/AuthPage'
import { HomePage } from './pages/HomePage'
import { DocumentPage } from './pages/DocumentPage'

// ── Auth context ────────────────────────────────────────
export const AuthContext = createContext<{
  user: AuthUser | null
  setUser: (u: AuthUser | null) => void
}>({ user: null, setUser: () => {} })

export function useAuth() {
  return useContext(AuthContext)
}

// ── Guard: redirect to /auth if not logged in ───────────
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()
  if (user === undefined) return null                    // still loading
  if (user === null) return <Navigate to="/auth" state={{ from: location }} replace />
  return <>{children}</>
}

// ── Root ────────────────────────────────────────────────
function Root() {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined)

  useEffect(() => {
    getMe().then(u => setUser(u ?? null))
  }, [])

  // Show nothing while we check the cookie (avoids flash-of-login-page)
  if (user === undefined) return null

  return (
    <AuthContext.Provider value={{ user: user as AuthUser | null, setUser }}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage onAuth={u => setUser(u)} />} />
          <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
          <Route path="/doc/:id" element={<RequireAuth><DocumentPage /></RequireAuth>} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
