import { getProductById } from '../../server/data.ts'
import { requireVercelAuth } from '../../server/api-auth.ts'

export default async function handler(
  req: { method?: string; query?: { id?: string | string[] } },
  res: { setHeader: (name: string, value: string) => void; status: (code: number) => { json: (body: unknown) => void } }
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  if (!await requireVercelAuth(req, res)) return

  const id = Array.isArray(req.query?.id) ? req.query?.id[0] : req.query?.id
  if (!id) {
    res.status(400).json({ error: 'Product id is required' })
    return
  }

  try {
    const product = await getProductById(id)
    if (!product) {
      res.status(404).json({ error: 'Product not found' })
      return
    }
    res.status(200).json(product)
  } catch (error) {
    res.status(500).json({
      error: 'Database request failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
