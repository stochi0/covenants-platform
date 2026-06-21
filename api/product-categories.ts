import { getProductCategories } from '../server/data'
import { requireVercelAuth } from '../server/api-auth'

export default async function handler(
  req: { method?: string },
  res: { setHeader: (name: string, value: string) => void; status: (code: number) => { json: (body: unknown) => void } }
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  if (!await requireVercelAuth(req, res)) return

  try {
    res.status(200).json(await getProductCategories())
  } catch (error) {
    res.status(500).json({
      error: 'Database request failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
