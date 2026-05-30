import { StrictMode } from 'react'
import type { ComponentType, PropsWithChildren } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider as ClerkProviderBase } from '@clerk/react'
import './index.css'
import App from './App.tsx'

const ClerkProvider = ClerkProviderBase as unknown as ComponentType<
  PropsWithChildren<{ afterSignOutUrl: string }>
>

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  </StrictMode>,
)
