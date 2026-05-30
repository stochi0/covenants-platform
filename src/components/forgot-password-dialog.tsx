import { useState } from 'react'
import { useSignIn } from '@clerk/react/legacy'

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

type ResetStep = 'email' | 'code'

function clerkErrorMessage(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'errors' in error &&
    Array.isArray((error as { errors?: unknown }).errors)
  ) {
    const [firstError] = (error as { errors: Array<{ longMessage?: string; message?: string }> }).errors
    return firstError?.longMessage ?? firstError?.message ?? 'Something went wrong. Please try again.'
  }

  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

export function ForgotPasswordDialog() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<ResetStep>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setStep('email')
    setEmail('')
    setCode('')
    setPassword('')
    setMessage('')
    setError('')
    setIsSubmitting(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      resetForm()
    }
  }

  const sendResetCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isLoaded || !signIn) {
      return
    }

    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      await signIn.create({
        identifier: email,
        strategy: 'reset_password_email_code',
      })
      setStep('code')
      setMessage('We sent a password reset code to that email.')
    } catch (err) {
      setError(clerkErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isLoaded || !signIn) {
      return
    }

    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        setOpen(false)
        resetForm()
        return
      }

      setMessage('Password reset. Please sign in to finish authentication.')
    } catch (err) {
      setError(clerkErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="link" className="h-auto px-0 text-sm">
          Forgot password?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            Enter your email and Clerk will send you a reset code.
          </DialogDescription>
        </DialogHeader>

        {step === 'email' ? (
          <form className="grid gap-4" onSubmit={sendResetCode}>
            <Input
              autoComplete="email"
              autoFocus
              disabled={isSubmitting}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              required
              type="email"
              value={email}
            />
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={isSubmitting || !isLoaded}>
              {isSubmitting ? 'Sending...' : 'Send reset code'}
            </Button>
          </form>
        ) : (
          <form className="grid gap-4" onSubmit={resetPassword}>
            <Input
              autoComplete="one-time-code"
              autoFocus
              disabled={isSubmitting}
              inputMode="numeric"
              onChange={(event) => setCode(event.target.value)}
              placeholder="Reset code"
              required
              value={code}
            />
            <Input
              autoComplete="new-password"
              disabled={isSubmitting}
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="New password"
              required
              type="password"
              value={password}
            />
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="grid gap-2">
              <Button type="submit" disabled={isSubmitting || !isLoaded}>
                {isSubmitting ? 'Resetting...' : 'Reset password'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={isSubmitting}
                onClick={() => {
                  setStep('email')
                  setMessage('')
                  setError('')
                }}
              >
                Use a different email
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
