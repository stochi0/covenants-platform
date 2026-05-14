import { getFilterData } from '../server/data.ts'

export default async function handler(
  req: { method?: string },
  res: { setHeader: (name: string, value: string) => void; status: (code: number) => { json: (body: unknown) => void } }
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    res.status(200).json(await getFilterData())
  } catch (error) {
    res.status(500).json({
      error: 'Database request failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
