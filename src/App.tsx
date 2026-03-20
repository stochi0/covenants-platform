import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Building2 } from 'lucide-react'
import { Dashboard } from '@/components/Dashboard'
import { supabase } from '@/lib/supabase'

type AuthMode = 'signin' | 'signup'

interface CredentialsState {
  email: string
  password: string
  fullName: string
}

const INITIAL_CREDENTIALS: CredentialsState = {
  email: '',
  password: '',
  fullName: '',
}

function App() {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [credentials, setCredentials] = useState<CredentialsState>(INITIAL_CREDENTIALS)
  const [session, setSession] = useState<Session | null>(null)
  const [booting, setBooting] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')

  useEffect(() => {
    if (!supabase) {
      setBooting(false)
      return
    }

    let active = true

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) {
        return
      }

      if (error) {
        setAuthError(error.message)
        setBooting(false)
        return
      }

      setSession(data.session)
      setBooting(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) {
        return
      }

      setSession(nextSession)
      setAuthError('')
      setBooting(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const currentEmail = useMemo(() => session?.user.email ?? '', [session])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!supabase) {
      setAuthError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
      return
    }

    try {
      setSubmitting(true)
      setAuthError('')
      setAuthMessage('')

      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email.trim(),
          password: credentials.password,
        })

        if (error) {
          throw error
        }

        if (!data.session) {
          throw new Error('No session was returned from Supabase.')
        }

        setSession(data.session)
        setCredentials((current) => ({ ...current, password: '' }))
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email: credentials.email.trim(),
        password: credentials.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: credentials.fullName.trim(),
          },
        },
      })

      if (error) {
        throw error
      }

      setCredentials((current) => ({ ...current, password: '' }))

      if (data.session) {
        setSession(data.session)
        return
      }

      setAuthMessage('Account created. Check your email to confirm your address, then sign in.')
      setMode('signin')
    } catch (error) {
      setAuthError(getErrorMessage(error))
      setSession(null)
    } finally {
      setSubmitting(false)
      setBooting(false)
    }
  }

  async function handleSignOut() {
    if (!supabase) {
      setSession(null)
      return
    }

    setAuthError('')
    setAuthMessage('')
    await supabase.auth.signOut()
    setSession(null)
  }

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_22%),linear-gradient(180deg,#f4fbfa_0%,#f8faf9_44%,#f3f8f7_100%)] px-6 text-sm font-medium text-muted-foreground">
        Checking secure session...
      </div>
    )
  }

  if (!session) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_22%),linear-gradient(180deg,#f4fbfa_0%,#f8faf9_44%,#f3f8f7_100%)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.72),transparent_45%,rgba(15,118,110,0.06)_100%)]" />

        <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_20px_40px_-24px_rgba(15,118,110,0.95)]">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold tracking-[0.24em] text-primary/75 uppercase">Covenants Platform</p>
                <p className="text-sm text-muted-foreground">Authenticated access for product discovery and RFQ workflows.</p>
              </div>
            </div>

            <div className="max-w-xl space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Sign in or create an account to access Capillia.
              </h1>
              <p className="text-base leading-7 text-muted-foreground sm:text-lg">
                This platform now uses the same Supabase session model as the admin console. Sessions persist across refreshes and the dashboard is only available after authentication.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-foreground">Secure session persistence</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Active users stay signed in with Supabase token refresh enabled.
                </p>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-foreground">Self-serve onboarding</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  New users can register directly here and confirm by email if your Supabase project requires it.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/80 bg-white/88 p-6 shadow-[0_30px_80px_-40px_rgba(15,118,110,0.4)] backdrop-blur-xl sm:p-8">
            <div className="inline-flex rounded-full border border-primary/10 bg-muted p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('signin')
                  setAuthError('')
                  setAuthMessage('')
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  mode === 'signin' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  setAuthError('')
                  setAuthMessage('')
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  mode === 'signup' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Sign up
              </button>
            </div>

            <div className="mt-6 space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {mode === 'signin' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                {mode === 'signin'
                  ? 'Use your registered email and password to continue.'
                  : 'Create credentials for the Covenants product platform.'}
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={(event) => void handleSubmit(event)}>
              {mode === 'signup' ? (
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-foreground">Full name</span>
                  <input
                    type="text"
                    autoComplete="name"
                    value={credentials.fullName}
                    onChange={(event) =>
                      setCredentials((current) => ({
                        ...current,
                        fullName: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                    placeholder="Jane Doe"
                  />
                </label>
              ) : null}

              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={credentials.email}
                  onChange={(event) =>
                    setCredentials((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                  placeholder="you@company.com"
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">Password</span>
                <input
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  value={credentials.password}
                  onChange={(event) =>
                    setCredentials((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                  placeholder={mode === 'signin' ? 'Enter your password' : 'Choose a password'}
                  required
                />
              </label>

              {authError ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {authError}
                </p>
              ) : null}

              {authMessage ? (
                <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {authMessage}
                </p>
              ) : null}

              {!supabase ? (
                <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Set <code className="font-mono">VITE_SUPABASE_URL</code> and <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> to enable authentication.
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting || !supabase}
                className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_24px_45px_-24px_rgba(15,118,110,0.95)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? mode === 'signin'
                    ? 'Signing in...'
                    : 'Creating account...'
                  : mode === 'signin'
                    ? 'Sign in'
                    : 'Sign up'}
              </button>
            </form>
          </section>
        </div>
      </div>
    )
  }

  return <Dashboard onSignOut={handleSignOut} userEmail={currentEmail} />
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error'
}

export default App
