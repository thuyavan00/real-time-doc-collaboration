import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLoginMutation, useRegisterMutation } from '../store/api'

export function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const [login, { isLoading: loggingIn }] = useLoginMutation()
  const [register, { isLoading: registering }] = useRegisterMutation()
  const loading = loggingIn || registering

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'login') {
        await login({ username, password }).unwrap()
      } else {
        await register({ username, password }).unwrap()
      }
      navigate('/')
    } catch (err: any) {
      setError(err.data?.error ?? err.message ?? 'Something went wrong')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Costory Docs</div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError('') }}
            type="button"
          >
            Sign in
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError('') }}
            type="button"
          >
            Register
          </button>
        </div>

        <form onSubmit={submit} className="auth-form">
          <label className="auth-label">
            Username
            <input
              className="auth-input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
              required
            />
          </label>

          <label className="auth-label">
            Password
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button className="btn-primary auth-submit" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
