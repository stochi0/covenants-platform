import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FlaskConical, Loader2 } from 'lucide-react'

interface SignUpProps {
  onToggleMode: () => void
}

export function SignUp({ onToggleMode }: SignUpProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    const { error } = await signUp(
      formData.email,
      formData.password,
      {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        companyName: formData.companyName || undefined,
      }
    )

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh-gradient p-4">
        <div className="w-full max-w-md">
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto bg-gradient-to-br from-primary to-accent p-3 rounded-2xl w-fit">
                <FlaskConical className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
              <CardDescription>
                We've sent you a confirmation link to verify your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={onToggleMode}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                Back to Sign in
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh-gradient p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-2xl">
            <FlaskConical className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Capillia</h1>
            <p className="text-sm text-muted-foreground">Covenants Platform</p>
          </div>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>
              Enter your information to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-foreground">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-foreground">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-foreground">
                  Phone <span className="text-muted-foreground">(optional)</span>
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="companyName" className="text-sm font-medium text-foreground">
                  Company Name <span className="text-muted-foreground">(optional)</span>
                </label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder="Acme Pharmaceuticals"
                  value={formData.companyName}
                  onChange={handleChange}
                  disabled={loading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="h-11"
                />
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <button
                  type="button"
                  onClick={onToggleMode}
                  className="text-primary hover:text-accent font-medium transition-colors"
                  disabled={loading}
                >
                  Sign in
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
