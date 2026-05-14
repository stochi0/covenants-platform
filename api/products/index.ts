import { parseSearchQuery, searchProducts } from '../../server/data.ts'

export default async function handler(
  req: { method?: string; query?: Record<string, unknown> },
  res: { setHeader: (name: string, value: string) => void; status: (code: number) => { json: (body: unknown) => void } }
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    res.status(200).json(await searchProducts(parseSearchQuery(req.query ?? {})))
  } catch (error) {
    res.status(500).json({
      error: 'Database request failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
