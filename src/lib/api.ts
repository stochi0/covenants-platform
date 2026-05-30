type ClerkSession = {
  getToken: () => Promise<string | null>
}

declare global {
  interface Window {
    Clerk?: {
      session?: ClerkSession | null
    }
  }
}

async function getSessionToken(): Promise<string> {
  const token = await window.Clerk?.session?.getToken()
  if (!token) {
    throw new Error('You must be signed in to continue.')
  }
  return token
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getSessionToken()
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  })
  const data = await response.json().catch(() => null) as unknown

  if (!response.ok) {
    const message = data && typeof data === 'object' && 'details' in data
      ? String((data as { details: unknown }).details)
      : data && typeof data === 'object' && 'error' in data
        ? String((data as { error: unknown }).error)
        : `Request failed: ${response.status}`
    throw new Error(message)
  }

  return data as T
}
