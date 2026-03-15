import './shims-global'
import { StrictMode, createContext, useContext } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './index.css'
import { store } from './store/store'
import { type AuthUser, useGetMeQuery } from './store/api'
import { AuthPage } from './pages/AuthPage'
import { HomePage } from './pages/HomePage'
import { DocumentPage } from './pages/DocumentPage'

// ── Auth context ────────────────────────────────────────
export const AuthContext = createContext<{ user: AuthUser | null }>({ user: null })

export function useAuth() {
  return useContext(AuthContext)
}

// ── Guard: redirect to /auth if not logged in ───────────
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()
  if (user === null) return <Navigate to="/auth" state={{ from: location }} replace />
  return <>{children}</>
}

// ── Root ────────────────────────────────────────────────
function Root() {
  const { data: user, isLoading } = useGetMeQuery()

  // Show nothing while checking auth (avoids flash-of-login-page)
  if (isLoading) return null

  return (
    <AuthContext.Provider value={{ user: user ?? null }}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
          <Route path="/doc/:id" element={<RequireAuth><DocumentPage /></RequireAuth>} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <Root />
    </Provider>
  </StrictMode>,
)
