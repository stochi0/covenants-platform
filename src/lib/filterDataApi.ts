import type {
  Chemistry,
  Accreditation,
  StateLocation,
  FilterState,
  StateFacilityCount,
} from './filterData'
import type { FilterDataResponse, StateFacilityCountResponse } from './api-types'
import { apiJson, type AuthTokenGetter } from './api'

let filterDataCache: FilterDataResponse | null = null

async function fetchFilterData(getToken: AuthTokenGetter): Promise<FilterDataResponse> {
  if (filterDataCache) return filterDataCache
  filterDataCache = await apiJson<FilterDataResponse>(getToken, '/api/filters')
  return filterDataCache
}

export async function fetchTotalFacilities(getToken: AuthTokenGetter): Promise<number> {
  try {
    const data = await fetchFilterData(getToken)
    return data.totalFacilities
  } catch (err) {
    console.error('Error fetching total facilities:', err)
    return 0
  }
}

export async function fetchChemistries(getToken: AuthTokenGetter): Promise<Chemistry[]> {
  try {
    const data = await fetchFilterData(getToken)
    return data.chemistries
  } catch (err) {
    console.error('Error fetching chemistries:', err)
    return []
  }
}

export async function fetchAccreditations(getToken: AuthTokenGetter): Promise<Accreditation[]> {
  try {
    const data = await fetchFilterData(getToken)
    return data.accreditations
  } catch (err) {
    console.error('Error fetching accreditations:', err)
    return []
  }
}

export async function fetchStateLocations(getToken: AuthTokenGetter): Promise<StateLocation[]> {
  try {
    const data = await fetchFilterData(getToken)
    return data.stateLocations
  } catch (err) {
    console.error('Error fetching state locations:', err)
    return []
  }
}

export async function fetchFacilityCountByAccreditations(
  getToken: AuthTokenGetter,
  accreditationIds: string[]
): Promise<number> {
  return fetchFacilityCountByFilters(getToken, {
    chemistries: [],
    accreditations: accreditationIds,
    locations: [],
  })
}

export async function fetchFacilityCountByChemistries(
  getToken: AuthTokenGetter,
  chemistryIds: string[]
): Promise<number> {
  return fetchFacilityCountByFilters(getToken, {
    chemistries: chemistryIds,
    accreditations: [],
    locations: [],
  })
}

export async function fetchFacilityCountByFilters(getToken: AuthTokenGetter, filters: FilterState): Promise<number> {
  try {
    const data = await apiJson<{ count: number }>(getToken, '/api/facilities/count', {
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
  getToken: AuthTokenGetter,
  filters: Pick<FilterState, 'chemistries' | 'accreditations'>
): Promise<StateFacilityCount[]> {
  if (filters.chemistries.length === 0 && filters.accreditations.length === 0) {
    return []
  }

  try {
    const data = await apiJson<StateFacilityCountResponse>(getToken, '/api/facilities/state-counts', {
      method: 'POST',
      body: JSON.stringify({ filters }),
    })
    return data.locations
  } catch (err) {
    console.error('Error fetching state facility counts by filters:', err)
    return []
  }
}
