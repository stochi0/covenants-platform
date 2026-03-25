import { supabase } from './supabase'
import type {
  Chemistry,
  Accreditation,
  StateLocation,
  FilterState,
  StateFacilityCount,
} from './filterData'

export async function fetchTotalFacilities(): Promise<number> {
  if (!supabase) return 0

  try {
    const { count, error } = await supabase
      .from('facilities')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .is('deleted_at', null)

    if (error) throw error
    return count ?? 0
  } catch (err) {
    console.error('Error fetching total facilities:', err)
    return 0
  }
}

export async function fetchChemistries(): Promise<Chemistry[]> {
  if (!supabase) return []

  try {
    const [chemRes, fcRes, facilitiesRes] = await Promise.all([
      supabase.from('chemistries').select('id, slug, label').order('label'),
      supabase.from('facility_chemistries').select('chemistry_id, facility_id'),
      supabase
        .from('facilities')
        .select('id')
        .eq('is_active', true)
        .is('deleted_at', null),
    ])

    if (chemRes.error) throw chemRes.error
    if (fcRes.error) throw fcRes.error
    if (facilitiesRes.error) throw facilitiesRes.error

    const validFacilityIds = new Set((facilitiesRes.data ?? []).map((facility) => facility.id))
    const countByChemistry = new Map<string, number>()

    for (const row of fcRes.data ?? []) {
      if (!validFacilityIds.has(row.facility_id)) continue
      countByChemistry.set(row.chemistry_id, (countByChemistry.get(row.chemistry_id) ?? 0) + 1)
    }

    return (chemRes.data ?? []).map((chemistry) => ({
      id: chemistry.id,
      name: chemistry.label,
      slug: chemistry.slug,
      facilityCount: countByChemistry.get(chemistry.id) ?? 0,
    }))
  } catch (err) {
    console.error('Error fetching chemistries:', err)
    return []
  }
}

export async function fetchAccreditations(): Promise<Accreditation[]> {
  if (!supabase) return []

  try {
    const [accRes, faRes, facilitiesRes] = await Promise.all([
      supabase.from('accreditations').select('id, code, label').order('label'),
      supabase.from('facility_accreditations').select('accreditation_id, facility_id'),
      supabase
        .from('facilities')
        .select('id')
        .eq('is_active', true)
        .is('deleted_at', null),
    ])

    if (accRes.error) throw accRes.error
    if (faRes.error) throw faRes.error
    if (facilitiesRes.error) throw facilitiesRes.error

    const validFacilityIds = new Set((facilitiesRes.data ?? []).map((facility) => facility.id))
    const countByAccreditation = new Map<string, number>()

    for (const row of faRes.data ?? []) {
      if (!validFacilityIds.has(row.facility_id)) continue
      countByAccreditation.set(
        row.accreditation_id,
        (countByAccreditation.get(row.accreditation_id) ?? 0) + 1
      )
    }

    return (accRes.data ?? []).map((accreditation) => ({
      id: accreditation.id,
      name: accreditation.label,
      shortName: accreditation.code,
      facilityCount: countByAccreditation.get(accreditation.id) ?? 0,
    }))
  } catch (err) {
    console.error('Error fetching accreditations:', err)
    return []
  }
}

export async function fetchStateLocations(): Promise<StateLocation[]> {
  if (!supabase) return []

  try {
    const [regionsRes, facilitiesRes] = await Promise.all([
      supabase.from('regions').select('id, iso_code, name, country').eq('country', 'IN').order('name'),
      supabase
        .from('facilities')
        .select('region_id')
        .eq('is_active', true)
        .is('deleted_at', null)
        .not('region_id', 'is', null),
    ])

    if (regionsRes.error) throw regionsRes.error
    if (facilitiesRes.error) throw facilitiesRes.error

    const countByRegion = new Map<string, number>()
    for (const facility of facilitiesRes.data ?? []) {
      if (!facility.region_id) continue
      countByRegion.set(facility.region_id, (countByRegion.get(facility.region_id) ?? 0) + 1)
    }

    return (regionsRes.data ?? []).map((region) => ({
      id: region.id,
      name: region.name,
      isoCode: region.iso_code,
      facilityCount: countByRegion.get(region.id) ?? 0,
    }))
  } catch (err) {
    console.error('Error fetching state locations:', err)
    return []
  }
}

