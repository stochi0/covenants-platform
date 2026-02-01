import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FlaskConical, Loader2 } from 'lucide-react'

interface SignInProps {
  onToggleMode: () => void
}

export function SignIn({ onToggleMode }: SignInProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error.message)
      setLoading(false)
    }
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
            <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <button
                  type="button"
                  onClick={onToggleMode}
                  className="text-primary hover:text-accent font-medium transition-colors"
                  disabled={loading}
                >
                  Sign up
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
