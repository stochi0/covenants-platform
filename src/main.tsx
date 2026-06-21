import { StrictMode } from 'react'
import type { ComponentType, PropsWithChildren } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider as ClerkProviderBase } from '@clerk/react'
import './index.css'
import App from './App.tsx'

const ClerkProvider = ClerkProviderBase as unknown as ComponentType<
  PropsWithChildren<{ afterSignOutUrl: string; publishableKey: string }>
>

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const root = createRoot(document.getElementById('root')!)

if (!clerkPublishableKey) {
  root.render(
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg">
        <p className="text-lg font-semibold">Capillia is missing Clerk configuration.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Set VITE_CLERK_PUBLISHABLE_KEY in Vercel and redeploy the app.
        </p>
      </div>
    </div>,
  )
} else {
  root.render(
    <StrictMode>
      <ClerkProvider afterSignOutUrl="/" publishableKey={clerkPublishableKey}>
        <App />
      </ClerkProvider>
    </StrictMode>,
  )
}
