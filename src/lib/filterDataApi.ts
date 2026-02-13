import { supabase } from './supabase'
import type {
  Chemistry,
  Accreditation,
  StateLocation,
  ChemistryCategory,
  AccreditationCategory,
  StateRegion,
  FilterState,
} from './filterData'

// Indian state name → geographical region mapping
const STATE_TO_REGION: Record<string, StateRegion> = {
  'Andhra Pradesh': 'south',
  'Arunachal Pradesh': 'northeast',
  Assam: 'northeast',
  Bihar: 'east',
  Chhattisgarh: 'central',
  Goa: 'west',
  Gujarat: 'west',
  Haryana: 'north',
  'Himachal Pradesh': 'north',
  'Jammu and Kashmir': 'north',
  Jharkhand: 'east',
  Karnataka: 'south',
  Kerala: 'south',
  'Madhya Pradesh': 'central',
  Maharashtra: 'west',
  Manipur: 'northeast',
  Meghalaya: 'northeast',
  Mizoram: 'northeast',
  Nagaland: 'northeast',
  Odisha: 'east',
  Punjab: 'north',
  Rajasthan: 'north',
  Sikkim: 'northeast',
  'Tamil Nadu': 'south',
  Telangana: 'south',
  Tripura: 'northeast',
  'Uttar Pradesh': 'north',
  Uttarakhand: 'north',
  'West Bengal': 'east',
  Delhi: 'north',
  India: 'central',
}

// Chemistry slug → category mapping (pharmaceutical process categories)
const CHEMISTRY_SLUG_TO_CATEGORY: Record<string, ChemistryCategory> = {
  acylation: 'synthesis',
  alkylation: 'synthesis',
  amination: 'synthesis',
  bromination: 'synthesis',
  chlorination: 'synthesis',
  chlorosulfonation: 'synthesis',
  condensation: 'synthesis',
  esterification: 'synthesis',
  fluorination: 'synthesis',
  'friedel-craft': 'synthesis',
  grignard: 'synthesis',
  'halide-exchange': 'synthesis',
  'hoffman-degradation': 'synthesis',
  hydrogenation: 'synthesis',
  hydrolysis: 'synthesis',
  iodination: 'synthesis',
  nitration: 'synthesis',
  oxidation: 'synthesis',
  phosgenation: 'synthesis',
  reduction: 'synthesis',
  sulphonation: 'synthesis',
  thiophosgenation: 'synthesis',
  carboxilation: 'synthesis',
  cannizzaro: 'synthesis',
  'cyclization-high-temp': 'synthesis',
  diazotization: 'synthesis',
  'high-temp-reactions': 'synthesis',
  perkin: 'synthesis',
  'column-chromatography': 'extraction',
  'high-vacuum-distillation': 'extraction',
  lyophilisation: 'biotechnology',
  isomerization: 'biotechnology',
  'chiral-chemistry': 'specialty',
  'birch-reduction': 'specialty',
  'heck-reaction': 'specialty',
  'photochemical-reaction': 'specialty',
  'reductive-cyclization': 'specialty',
  'sand-meyer': 'specialty',
  ozonolysis: 'specialty',
  'cryogenic-reaction': 'specialty',
  neutralization: 'specialty',
}

// Accreditation code → category mapping
const ACCREDITATION_CODE_TO_CATEGORY: Record<string, AccreditationCategory> = {
  USFDA: 'regulatory',
  EDQM: 'regulatory',
  'WHO-GMP': 'regulatory',
  'State-GMP': 'regulatory',
  PMDA: 'international',
  TGA: 'international',
  ANVISA: 'international',
  Cofepris: 'international',
  AIFA: 'international',
  'ISO-9001': 'quality',
  nGMP: 'quality',
  GLP: 'quality',
}

function getStateRegion(stateName: string): StateRegion {
  return STATE_TO_REGION[stateName] ?? 'central'
}

function getChemistryCategory(slug: string): ChemistryCategory {
  return CHEMISTRY_SLUG_TO_CATEGORY[slug.toLowerCase()] ?? 'specialty'
}

function getAccreditationCategory(code: string): AccreditationCategory {
  return ACCREDITATION_CODE_TO_CATEGORY[code] ?? 'regulatory'
}

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
      category: getChemistryCategory(c.slug),
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
      category: getAccreditationCategory(a.code),
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
      region: getStateRegion(r.name),
    }))
  } catch (err) {
    console.error('Error fetching state locations:', err)
    return []
  }
}

