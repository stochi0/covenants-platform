import { verifyClerkHeaders } from '../../server/auth.js'
import { upsertUserProfile } from '../../server/users.js'

interface SyncUserRequest {
  method?: string
  body?: unknown
  headers?: Record<string, string | string[] | undefined>
}

interface SyncUserResponse {
  setHeader: (name: string, value: string) => void
  status: (code: number) => { json: (body: unknown) => void }
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export default async function handler(req: SyncUserRequest, res: SyncUserResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  let claims: Awaited<ReturnType<typeof verifyClerkHeaders>>
  try {
    claims = await verifyClerkHeaders(req.headers ?? {})
  } catch (error) {
    res.status(401).json({
      error: 'Unauthorized',
      details: error instanceof Error ? error.message : 'Authentication failed',
    })
    return
  }

  const body = req.body && typeof req.body === 'object'
    ? req.body as Record<string, unknown>
    : {}
  const email = readString(body.email)

  if (!email) {
    res.status(400).json({ error: 'Email is required' })
    return
  }

  try {
    const id = await upsertUserProfile({
      clerkUserId: claims.sub!,
      email,
      firstName: readString(body.firstName),
      lastName: readString(body.lastName),
      imageUrl: readString(body.imageUrl),
      emailVerified: body.emailVerified === true,
    })

    res.status(200).json({ id })
  } catch (error) {
    res.status(500).json({
      error: 'User sync failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
