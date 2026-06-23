import { useState } from 'react'
import type { FormEvent } from 'react'
import { useSignIn } from '@clerk/react/legacy'
import { ArrowLeft, KeyRound, LogIn, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

type SetActiveFn = (params: { session: string }) => Promise<unknown>
type AuthStep = 'sign-in' | 'reset-request' | 'reset-code'

function getClerkErrorMessage(error: unknown): string {
  if (
    error
    && typeof error === 'object'
    && 'errors' in error
    && Array.isArray((error as { errors?: unknown }).errors)
  ) {
    const [firstError] = (error as { errors: Array<{ longMessage?: string; message?: string }> }).errors
    return firstError?.longMessage ?? firstError?.message ?? 'Unable to sign in.'
  }

  return error instanceof Error ? error.message : 'Unable to sign in.'
}

async function activateSession(setActive: SetActiveFn | undefined, sessionId: string | null) {
  if (setActive && sessionId) {
    await setActive({ session: sessionId })
  }
}

export function SignInDialog() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<AuthStep>('sign-in')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reset = () => {
    setStep('sign-in')
    setIdentifier('')
    setPassword('')
    setResetCode('')
    setResetPassword('')
    setMessage(null)
    setError(null)
    setIsSubmitting(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) reset()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isLoaded || !signIn) return

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await signIn.create({
        identifier: identifier.trim(),
        password,
        strategy: 'password',
        signUpIfMissing: false,
      })

      if (result.status === 'complete') {
        await activateSession(setActive, result.createdSessionId)
        setOpen(false)
        reset()
        return
      }

      setError('Additional verification is required to sign in.')
    } catch (caughtError) {
      setError(getClerkErrorMessage(caughtError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isLoaded || !signIn) return

    setIsSubmitting(true)
    setError(null)
    setMessage(null)

    try {
      await signIn.create({
        identifier: identifier.trim(),
        strategy: 'reset_password_email_code',
        signUpIfMissing: false,
      })
      setStep('reset-code')
      setMessage('We sent a reset code to the email on your Clerk account.')
    } catch (caughtError) {
      setError(getClerkErrorMessage(caughtError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isLoaded || !signIn) return

    setIsSubmitting(true)
    setError(null)
    setMessage(null)

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: resetCode.trim(),
        password: resetPassword,
      })

      if (result.status === 'complete') {
        await activateSession(setActive, result.createdSessionId)
        setOpen(false)
        reset()
        return
      }

      setMessage('Password reset. Please sign in to finish authentication.')
      setStep('sign-in')
      setPassword('')
    } catch (caughtError) {
      setError(getClerkErrorMessage(caughtError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const goToReset = () => {
    setStep('reset-request')
    setPassword('')
    setResetCode('')
    setResetPassword('')
    setError(null)
    setMessage(null)
  }

  const goToSignIn = () => {
    setStep('sign-in')
    setError(null)
    setMessage(null)
  }

  const title = step === 'sign-in' ? 'Sign in' : 'Reset password'
  const description = step === 'sign-in'
    ? 'Use your email or username to continue.'
    : step === 'reset-request'
    ? 'Enter your email or username and Clerk will send a reset code.'
    : 'Enter the reset code and choose a new password.'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" className="w-full">Sign in</Button>
      </DialogTrigger>
      <DialogContent className="auth-dialog-content max-h-[calc(100dvh-1rem)] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {step === 'sign-in' && (
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-1.5 text-sm font-medium text-foreground">
            <span>Email or username</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoComplete="username"
                className="pl-9"
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="you@company.com or username"
                required
                value={identifier}
              />
            </div>
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-foreground">
            <span>Password</span>
            <Input
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
              type="password"
              value={password}
            />
          </label>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="link"
              className="h-auto px-0 text-sm"
              onClick={goToReset}
            >
              Forgot password?
            </Button>
          </div>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          <Button type="submit" disabled={!isLoaded || isSubmitting} className="h-11 w-full sm:h-9">
            <LogIn className="size-4" />
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
        )}

        {step === 'reset-request' && (
          <form className="grid gap-4" onSubmit={handleResetRequest}>
            <label className="grid gap-1.5 text-sm font-medium text-foreground">
              <span>Email or username</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoComplete="username"
                  className="pl-9"
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="you@company.com or username"
                  required
                  value={identifier}
                />
              </div>
            </label>

            {message && <p className="text-sm font-medium text-muted-foreground">{message}</p>}
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

            <div className="grid gap-2">
              <Button type="submit" disabled={!isLoaded || isSubmitting} className="h-11 w-full sm:h-9">
                <KeyRound className="size-4" />
                {isSubmitting ? 'Sending code...' : 'Send reset code'}
              </Button>
              <Button type="button" variant="ghost" disabled={isSubmitting} onClick={goToSignIn}>
                <ArrowLeft className="size-4" />
                Back to sign in
              </Button>
            </div>
          </form>
        )}

        {step === 'reset-code' && (
          <form className="grid gap-4" onSubmit={handleResetSubmit}>
            <label className="grid gap-1.5 text-sm font-medium text-foreground">
              <span>Reset code</span>
              <Input
                autoComplete="one-time-code"
                inputMode="numeric"
                onChange={(event) => setResetCode(event.target.value)}
                placeholder="Enter reset code"
                required
                value={resetCode}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-foreground">
              <span>New password</span>
              <Input
                autoComplete="new-password"
                minLength={8}
                onChange={(event) => setResetPassword(event.target.value)}
                placeholder="At least 8 characters"
                required
                type="password"
                value={resetPassword}
              />
            </label>

            {message && <p className="text-sm font-medium text-muted-foreground">{message}</p>}
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

            <div className="grid gap-2">
              <Button type="submit" disabled={!isLoaded || isSubmitting} className="h-11 w-full sm:h-9">
                {isSubmitting ? 'Resetting password...' : 'Reset password'}
              </Button>
              <Button type="button" variant="ghost" disabled={isSubmitting} onClick={goToReset}>
                Use a different account
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