/**
 * Count facilities that have ALL of the given accreditations.
 * Returns total facilities when ids is empty.
 */
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
    const validFacilityIds = new Set((activeFacilities ?? []).map((f) => f.id))

    const facilityToAccCount = new Map<string, Set<string>>()
    for (const row of faRows ?? []) {
      if (!validFacilityIds.has(row.facility_id)) continue
      let set = facilityToAccCount.get(row.facility_id)
      if (!set) {
        set = new Set()
        facilityToAccCount.set(row.facility_id, set)
      }
      set.add(row.accreditation_id)
    }

    const requiredCount = accreditationIds.length
    let count = 0
    for (const [, accSet] of facilityToAccCount) {
      if (accSet.size === requiredCount) count++
    }
    return count
  } catch (err) {
    console.error('Error fetching facility count by accreditations:', err)
    return 0
  }
}

/**
 * Count facilities that have ALL of the given chemistries.
 * Returns total facilities when ids is empty.
 */
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
    const validFacilityIds = new Set((activeFacilities ?? []).map((f) => f.id))

    const facilityToChemCount = new Map<string, Set<string>>()
    for (const row of fcRows ?? []) {
      if (!validFacilityIds.has(row.facility_id)) continue
      let set = facilityToChemCount.get(row.facility_id)
      if (!set) {
        set = new Set()
        facilityToChemCount.set(row.facility_id, set)
      }
      set.add(row.chemistry_id)
    }

    const requiredCount = chemistryIds.length
    let count = 0
    for (const [, chemSet] of facilityToChemCount) {
      if (chemSet.size === requiredCount) count++
    }
    return count
  } catch (err) {
    console.error('Error fetching facility count by chemistries:', err)
    return 0
  }
}

/**
 * Count facilities matching ALL filters (locations + accreditations + chemistries).
 */
export async function fetchFacilityCountByFilters(filters: FilterState): Promise<number> {
  if (!supabase) return 0
  const { chemistries: chemIds, accreditations: accIds, locations: locIds } = filters
  if (chemIds.length === 0 && accIds.length === 0 && locIds.length === 0) {
    return fetchTotalFacilities()
  }

  try {
    const { data: facilities, error: fError } = await supabase
      .from('facilities')
      .select('id, region_id')
      .eq('is_active', true)
      .is('deleted_at', null)

    if (fError) throw fError
    let facilityIds = new Set((facilities ?? []).map((f) => f.id))

    if (locIds.length > 0) {
      const inSelectedRegions = new Set(
        (facilities ?? []).filter((f) => f.region_id && locIds.includes(f.region_id)).map((f) => f.id)
      )
      facilityIds = new Set([...facilityIds].filter((id) => inSelectedRegions.has(id)))
    }

    if (accIds.length > 0) {
      const { data: faRows, error: faError } = await supabase
        .from('facility_accreditations')
        .select('facility_id, accreditation_id')
        .in('accreditation_id', accIds)

      if (faError) throw faError
      const facilityToAcc = new Map<string, Set<string>>()
      for (const row of faRows ?? []) {
        if (!facilityIds.has(row.facility_id)) continue
        let set = facilityToAcc.get(row.facility_id)
        if (!set) {
          set = new Set()
          facilityToAcc.set(row.facility_id, set)
        }
        set.add(row.accreditation_id)
      }
      facilityIds = new Set(
        [...facilityIds].filter((id) => facilityToAcc.get(id)?.size === accIds.length)
      )
    }

    if (chemIds.length > 0) {
      const { data: fcRows, error: fcError } = await supabase
        .from('facility_chemistries')
        .select('facility_id, chemistry_id')
        .in('chemistry_id', chemIds)

      if (fcError) throw fcError
      const facilityToChem = new Map<string, Set<string>>()
      for (const row of fcRows ?? []) {
        if (!facilityIds.has(row.facility_id)) continue
        let set = facilityToChem.get(row.facility_id)
        if (!set) {
          set = new Set()
          facilityToChem.set(row.facility_id, set)
        }
        set.add(row.chemistry_id)
      }
      facilityIds = new Set(
        [...facilityIds].filter((id) => facilityToChem.get(id)?.size === chemIds.length)
      )
    }

    return facilityIds.size
  } catch (err) {
    console.error('Error fetching facility count by filters:', err)
    return 0
  }
}
