import type { FilterState } from './filterData'

export interface Company {
  id: string
  name: string
  website: string | null
  contactEmail: string | null
}

export interface Region {
  id: string
  name: string
  isoCode: string | null
  country: string | null
}

export interface Facility {
  id: string
  name: string
  address: string | null
  capacityKl: number | null
  latitude: number | null
  longitude: number | null
  company: Company | null
  region: Region | null
}

export interface ProductSupplierMatch {
  facilityProductId: string
  isPrimary: boolean
  facility: Facility
}

export interface Product {
  id: string
  name: string
  casNumber: string
  category: string | null
  supplierMatches: ProductSupplierMatch[]
  supplierCount: number
  facilityCount: number
}

export interface ProductSearchResult {
  id: string
  name: string
  casNumber: string
  category: string | null
  supplierCount: number
  facilityCount: number
}

export interface ProductCategoryFacet {
  value: string
  count: number
}

export type SearchType = 'name' | 'cas'

export interface PaginatedResponse {
  products: ProductSearchResult[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface SearchParams {
  query: string
  searchType: SearchType
  categories: string[]
  filters: FilterState
  page: number
  pageSize: number
  includeMatches?: boolean
}

export interface PlatformStats {
  products: number
  manufacturers: number
  chemistries: number
}

export interface FilterDataResponse {
  chemistries: Array<{
    id: string
    name: string
    facilityCount: number
    slug: string | null
  }>
  accreditations: Array<{
    id: string
    name: string
    shortName: string
    facilityCount: number
  }>
  stateLocations: Array<{
    id: string
    name: string
    facilityCount: number
    isoCode: string | null
  }>
  totalFacilities: number
}

export interface StateFacilityCountResponse {
  locations: Array<{
    locationId: string
    facilityCount: number
  }>
}