export async function fetchFacilityCountByAccreditations(
  accreditationIds: string[]
): Promise<number> {
  if (!supabase) return 0
  if (accreditationIds.length === 0) return fetchTotalFacilities()

  try {
    const { data: faRows, error: faError } = await supabase
      .from('facility_accreditations')
      .select('facility_id, accreditation_id')
      .in('accreditation_id', accreditationIds)

    if (faError) throw faError

    const { data: activeFacilities, error: fError } = await supabase
      .from('facilities')
      .select('id')
      .eq('is_active', true)
      .is('deleted_at', null)

    if (fError) throw fError

    const validFacilityIds = new Set((activeFacilities ?? []).map((facility) => facility.id))
    const facilityToAccCount = new Map<string, Set<string>>()

    for (const row of faRows ?? []) {
      if (!validFacilityIds.has(row.facility_id)) continue
      let accSet = facilityToAccCount.get(row.facility_id)
      if (!accSet) {
        accSet = new Set()
        facilityToAccCount.set(row.facility_id, accSet)
      }
      accSet.add(row.accreditation_id)
    }

    let count = 0
    for (const [, accSet] of facilityToAccCount) {
      if (accSet.size === accreditationIds.length) count++
    }

    return count
  } catch (err) {
    console.error('Error fetching facility count by accreditations:', err)
    return 0
  }
}

export async function fetchFacilityCountByChemistries(
  chemistryIds: string[]
): Promise<number> {
  if (!supabase) return 0
  if (chemistryIds.length === 0) return fetchTotalFacilities()

  try {
    const { data: fcRows, error: fcError } = await supabase
      .from('facility_chemistries')
      .select('facility_id, chemistry_id')
      .in('chemistry_id', chemistryIds)

    if (fcError) throw fcError

    const { data: activeFacilities, error: fError } = await supabase
      .from('facilities')
      .select('id')
      .eq('is_active', true)
      .is('deleted_at', null)

    if (fError) throw fError

    const validFacilityIds = new Set((activeFacilities ?? []).map((facility) => facility.id))
    const facilityToChemCount = new Map<string, Set<string>>()

    for (const row of fcRows ?? []) {
      if (!validFacilityIds.has(row.facility_id)) continue
      let chemSet = facilityToChemCount.get(row.facility_id)
      if (!chemSet) {
        chemSet = new Set()
        facilityToChemCount.set(row.facility_id, chemSet)
      }
      chemSet.add(row.chemistry_id)
    }

    let count = 0
    for (const [, chemSet] of facilityToChemCount) {
      if (chemSet.size === chemistryIds.length) count++
    }

    return count
  } catch (err) {
    console.error('Error fetching facility count by chemistries:', err)
    return 0
  }
}

export async function fetchFacilityCountByFilters(filters: FilterState): Promise<number> {
  if (!supabase) return 0

  const {
    chemistries: chemistryIds,
    accreditations: accreditationIds,
    locations: locationIds,
  } = filters
  if (chemistryIds.length === 0 && accreditationIds.length === 0 && locationIds.length === 0) {
    return fetchTotalFacilities()
  }

  const sb = supabase

  try {
    const { data: facilities, error: facilitiesError } = await sb
      .from('facilities')
      .select('id, region_id')
      .eq('is_active', true)
      .is('deleted_at', null)

    if (facilitiesError) throw facilitiesError

    let facilityIds = new Set((facilities ?? []).map((facility) => facility.id))

    if (locationIds.length > 0) {
      const inSelectedRegions = new Set(
        (facilities ?? [])
          .filter((facility) => facility.region_id && locationIds.includes(facility.region_id))
          .map((facility) => facility.id)
      )

      facilityIds = new Set([...facilityIds].filter((facilityId) => inSelectedRegions.has(facilityId)))
    }

    const matchesByAccreditation = async () => {
      if (accreditationIds.length === 0) return null
      const { data: faRows, error: faError } = await sb
        .from('facility_accreditations')
        .select('facility_id, accreditation_id')
        .in('accreditation_id', accreditationIds)

      if (faError) throw faError

      const facilityToAcc = new Map<string, Set<string>>()
      for (const row of faRows ?? []) {
        if (!facilityIds.has(row.facility_id)) continue
        let accSet = facilityToAcc.get(row.facility_id)
        if (!accSet) {
          accSet = new Set()
          facilityToAcc.set(row.facility_id, accSet)
        }
        accSet.add(row.accreditation_id)
      }

      return new Set(
        [...facilityIds].filter((facilityId) => facilityToAcc.get(facilityId)?.size === accreditationIds.length)
      )
    }

    const matchesByChemistry = async () => {
      if (chemistryIds.length === 0) return null
      const { data: fcRows, error: fcError } = await sb
        .from('facility_chemistries')
        .select('facility_id, chemistry_id')
        .in('chemistry_id', chemistryIds)

      if (fcError) throw fcError

      const facilityToChem = new Map<string, Set<string>>()
      for (const row of fcRows ?? []) {
        if (!facilityIds.has(row.facility_id)) continue
        let chemSet = facilityToChem.get(row.facility_id)
        if (!chemSet) {
          chemSet = new Set()
          facilityToChem.set(row.facility_id, chemSet)
        }
        chemSet.add(row.chemistry_id)
      }

      return new Set(
        [...facilityIds].filter((facilityId) => facilityToChem.get(facilityId)?.size === chemistryIds.length)
      )
    }

    const [accSet, chemSet] = await Promise.all([
      matchesByAccreditation(),
      matchesByChemistry(),
    ])

    if (accSet && chemSet) {
      facilityIds = new Set([...facilityIds].filter((id) => accSet.has(id) && chemSet.has(id)))
    } else if (accSet) {
      facilityIds = new Set([...facilityIds].filter((id) => accSet.has(id)))
    } else if (chemSet) {
      facilityIds = new Set([...facilityIds].filter((id) => chemSet.has(id)))
    }

    return facilityIds.size
  } catch (err) {
    console.error('Error fetching facility count by filters:', err)
    return 0
  }
}

