import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useSignUp } from '@clerk/react/legacy'
import { BriefcaseBusiness, Building2, Check, Globe2, Mail, Phone, UserRound } from 'lucide-react'
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

interface SignUpFormData {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
  phoneNumber: string
  companyName: string
  companyCountry: string
  designation: string
  department: string
  companyType: string
}

const initialFormData: SignUpFormData = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  phoneNumber: '',
  companyName: '',
  companyCountry: '',
  designation: '',
  department: '',
  companyType: '',
}

const e164PhonePattern = /^\+[1-9]\d{7,14}$/

function getClerkErrorMessage(error: unknown): string {
  if (
    error
    && typeof error === 'object'
    && 'errors' in error
    && Array.isArray((error as { errors?: unknown }).errors)
  ) {
    const [firstError] = (error as { errors: Array<{ longMessage?: string; message?: string }> }).errors
    return firstError?.longMessage ?? firstError?.message ?? 'Unable to create account.'
  }

  return error instanceof Error ? error.message : 'Unable to create account.'
}

type SetActiveFn = (params: { session: string }) => Promise<unknown>

function fieldLabel(value: ReactNode, label: string) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-foreground">
      <span>{label}</span>
      {value}
    </label>
  )
}

async function activateSession(setActive: SetActiveFn | undefined, sessionId: string | null) {
  if (setActive && sessionId) {
    await setActive({ session: sessionId })
  }
}

