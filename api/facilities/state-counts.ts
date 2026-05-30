import { getStateFacilityCountsByFilters } from '../../server/data.ts'
import { requireVercelAuth } from '../../server/api-auth.ts'
import type { FilterState } from '../../src/lib/filterData.ts'

function parseFilters(value: unknown): Pick<FilterState, 'chemistries' | 'accreditations'> {
  const raw = value && typeof value === 'object' ? (value as { filters?: unknown }).filters : null
  const filters = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {}
  const parseArray = (items: unknown) => Array.isArray(items)
    ? items.filter((item): item is string => typeof item === 'string')
    : []

  return {
    chemistries: parseArray(filters.chemistries),
    accreditations: parseArray(filters.accreditations),
  }
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
    res.status(200).json(await getStateFacilityCountsByFilters(parseFilters(req.body)))
  } catch (error) {
    res.status(500).json({
      error: 'Database request failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
