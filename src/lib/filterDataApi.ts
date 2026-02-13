import { supabase } from './supabase'
import type { Chemistry, Accreditation, StateLocation } from './filterData'

/** Fetch total count of active, non-deleted facilities */
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

/**
 * Fetch chemistries from DB with facility counts.
 * Schema: chemistries (id, slug, label), facility_chemistries (facility_id, chemistry_id)
 * Only counts facilities that are active and not deleted.
 */
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

    const validFacilityIds = new Set((facilitiesRes.data ?? []).map((f) => f.id))

    const countByChemistry = new Map<string, number>()
    for (const row of fcRes.data ?? []) {
      if (validFacilityIds.has(row.facility_id)) {
        countByChemistry.set(
          row.chemistry_id,
          (countByChemistry.get(row.chemistry_id) ?? 0) + 1
        )
      }
    }

    return (chemRes.data ?? []).map((c) => ({
      id: c.id,
      name: c.label,
      facilityCount: countByChemistry.get(c.id) ?? 0,
      category: 'specialty' as const,
    }))
  } catch (err) {
    console.error('Error fetching chemistries:', err)
    return []
  }
}

/**
 * Fetch accreditations from DB with facility counts.
 * Schema: accreditations (id, code, label), facility_accreditations (facility_id, accreditation_id)
 */
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

    const validFacilityIds = new Set((facilitiesRes.data ?? []).map((f) => f.id))

    const countByAccreditation = new Map<string, number>()
    for (const row of faRes.data ?? []) {
      if (validFacilityIds.has(row.facility_id)) {
        countByAccreditation.set(
          row.accreditation_id,
          (countByAccreditation.get(row.accreditation_id) ?? 0) + 1
        )
      }
    }

    return (accRes.data ?? []).map((a) => ({
      id: a.id,
      name: a.label,
      shortName: a.code,
      facilityCount: countByAccreditation.get(a.id) ?? 0,
      category: 'regulatory' as const,
    }))
  } catch (err) {
    console.error('Error fetching accreditations:', err)
    return []
  }
}

/**
 * Fetch regions from DB with facility counts.
 * Schema: regions (id, iso_code, name, country), facilities (region_id)
 */
export async function fetchStateLocations(): Promise<StateLocation[]> {
  if (!supabase) return []

  try {
    const [regionsRes, facilitiesRes] = await Promise.all([
      supabase.from('regions').select('id, iso_code, name, country').order('name'),
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
    for (const row of facilitiesRes.data ?? []) {
      if (row.region_id) {
        countByRegion.set(
          row.region_id,
          (countByRegion.get(row.region_id) ?? 0) + 1
        )
      }
    }

    return (regionsRes.data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      facilityCount: countByRegion.get(r.id) ?? 0,
      region: 'central' as const,
    }))
  } catch (err) {
    console.error('Error fetching state locations:', err)
    return []
  }
}
