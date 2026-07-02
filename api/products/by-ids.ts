import { getProductsByIds } from '../../server/data.js'
import { requireVercelAuth } from '../../server/api-auth.js'

function parseIds(value: unknown): string[] {
  if (!value || typeof value !== 'object') return []
  const ids = (value as { ids?: unknown }).ids
  return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : []
}

export default async function handler(
  req: { method?: string; body?: unknown },
  res: { setHeader: (name: string, value: string) => void; status: (code: number) => { json: (body: unknown) => void } }
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  if (!await requireVercelAuth(req, res)) return

  try {
    res.status(200).json({ products: await getProductsByIds(parseIds(req.body)) })
  } catch (error) {
    res.status(500).json({
      error: 'Database request failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
