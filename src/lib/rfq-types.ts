import type { Product } from './api-types.js'

export interface ManualRfqProduct {
  id: string
  name: string
  casNumber?: string
  category: null
  supplierMatches: []
  supplierCount: 0
  facilityCount: 0
  isManual: true
}

export type RfqProduct = Product | ManualRfqProduct

export interface ContactProfile {
  name: string
  email: string
  company: string
  phone: string
  country: string
}
