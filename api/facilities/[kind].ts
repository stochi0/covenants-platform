import { getFacilityCountByFilters, getStateFacilityCountsByFilters } from '../../server/data.js'
import { requireVercelAuth } from '../../server/api-auth.js'
import type { FilterState } from '../../src/lib/filterData.js'

interface FacilitiesRequest {
  method?: string
  body?: unknown
  query?: {
    kind?: string | string[]
  }
}

interface FacilitiesResponse {
  setHeader: (name: string, value: string) => void
  status: (code: number) => { json: (body: unknown) => void }
}

function parseFilters(value: unknown): FilterState {
  const raw = value && typeof value === 'object' ? (value as { filters?: unknown }).filters : null
  const filters = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {}
  const parseArray = (items: unknown) => Array.isArray(items)
    ? items.filter((item): item is string => typeof item === 'string')
    : []

  return {
    chemistries: parseArray(filters.chemistries),
    accreditations: parseArray(filters.accreditations),
    locations: parseArray(filters.locations),
  }
}

function readKind(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export default async function handler(req: FacilitiesRequest, res: FacilitiesResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  if (!await requireVercelAuth(req, res)) return

  try {
    const filters = parseFilters(req.body)
    const kind = readKind(req.query?.kind)

    if (kind === 'count') {
      res.status(200).json({ count: await getFacilityCountByFilters(filters) })
      return
    }

    if (kind === 'state-counts') {
      res.status(200).json(await getStateFacilityCountsByFilters(filters))
      return
    }

    res.status(404).json({ error: 'Not found' })
  } catch (error) {
    res.status(500).json({
      error: 'Database request failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
