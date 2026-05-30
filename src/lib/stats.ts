import type { PlatformStats } from './api-types'
import { apiJson } from './api'

export type { PlatformStats } from './api-types'

const defaultStats: PlatformStats = {
  products: 0,
  manufacturers: 0,
  chemistries: 0,
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  try {
    return await apiJson<PlatformStats>('/api/stats')
  } catch (err) {
    console.error('Error fetching platform stats:', err)
    return defaultStats
  }
}
