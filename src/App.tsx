import { Show, SignInButton, SignUpButton } from '@clerk/react'
import { Dashboard } from '@/components/Dashboard'
import { ForgotPasswordDialog } from '@/components/forgot-password-dialog'
import { Button } from '@/components/ui/button'

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
              <SignInButton mode="modal">
                <Button type="button" className="w-full">Sign in</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button type="button" variant="outline" className="w-full">Create account</Button>
              </SignUpButton>
              <div className="flex justify-center">
                <ForgotPasswordDialog />
              </div>
            </div>
          </div>
        </div>
      </Show>
      <Show when="signed-in">
        <Dashboard />
      </Show>
    </>
  )
}

export default App
