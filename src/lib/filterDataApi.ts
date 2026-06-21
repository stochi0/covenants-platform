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
let filterDataPromise: Promise<FilterDataResponse> | null = null

export async function fetchFilterData(getToken: AuthTokenGetter): Promise<FilterDataResponse> {
  if (filterDataCache) return filterDataCache
  if (!filterDataPromise) {
    filterDataPromise = apiJson<FilterDataResponse>(getToken, '/api/filters')
      .then((data) => {
        filterDataCache = data
        return data
      })
      .catch((error) => {
        filterDataPromise = null
        throw error
      })
  }

  return filterDataPromise
}

export async function fetchTotalFacilities(getToken: AuthTokenGetter): Promise<number> {
  const data = await fetchFilterData(getToken)
  return data.totalFacilities
}

export async function fetchChemistries(getToken: AuthTokenGetter): Promise<Chemistry[]> {
  const data = await fetchFilterData(getToken)
  return data.chemistries
}

export async function fetchAccreditations(getToken: AuthTokenGetter): Promise<Accreditation[]> {
  const data = await fetchFilterData(getToken)
  return data.accreditations
}

export async function fetchStateLocations(getToken: AuthTokenGetter): Promise<StateLocation[]> {
  const data = await fetchFilterData(getToken)
  return data.stateLocations
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
  const data = await apiJson<{ count: number }>(getToken, '/api/facilities/count', {
    method: 'POST',
    body: JSON.stringify({ filters }),
  })
  return data.count
}

export async function fetchStateFacilityCountsByFilters(
  getToken: AuthTokenGetter,
  filters: Pick<FilterState, 'chemistries' | 'accreditations'>
): Promise<StateFacilityCount[]> {
  if (filters.chemistries.length === 0 && filters.accreditations.length === 0) {
    return []
  }

  const data = await apiJson<StateFacilityCountResponse>(getToken, '/api/facilities/state-counts', {
    method: 'POST',
    body: JSON.stringify({ filters }),
  })
  return data.locations
}
