import { authenticateHeaders, type AuthenticatedUser } from './auth.js'

export interface VercelRequest {
  method?: string
  body?: unknown
  query?: Record<string, unknown>
  headers?: Record<string, string | string[] | undefined>
}

export interface VercelResponse {
  status: (code: number) => { json: (body: unknown) => void }
}

export async function requireVercelAuth(req: VercelRequest, res: VercelResponse): Promise<AuthenticatedUser | null> {
  try {
    return await authenticateHeaders(req.headers ?? {})
  } catch (error) {
    res.status(401).json({
      error: 'Unauthorized',
      details: error instanceof Error ? error.message : 'Authentication failed',
    })
    return null
  }
}
