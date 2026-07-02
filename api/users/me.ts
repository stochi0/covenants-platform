import { requireVercelAuth } from '../../server/api-auth.js'
import { getLocalUserProfile } from '../../server/users.js'

interface UserMeRequest {
  method?: string
  headers?: Record<string, string | string[] | undefined>
}

interface UserMeResponse {
  setHeader: (name: string, value: string) => void
  status: (code: number) => { json: (body: unknown) => void }
}

export default async function handler(req: UserMeRequest, res: UserMeResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const auth = await requireVercelAuth(req, res)
  if (!auth) return

  try {
    const profile = await getLocalUserProfile(auth.internalUserId)
    if (!profile) {
      res.status(404).json({ error: 'User profile not found' })
      return
    }

    res.status(200).json(profile)
  } catch (error) {
    res.status(500).json({
      error: 'User profile request failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
