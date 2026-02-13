import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { SignIn } from './SignIn'
import { SignUp } from './SignUp'
import { Loader2 } from 'lucide-react'

interface AuthWrapperProps {
  children: React.ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, loading } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh-gradient">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return mode === 'signin' ? (
      <SignIn onToggleMode={() => setMode('signup')} />
    ) : (
      <SignUp onToggleMode={() => setMode('signin')} />
    )
  }

  return <>{children}</>
}
