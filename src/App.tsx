import { useEffect, useState } from 'react'
import { Show, SignInButton, useAuth, useUser } from '@clerk/react'
import { Dashboard } from '@/components/Dashboard'
import { ForgotPasswordDialog } from '@/components/forgot-password-dialog'
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 text-center shadow-lg">
        <p className="text-sm font-medium">
          {syncState === 'error' ? 'Unable to sync account.' : 'Preparing account...'}
        </p>
        {syncError && (
          <p className="mt-2 text-sm text-muted-foreground">
            {syncError}
          </p>
        )}
        {syncState === 'error' && (
          <Button
            type="button"
            variant="outline"
            className="mt-4 w-full"
            onClick={() => {
              setSyncState('syncing')
              setSyncError(null)
              setSyncAttempt((attempt) => attempt + 1)
            }}
          >
            Retry
          </Button>
        )}
      </div>
    </div>
  )
}

function App() {
  const authRedirectUrl = '/'

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
              <SignInButton
                mode="modal"
                fallbackRedirectUrl={authRedirectUrl}
                signUpFallbackRedirectUrl={authRedirectUrl}
              >
                <Button type="button" className="w-full">Sign in</Button>
              </SignInButton>
              <SignUpDialog />
              <div className="flex justify-center">
                <ForgotPasswordDialog />
              </div>
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
