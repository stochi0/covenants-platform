import { useEffect, useState } from 'react'
import { Show, useAuth, useUser } from '@clerk/react'
import { Building2, RefreshCw, ShieldCheck } from 'lucide-react'
import { Dashboard } from '@/components/Dashboard'
import { SignInDialog } from '@/components/sign-in-dialog'
import { SignUpDialog } from '@/components/sign-up-dialog'
import { Button } from '@/components/ui/button'
import { apiJson } from '@/lib/api'

function SignedInApp() {
  const { getToken } = useAuth()
  const { user, isLoaded } = useUser()
  const [syncState, setSyncState] = useState<'syncing' | 'ready' | 'error'>('syncing')
  const [syncError, setSyncError] = useState<string | null>(null)
  const [syncAttempt, setSyncAttempt] = useState(0)

  useEffect(() => {
    if (!isLoaded || !user) return

    let cancelled = false

    apiJson<{ id: string }>(getToken, '/api/users/sync', {
      method: 'POST',
      body: JSON.stringify({
        email: user.primaryEmailAddress?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        imageUrl: user.imageUrl,
        emailVerified: user.primaryEmailAddress?.verification?.status === 'verified',
        unsafeMetadata: user.unsafeMetadata,
      }),
    })
      .then(() => {
        if (!cancelled) setSyncState('ready')
      })
      .catch((error) => {
        console.error('User sync failed:', error)
        if (!cancelled) {
          setSyncError(error instanceof Error ? error.message : 'Unknown error')
          setSyncState('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [getToken, isLoaded, syncAttempt, user])

  if (syncState === 'ready') return <Dashboard />

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_24%),linear-gradient(180deg,#f4fbfa_0%,#f8faf9_48%,#f3f8f7_100%)]" />
      <div className="relative w-full max-w-md rounded-[1.5rem] border border-white/80 bg-white/90 p-6 text-center shadow-[0_40px_110px_-70px_rgba(15,118,110,0.75)] backdrop-blur-xl sm:p-8">
        <div className="mx-auto flex size-14 items-center justify-center rounded-[1.2rem] bg-primary text-primary-foreground shadow-[0_22px_55px_-28px_rgba(15,118,110,0.95)]">
          {syncState === 'error' ? <ShieldCheck className="size-6" /> : <Building2 className="size-6" />}
        </div>
        <div className="mt-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {syncState === 'error' ? 'Workspace paused' : 'Launching workspace'}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {syncState === 'error' ? 'We could not finish setup.' : 'Preparing Capillia for you.'}
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            {syncState === 'error'
              ? 'Your account was created, but the workspace sync needs another try.'
              : 'We are syncing your profile, company context, and dashboard access.'}
          </p>
        </div>
        {syncState !== 'error' && (
          <div className="mt-6 space-y-3">
            <div className="mx-auto size-10 animate-spin rounded-full border-2 border-primary/15 border-t-primary" />
            <div className="h-1.5 overflow-hidden rounded-full bg-primary/10">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-primary" />
            </div>
          </div>
        )}
        {syncError && (
          <p className="mt-4 rounded-lg border border-destructive/15 bg-destructive/5 px-3 py-2 text-sm text-muted-foreground">
            {syncError}
          </p>
        )}
        {syncState === 'error' && (
          <Button
            type="button"
            variant="outline"
            className="mt-5 h-11 w-full border-primary/20 bg-white hover:bg-primary/5"
            onClick={() => {
              setSyncState('syncing')
              setSyncError(null)
              setSyncAttempt((attempt) => attempt + 1)
            }}
          >
            <RefreshCw className="size-4" />
            Retry workspace sync
          </Button>
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <>
      <Show when="signed-out">
        <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-lg">
            <div className="space-y-2">
              <p className="text-2xl font-semibold tracking-tight">Capillia</p>
              <p className="text-sm text-muted-foreground">
                Sign in with your email to continue.
              </p>
            </div>
            <div className="mt-6 grid gap-3">
              <SignInDialog />
              <SignUpDialog />
            </div>
          </div>
        </div>
      </Show>
      <Show when="signed-in">
        <SignedInApp />
      </Show>
    </>
  )
}

export default App
