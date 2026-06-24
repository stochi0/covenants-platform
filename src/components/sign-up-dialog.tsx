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
  email: string
  password: string
  phoneCountryCode: string
  phoneNationalNumber: string
  companyName: string
  companyCountry: string
  designation: string
  department: string
  companyType: string
}

const initialFormData: SignUpFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phoneCountryCode: '+91',
  phoneNationalNumber: '',
  companyName: '',
  companyCountry: '',
  designation: '',
  department: '',
  companyType: '',
}

const countryCodePattern = /^\+[1-9]\d{0,3}$/
const nationalPhonePattern = /^\d{4,14}$/
type SignUpStep = 'profile' | 'access' | 'company' | 'verification'

const signUpSteps: Array<{
  id: SignUpStep
  label: string
  title: string
  description: string
}> = [
  {
    id: 'profile',
    label: 'Profile',
    title: 'Create your profile',
    description: 'Tell us who will manage this Capillia workspace.',
  },
  {
    id: 'access',
    label: 'Access',
    title: 'Set up secure access',
    description: 'Use your work email, password, and phone number.',
  },
  {
    id: 'company',
    label: 'Company',
    title: 'Add company details',
    description: 'This helps Capillia tailor your workspace context.',
  },
  {
    id: 'verification',
    label: 'Verify',
    title: 'Verify your email',
    description: 'Enter the code we emailed to activate your account.',
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

type ClerkSignUpState = {
  missingFields: string[]
  requiredFields: string[]
  status: string | null
  unverifiedFields: string[]
}

const clerkFieldLabels: Record<string, string> = {
  email_address: 'email address',
  emailAddress: 'email address',
  first_name: 'first name',
  firstName: 'first name',
  last_name: 'last name',
  lastName: 'last name',
  legal_accepted: 'terms acceptance',
  legalAccepted: 'terms acceptance',
  password: 'password',
  phone_number: 'phone number',
  phoneNumber: 'phone number',
  username: 'username',
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function getClerkSignUpState(result: unknown): ClerkSignUpState {
  const resource = result && typeof result === 'object'
    ? result as Record<string, unknown>
    : {}

  return {
    missingFields: readStringArray(resource.missingFields),
    requiredFields: readStringArray(resource.requiredFields),
    status: typeof resource.status === 'string' ? resource.status : null,
    unverifiedFields: readStringArray(resource.unverifiedFields),
  }
}

function hasClerkField(fields: string[], fieldName: string): boolean {
  const normalizedFieldName = fieldName.replace(/[^a-z0-9]/gi, '').toLowerCase()
  return fields.some((field) => field.replace(/[^a-z0-9]/gi, '').toLowerCase() === normalizedFieldName)
}

function formatClerkFields(fields: string[]): string {
  const labels = fields.map((field) => clerkFieldLabels[field] ?? field.replace(/_/g, ' '))
  const uniqueLabels = [...new Set(labels)]

  if (uniqueLabels.length === 0) return ''
  if (uniqueLabels.length === 1) return uniqueLabels[0]
  return `${uniqueLabels.slice(0, -1).join(', ')} and ${uniqueLabels[uniqueLabels.length - 1]}`
}

function getIncompleteSignUpMessage(result: unknown): string {
  const state = getClerkSignUpState(result)
  const pendingFields = [...state.missingFields, ...state.unverifiedFields, ...state.requiredFields]

  if (hasClerkField(pendingFields, 'phoneNumber')) {
    return 'Your email code was accepted, but Clerk still requires phone verification. This app is configured for email-only signup, so phone verification must be disabled in Clerk before users can finish signup.'
  }

  if (hasClerkField(pendingFields, 'username')) {
    return 'Your email code was accepted, but Clerk still requires a username. This app uses email-only signup, so the username requirement must be disabled in Clerk before users can finish signup.'
  }

  if (state.missingFields.length > 0) {
    return `Your email code was accepted, but Clerk still requires ${formatClerkFields(state.missingFields)} before the account can be created.`
  }

  if (state.unverifiedFields.length > 0) {
    return `Your email code was accepted, but Clerk still needs verification for ${formatClerkFields(state.unverifiedFields)}.`
  }

  if (state.requiredFields.length > 0) {
    return `Your email code was accepted, but Clerk still requires ${formatClerkFields(state.requiredFields)} to finish signup.`
  }

  return `Your email code was accepted, but Clerk returned signup status "${state.status ?? 'unknown'}" instead of completing the account.`
}

type SetActiveFn = (params: { session: string }) => Promise<unknown>

function Field({
  children,
  hint,
  label,
}: {
  children: ReactNode
  hint?: string
  label: string
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-foreground">
      <span className="flex items-center justify-between gap-3">
        <span>{label}</span>
        {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
      </span>
      {children}
    </label>
  )
}

function StatusMessage({ message }: { message: string | null }) {
  if (!message) return null

  return (
    <div className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm leading-6 text-destructive">
      {message}
    </div>
  )
}

async function activateSession(setActive: SetActiveFn | undefined, sessionId: string | null) {
  if (setActive && sessionId) {
    await setActive({ session: sessionId })
  }
}

function getPhoneDisplayValue(formData: SignUpFormData) {
  return `${formData.phoneCountryCode.trim()} ${formData.phoneNationalNumber.trim()}`
}

function ProgressHeader({ currentStep }: { currentStep: SignUpStep }) {
  const currentIndex = signUpSteps.findIndex((item) => item.id === currentStep)

  return (
    <div className="rounded-xl border border-primary/15 bg-background/70 p-3">
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
  const [step, setStep] = useState<SignUpStep>('profile')
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
    setStep('profile')
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
    if (step === 'profile') {
      if (!formData.firstName.trim()) return 'First name is required.'
      if (!formData.lastName.trim()) return 'Last name is required.'
      return null
    }

    if (step === 'access') {
      if (!formData.email.trim()) return 'Email is required.'
      if (!formData.password) return 'Password is required.'
      if (!countryCodePattern.test(formData.phoneCountryCode.trim())) {
        return 'Country code must start with + and contain 1 to 4 digits.'
      }
      if (!nationalPhonePattern.test(formData.phoneNationalNumber.trim())) {
        return 'Phone number must contain digits only, without spaces or country code.'
      }
      const totalDigits = `${formData.phoneCountryCode}${formData.phoneNationalNumber}`.replace(/\D/g, '')
      if (totalDigits.length < 8 || totalDigits.length > 15) {
        return 'Phone number must be 8 to 15 digits including the country code.'
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
    if (!formData.firstName.trim()) return 'First name is required.'
    if (!formData.lastName.trim()) return 'Last name is required.'
    if (!formData.email.trim()) return 'Email is required.'
    if (!formData.password) return 'Password is required.'
    if (!countryCodePattern.test(formData.phoneCountryCode.trim())) {
      return 'Country code must start with + and contain 1 to 4 digits.'
    }
    if (!nationalPhonePattern.test(formData.phoneNationalNumber.trim())) {
      return 'Phone number must contain digits only, without spaces or country code.'
    }
    const totalDigits = `${formData.phoneCountryCode}${formData.phoneNationalNumber}`.replace(/\D/g, '')
    if (totalDigits.length < 8 || totalDigits.length > 15) {
      return 'Phone number must be 8 to 15 digits including the country code.'
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
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        password: formData.password,
        unsafeMetadata: {
          phoneNumber: getPhoneDisplayValue(formData),
          phoneCountryCode: formData.phoneCountryCode.trim(),
          phoneNationalNumber: formData.phoneNationalNumber.trim(),
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

      console.error('Clerk signup did not complete after email verification:', getClerkSignUpState(result))
      setError(getIncompleteSignUpMessage(result))
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
      <DialogContent className="auth-signup-dialog-content auth-flow-content overflow-hidden p-0">
        <DialogHeader className="auth-flow-header gap-4 text-left">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
              {step === 'verification' ? <ShieldCheck className="size-5" /> : <Building2 className="size-5" />}
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Capillia account</p>
              <DialogTitle className="text-2xl leading-8 tracking-tight">{currentStep.title}</DialogTitle>
              <DialogDescription className="text-base leading-7">{currentStep.description}</DialogDescription>
            </div>
          </div>
          <ProgressHeader currentStep={step} />
        </DialogHeader>

        {step !== 'verification' ? (
          <form className="auth-form-shell" onSubmit={handleWizardSubmit}>
            <div className="auth-flow-body grid gap-5 overflow-y-auto">
              {step === 'profile' && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="First name">
                    <Input
                      autoComplete="given-name"
                      className="h-11 sm:h-10"
                      onChange={(event) => updateField('firstName', event.target.value)}
                      placeholder="First name"
                      required
                      value={formData.firstName}
                    />
                  </Field>
                  <Field label="Last name">
                    <Input
                      autoComplete="family-name"
                      className="h-11 sm:h-10"
                      onChange={(event) => updateField('lastName', event.target.value)}
                      placeholder="Last name"
                      required
                      value={formData.lastName}
                    />
                  </Field>
                  <div className="sm:col-span-2 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3">
                    <div className="flex items-start gap-3">
                      <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Email-only account access</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          Your work email is the only identifier you need to sign in.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 'access' && (
                <div className="grid gap-3">
                  <Field label="Work email">
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
                    </div>
                  </Field>
                  <Field label="Password">
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
                    </div>
                  </Field>
                  <div className="grid gap-2 text-sm font-medium text-foreground">
                    <span>Phone number</span>
                    <div className="grid grid-cols-[minmax(5.5rem,0.35fr)_1fr] gap-2">
                      <div className="relative">
                        <Globe2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          autoComplete="tel-country-code"
                          className="h-11 pl-9 sm:h-10"
                          inputMode="tel"
                          onChange={(event) => updateField('phoneCountryCode', event.target.value)}
                          pattern="^\+[1-9]\d{0,3}$"
                          placeholder="+91"
                          required
                          title="Enter only the country code, for example +91."
                          type="tel"
                          value={formData.phoneCountryCode}
                        />
                      </div>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          autoComplete="tel-national"
                          className="h-11 pl-9 sm:h-10"
                          inputMode="numeric"
                          onChange={(event) => updateField('phoneNationalNumber', event.target.value)}
                          pattern="^\d{4,14}$"
                          placeholder="9876543210"
                          required
                          title="Enter the phone number without country code, spaces, or dashes."
                          type="tel"
                          value={formData.phoneNationalNumber}
                        />
                      </div>
                    </div>
                    <p className="text-xs font-normal text-muted-foreground">
                      Saved as {getPhoneDisplayValue(formData)}
                    </p>
                  </div>
                </div>
              )}

              {step === 'company' && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Company name">
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
                    </div>
                  </Field>
                  <Field label="Location">
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
                    </div>
                  </Field>
                  <Field label="Designation" hint="Optional">
                    <div className="relative">
                      <BriefcaseBusiness className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        autoComplete="organization-title"
                        className="h-11 pl-9 sm:h-10"
                        onChange={(event) => updateField('designation', event.target.value)}
                        placeholder="Designation"
                        value={formData.designation}
                      />
                    </div>
                  </Field>
                  <Field label="Department" hint="Optional">
                    <div className="relative">
                      <BriefcaseBusiness className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="h-11 pl-9 sm:h-10"
                        onChange={(event) => updateField('department', event.target.value)}
                        placeholder="Department"
                        value={formData.department}
                      />
                    </div>
                  </Field>
                  <Field label="Company type" hint="Optional">
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="h-11 pl-9 sm:h-10"
                        onChange={(event) => updateField('companyType', event.target.value)}
                        placeholder="Manufacturer, distributor, lab..."
                        value={formData.companyType}
                      />
                    </div>
                  </Field>
                </div>
              )}

              <StatusMessage message={error} />
            </div>

            <div className="auth-flow-actions grid gap-2 sm:grid-cols-[auto_1fr]">
              <Button
                type="button"
                variant="outline"
                disabled={isFirstStep || isSubmitting}
                onClick={goBack}
                className="h-12 sm:h-11"
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <Button type="submit" disabled={!isLoaded || isSubmitting} className="h-12 sm:h-11">
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
          <form className="auth-form-shell" onSubmit={handleVerificationSubmit}>
            <div className="auth-flow-body grid gap-5 overflow-y-auto">
              <div className="flex items-start gap-3 rounded-lg border border-primary/15 bg-primary/5 px-4 py-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-sm leading-6 text-muted-foreground">
                  Verification was sent to {formData.email.trim() || 'your email'}. Keep this dialog open and paste the code here.
                </p>
              </div>
              <Field label="Email verification code">
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
                </div>
              </Field>

              <StatusMessage message={error} />
            </div>

            <div className="auth-flow-actions grid gap-2 sm:grid-cols-[auto_1fr]">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => {
                  setStep('company')
                  setError(null)
                }}
                className="h-12 sm:h-11"
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <Button type="submit" disabled={!isLoaded || isSubmitting} className="h-12 sm:h-11">
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
