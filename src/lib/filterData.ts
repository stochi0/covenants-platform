export interface FilterState {
  chemistries: string[]
  accreditations: string[]
  locations: string[]
}

export interface Chemistry {
  id: string
  name: string
  facilityCount: number
  slug?: string | null
}

export interface Accreditation {
  id: string
  name: string
  shortName: string
  facilityCount: number
}

export interface StateLocation {
  id: string
  name: string
  facilityCount: number
  isoCode?: string | null
}
