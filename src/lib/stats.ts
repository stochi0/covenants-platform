import type { PlatformStats } from './api-types'
import { apiJson, type AuthTokenGetter } from './api'

export type { PlatformStats } from './api-types'

export async function fetchPlatformStats(getToken: AuthTokenGetter): Promise<PlatformStats> {
  return apiJson<PlatformStats>(getToken, '/api/stats')
}