export async function fetchStateFacilityCountsByFilters(
  filters: Pick<FilterState, 'chemistries' | 'accreditations'>
): Promise<StateFacilityCount[]> {
  if (!supabase) return []

  const { chemistries: chemistryIds, accreditations: accreditationIds } = filters
  if (chemistryIds.length === 0 && accreditationIds.length === 0) {
    return []
  }

  const sb = supabase

  try {
    const { data: facilities, error: facilitiesError } = await sb
      .from('facilities')
      .select('id, region_id')
      .eq('is_active', true)
      .is('deleted_at', null)
      .not('region_id', 'is', null)

    if (facilitiesError) throw facilitiesError

    let facilityIds = new Set((facilities ?? []).map((facility) => facility.id))

    const matchesByAccreditation = async () => {
      if (accreditationIds.length === 0) return null
      const { data: faRows, error: faError } = await sb
        .from('facility_accreditations')
        .select('facility_id, accreditation_id')
        .in('accreditation_id', accreditationIds)

      if (faError) throw faError

      const facilityToAcc = new Map<string, Set<string>>()
      for (const row of faRows ?? []) {
        if (!facilityIds.has(row.facility_id)) continue
        let accSet = facilityToAcc.get(row.facility_id)
        if (!accSet) {
          accSet = new Set()
          facilityToAcc.set(row.facility_id, accSet)
        }
        accSet.add(row.accreditation_id)
      }

      return new Set([...facilityIds].filter((facilityId) => facilityToAcc.get(facilityId)?.size === accreditationIds.length))
    }

    const matchesByChemistry = async () => {
      if (chemistryIds.length === 0) return null
      const { data: fcRows, error: fcError } = await sb
        .from('facility_chemistries')
        .select('facility_id, chemistry_id')
        .in('chemistry_id', chemistryIds)

      if (fcError) throw fcError

      const facilityToChem = new Map<string, Set<string>>()
      for (const row of fcRows ?? []) {
        if (!facilityIds.has(row.facility_id)) continue
        let chemSet = facilityToChem.get(row.facility_id)
        if (!chemSet) {
          chemSet = new Set()
          facilityToChem.set(row.facility_id, chemSet)
        }
        chemSet.add(row.chemistry_id)
      }

      return new Set([...facilityIds].filter((facilityId) => facilityToChem.get(facilityId)?.size === chemistryIds.length))
    }

    const [accSet, chemSet] = await Promise.all([
      matchesByAccreditation(),
      matchesByChemistry(),
    ])

    if (accSet && chemSet) {
      facilityIds = new Set([...facilityIds].filter((id) => accSet.has(id) && chemSet.has(id)))
    } else if (accSet) {
      facilityIds = new Set([...facilityIds].filter((id) => accSet.has(id)))
    } else if (chemSet) {
      facilityIds = new Set([...facilityIds].filter((id) => chemSet.has(id)))
    }

    const countByLocation = new Map<string, number>()
    for (const facility of facilities ?? []) {
      if (!facilityIds.has(facility.id)) continue
      if (!facility.region_id) continue
      countByLocation.set(facility.region_id, (countByLocation.get(facility.region_id) ?? 0) + 1)
    }

    return [...countByLocation.entries()].map(([locationId, facilityCount]) => ({
      locationId,
      facilityCount,
    }))
  } catch (err) {
    console.error('Error fetching state facility counts by filters:', err)
    return []
  }
}