export function SignUpDialog() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'details' | 'verification'>('details')
  const [formData, setFormData] = useState<SignUpFormData>(initialFormData)
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field: keyof SignUpFormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const reset = () => {
    setStep('details')
    setFormData(initialFormData)
    setVerificationCode('')
    setError(null)
    setIsSubmitting(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) reset()
  }

  const validateDetails = (): string | null => {
    if (!formData.email.trim()) return 'Email is required.'
    if (!formData.username.trim()) return 'Username is required.'
    if (!formData.password) return 'Password is required.'
    if (!e164PhonePattern.test(formData.phoneNumber.trim())) {
      return 'Phone number must use strict country code format, for example +14155552671.'
    }
    if (!formData.companyName.trim()) return 'Company name is required.'
    if (!formData.companyCountry.trim()) return 'Company country/location is required.'
    return null
  }

  const handleDetailsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isLoaded || !signUp) return

    const validationError = validateDetails()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await signUp.create({
        emailAddress: formData.email.trim(),
        firstName: formData.firstName.trim() || undefined,
        lastName: formData.lastName.trim() || undefined,
        password: formData.password,
        username: formData.username.trim(),
        unsafeMetadata: {
          phoneNumber: formData.phoneNumber.trim(),
          companyName: formData.companyName.trim(),
          companyCountry: formData.companyCountry.trim(),
          designation: formData.designation.trim() || null,
          department: formData.department.trim() || null,
          companyType: formData.companyType.trim() || null,
        },
      })

      if (result.status === 'complete') {
        await activateSession(setActive, result.createdSessionId)
        setOpen(false)
        reset()
        return
      }

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setStep('verification')
    } catch (caughtError) {
      setError(getClerkErrorMessage(caughtError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerificationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isLoaded || !signUp) return

    if (!verificationCode.trim()) {
      setError('Enter the verification code sent to your email.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode.trim(),
      })

      if (result.status === 'complete') {
        await activateSession(setActive, result.createdSessionId)
        setOpen(false)
        reset()
        return
      }

      setError('Additional verification is required to finish creating your account.')
    } catch (caughtError) {
      setError(getClerkErrorMessage(caughtError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="w-full">Create account</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-1rem)] overflow-y-auto p-4 sm:max-w-2xl sm:p-6">
        <DialogHeader>
          <DialogTitle>Create account</DialogTitle>
          <DialogDescription>
            {step === 'details'
              ? 'Enter your account and company details.'
              : 'Check your email for the verification code.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'details' ? (
          <form className="grid gap-4" onSubmit={handleDetailsSubmit}>
            <div className="grid gap-3 sm:grid-cols-2">
              {fieldLabel(
                <Input
                  autoComplete="given-name"
                  onChange={(event) => updateField('firstName', event.target.value)}
                  placeholder="First name"
                  value={formData.firstName}
                />,
                'First name',
              )}
              {fieldLabel(
                <Input
                  autoComplete="family-name"
                  onChange={(event) => updateField('lastName', event.target.value)}
                  placeholder="Last name"
                  value={formData.lastName}
                />,
                'Last name',
              )}
              {fieldLabel(
                <div className="relative">
                  <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoComplete="username"
                    className="pl-9"
                    onChange={(event) => updateField('username', event.target.value)}
                    placeholder="Choose a username"
                    required
                    value={formData.username}
                  />
                </div>,
                'Username*',
              )}
              {fieldLabel(
                <Input
                  autoComplete="email"
                  inputMode="email"
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder="you@company.com"
                  required
                  type="email"
                  value={formData.email}
                />,
                'Email*',
              )}
              {fieldLabel(
                <Input
                  autoComplete="new-password"
                  minLength={8}
                  onChange={(event) => updateField('password', event.target.value)}
                  placeholder="At least 8 characters"
                  required
                  type="password"
                  value={formData.password}
                />,
                'Password*',
              )}
              {fieldLabel(
                <div className="relative">
                  <Phone className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoComplete="tel"
                    className="pl-9"
                    inputMode="tel"
                    onChange={(event) => updateField('phoneNumber', event.target.value)}
                    pattern="^\+[1-9]\d{7,14}$"
                    placeholder="+14155552671"
                    required
                    title="Use E.164 format: + followed by country code and number, digits only."
                    type="tel"
                    value={formData.phoneNumber}
                  />
                </div>,
                'Phone number*',
              )}
              {fieldLabel(
                <div className="relative">
                  <Building2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoComplete="organization"
                    className="pl-9"
                    onChange={(event) => updateField('companyName', event.target.value)}
                    placeholder="Company name"
                    required
                    value={formData.companyName}
                  />
                </div>,
                'Company name*',
              )}
              {fieldLabel(
                <div className="relative">
                  <Globe2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoComplete="country-name"
                    className="pl-9"
                    onChange={(event) => updateField('companyCountry', event.target.value)}
                    placeholder="Company country/location"
                    required
                    value={formData.companyCountry}
                  />
                </div>,
                'Company country/location*',
              )}
              {fieldLabel(
                <div className="relative">
                  <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoComplete="organization-title"
                    className="pl-9"
                    onChange={(event) => updateField('designation', event.target.value)}
                    placeholder="Designation"
                    value={formData.designation}
                  />
                </div>,
                'Designation',
              )}
              {fieldLabel(
                <div className="relative">
                  <BriefcaseBusiness className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    onChange={(event) => updateField('department', event.target.value)}
                    placeholder="Department"
                    value={formData.department}
                  />
                </div>,
                'Department',
              )}
              {fieldLabel(
                <div className="relative">
                  <Building2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    onChange={(event) => updateField('companyType', event.target.value)}
                    placeholder="Manufacturer, distributor, lab..."
                    value={formData.companyType}
                  />
                </div>,
                'Type of company',
              )}
            </div>

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

            <Button type="submit" disabled={!isLoaded || isSubmitting} className="h-11 w-full sm:h-9">
              {isSubmitting ? 'Creating account...' : 'Continue'}
            </Button>
          </form>
        ) : (
          <form className="grid gap-4" onSubmit={handleVerificationSubmit}>
            {fieldLabel(
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoComplete="one-time-code"
                  className="pl-9"
                  inputMode="numeric"
                  onChange={(event) => setVerificationCode(event.target.value)}
                  placeholder="Verification code"
                  required
                  value={verificationCode}
                />
              </div>,
              'Email verification code*',
            )}

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

            <div className="grid gap-2 sm:grid-cols-[auto_1fr]">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => {
                  setStep('details')
                  setError(null)
                }}
              >
                Back
              </Button>
              <Button type="submit" disabled={!isLoaded || isSubmitting} className="h-11 sm:h-9">
                <Check className="size-4" />
                {isSubmitting ? 'Verifying...' : 'Create account'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
