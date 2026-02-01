import { Dashboard } from "@/components/Dashboard"
import { AuthWrapper } from "@/components/auth/AuthWrapper"

function App() {
  return (
    <AuthWrapper>
      <Dashboard />
    </AuthWrapper>
  )
}

export default App
