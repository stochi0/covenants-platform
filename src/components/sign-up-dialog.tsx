import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useSignUp } from '@clerk/react/legacy'
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  Globe2,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
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
type SignUpStep = 'personal' | 'access' | 'company' | 'verification'

const signUpSteps: Array<{
  id: SignUpStep
  label: string
  eyebrow: string
  title: string
  description: string
}> = [
  {
    id: 'personal',
    label: 'Profile',
    eyebrow: 'Start with you',
    title: 'Tell us who is joining.',
    description: 'A few identity details help your workspace feel personal from the first visit.',
  },
  {
    id: 'access',
    label: 'Access',
    eyebrow: 'Secure access',
    title: 'Set up your sign-in.',
    description: 'Use your work email and a phone number with country code so your account is easy to verify.',
  },
  {
    id: 'company',
    label: 'Company',
    eyebrow: 'Business context',
    title: 'Shape your company profile.',
    description: 'This helps Capillia route requests and show the right manufacturing context.',
  },
  {
    id: 'verification',
    label: 'Verify',
    eyebrow: 'Final check',
    title: 'Enter the code we emailed you.',
    description: 'Once verified, we will launch your Capillia workspace.',
  },
]

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

function fieldLabel(value: ReactNode, label: string, hint?: string) {
  return (
    <label className="grid gap-2 text-sm font-medium text-foreground">
      <span className="flex items-center justify-between gap-3">
        <span>{label}</span>
        {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
      </span>
      {value}
    </label>
  )
}

async function activateSession(setActive: SetActiveFn | undefined, sessionId: string | null) {
  if (setActive && sessionId) {
    await setActive({ session: sessionId })
  }
}

function ProgressHeader({ currentStep }: { currentStep: SignUpStep }) {
  const currentIndex = signUpSteps.findIndex((item) => item.id === currentStep)

  return (
    <div className="rounded-lg border border-[#d7ece8] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(237,248,246,0.86))] p-3 shadow-[0_20px_60px_-44px_rgba(15,118,110,0.55)]">
      <div className="grid grid-cols-4 gap-2">
        {signUpSteps.map((item, index) => {
          const isComplete = index < currentIndex
          const isActive = index === currentIndex

          return (
            <div key={item.id} className="min-w-0">
              <div
                className={`mb-2 h-1.5 rounded-full transition-colors ${
                  isComplete || isActive ? 'bg-primary' : 'bg-muted'
                }`}
              />
              <div className="flex min-w-0 items-center gap-1.5">
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                    isComplete
                      ? 'bg-primary text-primary-foreground'
                      : isActive
                        ? 'bg-primary/10 text-primary ring-1 ring-primary/25'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isComplete ? <Check className="size-3" /> : index + 1}
                </span>
                <span
                  className={`truncate text-xs font-medium ${
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function SignUpDialog() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<SignUpStep>('personal')
  const [formData, setFormData] = useState<SignUpFormData>(initialFormData)
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const currentStepIndex = signUpSteps.findIndex((item) => item.id === step)
  const currentStep = signUpSteps[currentStepIndex] ?? signUpSteps[0]
  const isFirstStep = currentStepIndex === 0
  const isCompanyStep = step === 'company'

  const updateField = (field: keyof SignUpFormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const reset = () => {
    setStep('personal')
    setFormData(initialFormData)
    setVerificationCode('')
    setError(null)
    setIsSubmitting(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) reset()
  }

  const validateCurrentStep = (): string | null => {
    if (step === 'personal') {
      if (!formData.username.trim()) return 'Choose a username to continue.'
      return null
    }

    if (step === 'access') {
      if (!formData.email.trim()) return 'Email is required.'
      if (!formData.password) return 'Password is required.'
      if (!e164PhonePattern.test(formData.phoneNumber.trim())) {
        return 'Phone number must use strict country code format, for example +14155552671.'
      }
      return null
    }

    if (step === 'company') {
      if (!formData.companyName.trim()) return 'Company name is required.'
      if (!formData.companyCountry.trim()) return 'Company country/location is required.'
    }

    return null
  }

  const goBack = () => {
    if (isSubmitting || isFirstStep) return
    setError(null)
    setStep(signUpSteps[currentStepIndex - 1].id)
  }

  const goForward = () => {
    const validationError = validateCurrentStep()
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setStep(signUpSteps[currentStepIndex + 1].id)
  }

  const validateDetails = (): string | null => {
    if (!formData.username.trim()) return 'Username is required.'
    if (!formData.email.trim()) return 'Email is required.'
    if (!formData.password) return 'Password is required.'
    if (!e164PhonePattern.test(formData.phoneNumber.trim())) {
      return 'Phone number must use strict country code format, for example +14155552671.'
    }
    if (!formData.companyName.trim()) return 'Company name is required.'
    if (!formData.companyCountry.trim()) return 'Company country/location is required.'
    return null
  }

  const handleWizardSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isCompanyStep) {
      goForward()
      return
    }

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
      <DialogContent className="auth-signup-dialog-content max-h-[calc(100dvh-1rem)] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="gap-4 text-left">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_18px_45px_-24px_rgba(15,118,110,0.95)]">
              {step === 'verification' ? <ShieldCheck className="size-5" /> : <Building2 className="size-5" />}
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                {currentStep.eyebrow}
              </p>
              <DialogTitle className="text-xl leading-7">{currentStep.title}</DialogTitle>
              <DialogDescription className="leading-6">{currentStep.description}</DialogDescription>
            </div>
          </div>
          <ProgressHeader currentStep={step} />
        </DialogHeader>

        {step !== 'verification' ? (
          <form className="grid gap-5" onSubmit={handleWizardSubmit}>
            {step === 'personal' && (
              <div className="grid gap-3 sm:grid-cols-2">
                {fieldLabel(
                  <Input
                    autoComplete="given-name"
                    className="h-11 sm:h-10"
                    onChange={(event) => updateField('firstName', event.target.value)}
                    placeholder="First name"
                    value={formData.firstName}
                  />,
                  'First name',
                  'Optional',
                )}
                {fieldLabel(
                  <Input
                    autoComplete="family-name"
                    className="h-11 sm:h-10"
                    onChange={(event) => updateField('lastName', event.target.value)}
                    placeholder="Last name"
                    value={formData.lastName}
                  />,
                  'Last name',
                  'Optional',
                )}
                <div className="sm:col-span-2">
                  {fieldLabel(
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        autoComplete="username"
                        className="h-11 pl-9 sm:h-10"
                        onChange={(event) => updateField('username', event.target.value)}
                        placeholder="Choose a username"
                        required
                        value={formData.username}
                      />
                    </div>,
                    'Username*',
                  )}
                </div>
              </div>
            )}

            {step === 'access' && (
              <div className="grid gap-3">
                {fieldLabel(
                  <div className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      autoComplete="email"
                      className="h-11 pl-9 sm:h-10"
                      inputMode="email"
                      onChange={(event) => updateField('email', event.target.value)}
                      placeholder="you@company.com"
                      required
                      type="email"
                      value={formData.email}
                    />
                  </div>,
                  'Work email*',
                )}
                {fieldLabel(
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      autoComplete="new-password"
                      className="h-11 pl-9 sm:h-10"
                      minLength={8}
                      onChange={(event) => updateField('password', event.target.value)}
                      placeholder="At least 8 characters"
                      required
                      type="password"
                      value={formData.password}
                    />
                  </div>,
                  'Password*',
                )}
                {fieldLabel(
                  <div className="relative">
                    <Phone className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      autoComplete="tel"
                      className="h-11 pl-9 sm:h-10"
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
                  'Country code required',
                )}
              </div>
            )}

            {step === 'company' && (
              <div className="grid gap-3 sm:grid-cols-2">
                {fieldLabel(
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      autoComplete="organization"
                      className="h-11 pl-9 sm:h-10"
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
                      className="h-11 pl-9 sm:h-10"
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
                      className="h-11 pl-9 sm:h-10"
                      onChange={(event) => updateField('designation', event.target.value)}
                      placeholder="Designation"
                      value={formData.designation}
                    />
                  </div>,
                  'Designation',
                  'Optional',
                )}
                {fieldLabel(
                  <div className="relative">
                    <BriefcaseBusiness className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="h-11 pl-9 sm:h-10"
                      onChange={(event) => updateField('department', event.target.value)}
                      placeholder="Department"
                      value={formData.department}
                    />
                  </div>,
                  'Department',
                  'Optional',
                )}
                {fieldLabel(
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="h-11 pl-9 sm:h-10"
                      onChange={(event) => updateField('companyType', event.target.value)}
                      placeholder="Manufacturer, distributor, lab..."
                      value={formData.companyType}
                    />
                  </div>,
                  'Type of company',
                  'Optional',
                )}
              </div>
            )}

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

            <div className="grid gap-2 sm:grid-cols-[auto_1fr]">
              <Button
                type="button"
                variant="outline"
                disabled={isFirstStep || isSubmitting}
                onClick={goBack}
                className="h-11 sm:h-10"
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <Button type="submit" disabled={!isLoaded || isSubmitting} className="h-11 sm:h-10">
                {isSubmitting ? (
                  'Creating account...'
                ) : isCompanyStep ? (
                  <>
                    <ShieldCheck className="size-4" />
                    Send verification code
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <form className="grid gap-5" onSubmit={handleVerificationSubmit}>
            <div className="rounded-lg border border-primary/15 bg-primary/5 px-4 py-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-sm leading-6 text-muted-foreground">
                  Verification was sent to {formData.email.trim() || 'your email'}. Keep this window open and paste the code here.
                </p>
              </div>
            </div>
            {fieldLabel(
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoComplete="one-time-code"
                  className="h-11 pl-9 text-center tracking-[0.3em] sm:h-10"
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
                  setStep('company')
                  setError(null)
                }}
                className="h-11 sm:h-10"
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <Button type="submit" disabled={!isLoaded || isSubmitting} className="h-11 sm:h-10">
                <Check className="size-4" />
                {isSubmitting ? 'Verifying...' : 'Launch workspace'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
