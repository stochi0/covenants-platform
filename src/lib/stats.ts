import type { PlatformStats } from './api-types'

export type { PlatformStats } from './api-types'

const defaultStats: PlatformStats = {
  products: 0,
  manufacturers: 0,
  chemistries: 0,
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  try {
    const response = await fetch('/api/stats')
    const data = await response.json().catch(() => null) as unknown

    if (!response.ok) {
      const message = data && typeof data === 'object' && 'details' in data
        ? String((data as { details: unknown }).details)
        : `Request failed: ${response.status}`
      throw new Error(message)
    }

    return data as PlatformStats
  } catch (err) {
    console.error('Error fetching platform stats:', err)
    return defaultStats
  }
}
