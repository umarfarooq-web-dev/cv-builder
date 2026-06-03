import { useState, type FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { isSupabaseConfigured } from '../../lib/supabase'
import { signIn, signOut, signUp } from '../../services/authService'

type AuthPanelProps = {
  onMessage?: (text: string, type: 'success' | 'error' | 'info') => void
}

export function AuthPanel({ onMessage }: AuthPanelProps) {
  const { loading, user, profile } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  if (!isSupabaseConfigured()) return null
  if (loading) {
    return <p className="auth-panel auth-panel--muted">Checking session…</p>
  }

  if (user) {
    const label =
      profile?.display_name ||
      [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
      user.email

    return (
      <div className="auth-panel">
        <span className="auth-panel__user">Signed in as {label}</span>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={async () => {
            setBusy(true)
            const result = await signOut()
            setBusy(false)
            onMessage?.(
              result.ok ? 'Signed out.' : result.message,
              result.ok ? 'info' : 'error',
            )
          }}
          disabled={busy}
        >
          Sign out
        </button>
      </div>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    const result =
      mode === 'signup' ? await signUp(email, password) : await signIn(email, password)
    setBusy(false)
    if (result.ok) {
      onMessage?.(
        mode === 'signup'
          ? 'Account created. Check your email if confirmation is required.'
          : 'Signed in. CV saves will link to your account.',
        'success',
      )
    } else {
      onMessage?.(result.message, 'error')
    }
  }

  return (
    <form className="auth-panel auth-panel--form" onSubmit={handleSubmit}>
      <div className="auth-panel__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signin'}
          className={mode === 'signin' ? 'auth-tab auth-tab--active' : 'auth-tab'}
          onClick={() => setMode('signin')}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signup'}
          className={mode === 'signup' ? 'auth-tab auth-tab--active' : 'auth-tab'}
          onClick={() => setMode('signup')}
        >
          Sign up
        </button>
      </div>
      <div className="auth-panel__fields">
        <input
          className="field-input"
          type="email"
          placeholder="Email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="field-input"
          type="password"
          placeholder="Password (min 6 characters)"
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="btn btn--secondary btn--sm" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
        </button>
      </div>
    </form>
  )
}
