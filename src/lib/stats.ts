import { supabase } from './supabase'

export interface PlatformStats {
  products: number
  manufacturers: number
  chemistries: number
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  const defaultStats: PlatformStats = {
    products: 0,
    manufacturers: 0,
    chemistries: 0,
  }

  if (!supabase) {
    return defaultStats
  }

  try {
    const [productsRes, companiesRes, chemistriesRes] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('companies').select('*', { count: 'exact', head: true }),
      supabase.from('chemistries').select('*', { count: 'exact', head: true }),
    ])

    return {
      products: productsRes.count ?? 0,
      manufacturers: companiesRes.count ?? 0,
      chemistries: chemistriesRes.count ?? 0,
    }
  } catch (err) {
    console.error('Error fetching platform stats:', err)
    return defaultStats
  }
}
