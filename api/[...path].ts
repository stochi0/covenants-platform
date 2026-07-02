import { handleDataRequest } from '../server/data.js'
import { requireVercelAuth, type VercelRequest, type VercelResponse } from '../server/api-auth.js'

interface CatchAllRequest extends VercelRequest {
  query?: Record<string, unknown> & {
    path?: string | string[]
  }
}

function normalizeApiPath(value: unknown): string {
  const segments = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? [value]
      : []

  return `/api/${segments
    .filter((segment): segment is string => typeof segment === 'string' && segment.length > 0)
    .map((segment) => segment.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/')}`
}

export default async function handler(req: CatchAllRequest, res: VercelResponse) {
  if (!await requireVercelAuth(req, res)) return

  const query = { ...(req.query ?? {}) }
  delete query.path

  await handleDataRequest({
    method: req.method,
    path: normalizeApiPath(req.query?.path),
    body: req.body,
    query,
  }, res)
}
