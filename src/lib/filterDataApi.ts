import type {
  Chemistry,
  Accreditation,
  StateLocation,
  FilterState,
  StateFacilityCount,
} from './filterData'
import type { FilterDataResponse, StateFacilityCountResponse } from './api-types'
import { apiJson } from './api'

let filterDataCache: FilterDataResponse | null = null

async function fetchFilterData(): Promise<FilterDataResponse> {
  if (filterDataCache) return filterDataCache
  filterDataCache = await apiJson<FilterDataResponse>('/api/filters')
  return filterDataCache
}

export async function fetchTotalFacilities(): Promise<number> {
  try {
    const data = await fetchFilterData()
    return data.totalFacilities
  } catch (err) {
    console.error('Error fetching total facilities:', err)
    return 0
  }
}

export async function fetchChemistries(): Promise<Chemistry[]> {
  try {
    const data = await fetchFilterData()
    return data.chemistries
  } catch (err) {
    console.error('Error fetching chemistries:', err)
    return []
  }
}

export async function fetchAccreditations(): Promise<Accreditation[]> {
  try {
    const data = await fetchFilterData()
    return data.accreditations
  } catch (err) {
    console.error('Error fetching accreditations:', err)
    return []
  }
}

export async function fetchStateLocations(): Promise<StateLocation[]> {
  try {
    const data = await fetchFilterData()
    return data.stateLocations
  } catch (err) {
    console.error('Error fetching state locations:', err)
    return []
  }
}

export async function fetchFacilityCountByAccreditations(
  accreditationIds: string[]
): Promise<number> {
  return fetchFacilityCountByFilters({
    chemistries: [],
    accreditations: accreditationIds,
    locations: [],
  })
}

export async function fetchFacilityCountByChemistries(
  chemistryIds: string[]
): Promise<number> {
  return fetchFacilityCountByFilters({
    chemistries: chemistryIds,
    accreditations: [],
    locations: [],
  })
}

export async function fetchFacilityCountByFilters(filters: FilterState): Promise<number> {
  try {
    const data = await apiJson<{ count: number }>('/api/facilities/count', {
      method: 'POST',
      body: JSON.stringify({ filters }),
    })
    return data.count
  } catch (err) {
    console.error('Error fetching facility count by filters:', err)
    return 0
  }
}

export async function fetchStateFacilityCountsByFilters(
  filters: Pick<FilterState, 'chemistries' | 'accreditations'>
): Promise<StateFacilityCount[]> {
  if (filters.chemistries.length === 0 && filters.accreditations.length === 0) {
    return []
  }

  try {
    const data = await apiJson<StateFacilityCountResponse>('/api/facilities/state-counts', {
      method: 'POST',
      body: JSON.stringify({ filters }),
    })
    return data.locations
  } catch (err) {
    console.error('Error fetching state facility counts by filters:', err)
    return []
  }
}
