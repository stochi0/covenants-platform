import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth, useUser } from '@clerk/react'
import {
  AtSign,
  Check,
  CheckCircle2,
  IdCard,
  LockKeyhole,
  Mail,
  RotateCcw,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { apiJson } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const usernamePattern = /^[a-zA-Z0-9_-]+$/

function getErrorMessage(error: unknown) {
  if (
    error
    && typeof error === 'object'
    && 'errors' in error
    && Array.isArray((error as { errors?: unknown }).errors)
  ) {
    const [firstError] = (error as { errors: Array<{ longMessage?: string; message?: string }> }).errors
    return firstError?.longMessage ?? firstError?.message ?? 'Unable to update your profile.'
  }

  return error instanceof Error ? error.message : 'Unable to update your profile.'
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { getToken } = useAuth()
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress ?? ''
  const isEmailVerified = user?.primaryEmailAddress?.verification?.status === 'verified'
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!open || !user) return
    setFirstName(user.firstName ?? '')
    setLastName(user.lastName ?? '')
    setUsername(user.username ?? '')
    setError(null)
    setSaved(false)
  }, [open, user])

  const initials = useMemo(() => {
    const value = [firstName, lastName]
      .filter(Boolean)
      .map((part) => part.trim().charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase()

    return value || email.charAt(0).toUpperCase() || 'U'
  }, [email, firstName, lastName])

  const visibleUsername = username.trim() || email
  const hasCustomUsername = Boolean(username.trim())
  const hasChanges = Boolean(user && (
    firstName.trim() !== (user.firstName ?? '')
    || lastName.trim() !== (user.lastName ?? '')
    || username.trim() !== (user.username ?? '')
  ))

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user || isSaving) return

    const nextFirstName = firstName.trim()
    const nextLastName = lastName.trim()
    const nextUsername = username.trim()

    if (!nextFirstName || !nextLastName) {
      setError('First and last name are required.')
      return
    }

    if (nextUsername && (nextUsername.length < 4 || nextUsername.length > 64)) {
      setError('Custom usernames must be between 4 and 64 characters.')
      return
    }

    if (nextUsername && !usernamePattern.test(nextUsername)) {
      setError('Use only letters, numbers, underscores, and hyphens in your username.')
      return
    }

    setIsSaving(true)
    setError(null)
    setSaved(false)

    try {
      const updatedUser = await user.update({
        firstName: nextFirstName,
        lastName: nextLastName,
        username: nextUsername || null,
      })

      await apiJson<{ id: string }>(getToken, '/api/users/sync', {
        method: 'POST',
        body: JSON.stringify({
          email: updatedUser.primaryEmailAddress?.emailAddress,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          username: updatedUser.username,
          imageUrl: updatedUser.imageUrl,
          emailVerified: updatedUser.primaryEmailAddress?.verification?.status === 'verified',
          unsafeMetadata: updatedUser.unsafeMetadata,
        }),
      })

      setFirstName(updatedUser.firstName ?? '')
      setLastName(updatedUser.lastName ?? '')
      setUsername(updatedUser.username ?? '')
      setSaved(true)
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl gap-0 overflow-hidden rounded-[1.5rem] border-[#d7ece8] bg-white p-0 shadow-[0_32px_100px_-45px_rgba(15,118,110,0.65)]">
        <DialogHeader className="border-b border-[#d7ece8] bg-[linear-gradient(135deg,rgba(240,253,250,0.96),rgba(255,255,255,0.98))] px-5 py-5 text-left sm:px-7 sm:py-6">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-[0_16px_35px_-20px_rgba(15,118,110,0.9)]">
              {initials}
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                <Sparkles className="size-3.5" />
                Your Capillia identity
              </p>
              <DialogTitle className="text-2xl leading-8 tracking-tight">Edit profile</DialogTitle>
              <DialogDescription className="mt-1 leading-6">
                Keep your account recognizable to your team and workspace.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="min-h-0 overflow-y-auto">
          <div className="grid gap-6 p-5 sm:p-7">
            <section className="grid gap-4">
              <div className="flex items-center gap-2">
                <IdCard className="size-4 text-primary" />
                <h3 className="text-sm font-semibold">Personal details</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">
                  First name
                  <Input
                    autoComplete="given-name"
                    className="h-11 rounded-xl bg-white"
                    value={firstName}
                    onChange={(event) => {
                      setFirstName(event.target.value)
                      setSaved(false)
                    }}
                    required
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Last name
                  <Input
                    autoComplete="family-name"
                    className="h-11 rounded-xl bg-white"
                    value={lastName}
                    onChange={(event) => {
                      setLastName(event.target.value)
                      setSaved(false)
                    }}
                    required
                  />
                </label>
              </div>
            </section>

            <section className="rounded-[1.25rem] border border-[#d7ece8] bg-[linear-gradient(145deg,rgba(240,253,250,0.72),rgba(255,255,255,0.96))] p-4 sm:p-5">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <AtSign className="size-4 text-primary" />
                      <h3 className="text-sm font-semibold">Username</h3>
                    </div>
                    <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                      Your email is used by default. Add a custom username only if you want one.
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    hasCustomUsername
                      ? 'bg-primary/10 text-primary'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {hasCustomUsername ? 'Custom' : 'Email default'}
                  </span>
                </div>

                <label className="grid gap-2 text-sm font-medium">
                  Custom username <span className="sr-only">(optional)</span>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      autoComplete="username"
                      className="h-11 rounded-xl bg-white pl-10 pr-24"
                      maxLength={64}
                      placeholder="e.g. ayush_b"
                      value={username}
                      onChange={(event) => {
                        setUsername(event.target.value)
                        setError(null)
                        setSaved(false)
                      }}
                    />
                    {hasCustomUsername && (
                      <button
                        type="button"
                        onClick={() => {
                          setUsername('')
                          setError(null)
                          setSaved(false)
                        }}
                        className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
                      >
                        <RotateCcw className="size-3" />
                        Reset
                      </button>
                    )}
                  </div>
                </label>

                <div className="rounded-xl border border-primary/10 bg-white/80 px-3.5 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                    Shown as
                  </p>
                  <p className="mt-1 break-all text-sm font-semibold text-foreground">{visibleUsername}</p>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  Custom usernames use 4–64 letters, numbers, underscores, or hyphens. You can sign in with either your email or custom username.
                </p>
              </div>
            </section>

            <section className="grid gap-3">
              <div className="flex items-center gap-2">
                <LockKeyhole className="size-4 text-primary" />
                <h3 className="text-sm font-semibold">Account access</h3>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-slate-50/70 px-3.5 py-3">
                <Mail className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Email</p>
                  <p className="truncate text-sm font-medium">{email}</p>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${
                  isEmailVerified
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {isEmailVerified && <Check className="size-3" />}
                  {isEmailVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
            </section>

            {error && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3.5 py-3 text-sm leading-6 text-destructive">
                {error}
              </div>
            )}
            {saved && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm font-medium text-emerald-800">
                <CheckCircle2 className="size-4" />
                Your profile is up to date.
              </div>
            )}
          </div>

          <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-[#d7ece8] bg-white/95 px-5 py-4 backdrop-blur sm:flex-row sm:justify-end sm:px-7">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-11 rounded-xl px-5"
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? 'Saving changes…' : 'Save profile'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
