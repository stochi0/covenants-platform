import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useSignIn } from '@clerk/react/legacy'
import { ArrowLeft, CheckCircle2, KeyRound, LockKeyhole, LogIn, Mail } from 'lucide-react'
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

const stepCopy: Record<AuthStep, { title: string; description: string }> = {
  'sign-in': {
    title: 'Sign in',
    description: 'Use your Capillia account credentials to continue.',
  },
  'reset-request': {
    title: 'Reset password',
    description: 'Enter your email and we will send a reset code.',
  },
  'reset-code': {
    title: 'Choose a new password',
    description: 'Enter the code from your email and set a new password.',
  },
}

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

function Field({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-foreground">
      <span>{label}</span>
      {children}
    </label>
  )
}

function StatusMessage({
  message,
  tone,
}: {
  message: string | null
  tone: 'error' | 'success'
}) {
  if (!message) return null

  return (
    <div
      className={`rounded-lg border px-3 py-2 text-sm leading-6 ${
        tone === 'error'
          ? 'border-destructive/25 bg-destructive/5 text-destructive'
          : 'border-primary/20 bg-primary/5 text-muted-foreground'
      }`}
    >
      {message}
    </div>
  )
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
      setMessage(`We sent a reset code to ${identifier.trim()}.`)
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

  const copy = stepCopy[step]
  const isResetFlow = step !== 'sign-in'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" className="w-full">Sign in</Button>
      </DialogTrigger>
      <DialogContent className="auth-dialog-content auth-flow-content overflow-hidden p-0">
        <DialogHeader className="auth-flow-header text-left">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
            {isResetFlow ? <KeyRound className="size-5" /> : <LogIn className="size-5" />}
          </div>
          <div className="min-w-0 space-y-1">
            <DialogTitle className="text-2xl leading-8 tracking-tight">{copy.title}</DialogTitle>
            <DialogDescription className="text-base leading-7">{copy.description}</DialogDescription>
          </div>
        </DialogHeader>

        {step === 'sign-in' && (
          <form className="auth-form-shell" onSubmit={handleSubmit}>
            <div className="auth-flow-body grid gap-4 overflow-y-auto">
              <Field label="Email or username">
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoComplete="username"
                    className="h-11 pl-9"
                    onChange={(event) => setIdentifier(event.target.value)}
                    placeholder="you@company.com or username"
                    required
                    value={identifier}
                  />
                </div>
              </Field>

              <Field label="Password">
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoComplete="current-password"
                    className="h-11 pl-9"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                    required
                    type="password"
                    value={password}
                  />
                </div>
              </Field>

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

              <StatusMessage message={message} tone="success" />
              <StatusMessage message={error} tone="error" />
            </div>

            <div className="auth-flow-actions">
              <Button type="submit" disabled={!isLoaded || isSubmitting} className="h-12 w-full">
                <LogIn className="size-4" />
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>
        )}

        {step === 'reset-request' && (
          <form className="auth-form-shell" onSubmit={handleResetRequest}>
            <div className="auth-flow-body grid gap-4 overflow-y-auto">
              <Field label="Email">
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoComplete="email"
                    className="h-11 pl-9"
                    onChange={(event) => setIdentifier(event.target.value)}
                    placeholder="you@company.com"
                    required
                    value={identifier}
                  />
                </div>
              </Field>

              <StatusMessage message={message} tone="success" />
              <StatusMessage message={error} tone="error" />
            </div>

            <div className="auth-flow-actions grid gap-2">
              <Button type="submit" disabled={!isLoaded || isSubmitting} className="h-12 w-full">
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
          <form className="auth-form-shell" onSubmit={handleResetSubmit}>
            <div className="auth-flow-body grid gap-4 overflow-y-auto">
              <StatusMessage
                message={message ?? 'Check your inbox for the reset code before choosing a new password.'}
                tone="success"
              />

              <Field label="Reset code">
                <Input
                  autoComplete="one-time-code"
                  className="h-11"
                  inputMode="numeric"
                  onChange={(event) => setResetCode(event.target.value)}
                  placeholder="Enter reset code"
                  required
                  value={resetCode}
                />
              </Field>

              <Field label="New password">
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoComplete="new-password"
                    className="h-11 pl-9"
                    minLength={8}
                    onChange={(event) => setResetPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    required
                    type="password"
                    value={resetPassword}
                  />
                </div>
              </Field>

              <StatusMessage message={error} tone="error" />
            </div>

            <div className="auth-flow-actions grid gap-2">
              <Button type="submit" disabled={!isLoaded || isSubmitting} className="h-12 w-full">
                <CheckCircle2 className="size-4" />
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
