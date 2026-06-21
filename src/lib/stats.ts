import type { PlatformStats } from './api-types'
import { apiJson, type AuthTokenGetter } from './api'

export type { PlatformStats } from './api-types'

const defaultStats: PlatformStats = {
  products: 0,
  manufacturers: 0,
  chemistries: 0,
}

export async function fetchPlatformStats(getToken: AuthTokenGetter): Promise<PlatformStats> {
  try {
    return await apiJson<PlatformStats>(getToken, '/api/stats')
  } catch (err) {
    console.error('Error fetching platform stats:', err)
    return defaultStats
  }
}
