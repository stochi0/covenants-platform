import { supabase } from './supabase'

// Product Database Schema (matches Supabase products table)
export interface Product {
  id: string
  name: string
  casNumber: string
  category: 'api' | 'impurity' | 'intermediate' | 'chemical'
}

// Search types
export type SearchType = 'name' | 'cas'

// Paginated response
export interface PaginatedResponse {
  products: Product[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Search params
export interface SearchParams {
  query: string
  searchType: SearchType
  categories: string[]
  page: number
  pageSize: number
}

// Category display info
export const categoryInfo = {
  api: {
    label: 'API',
    fullName: 'Active Pharmaceutical Ingredient',
    color: 'primary',
    icon: 'FlaskConical',
  },
  impurity: {
    label: 'Impurity',
    fullName: 'Reference Standard / Impurity',
    color: 'accent',
    icon: 'TestTubes',
  },
  intermediate: {
    label: 'Intermediate',
    fullName: 'Pharmaceutical Intermediate',
    color: 'primary',
    icon: 'Beaker',
  },
  chemical: {
    label: 'Chemical',
    fullName: 'Specialty Chemical / Excipient',
    color: 'accent',
    icon: 'Layers',
  },
}

// Map DB row to frontend Product
function mapRow(row: { id: string; product_name: string; cas_number: string; category: Product['category'] }): Product {
  return {
    id: row.id,
    name: row.product_name,
    casNumber: row.cas_number,
    category: row.category,
  }
}

// Paginated search using Supabase client (Vite – no Next.js API)
export async function searchProductsPaginated(params: SearchParams): Promise<PaginatedResponse> {
  const { query, searchType, categories, page, pageSize } = params

  if (!supabase) {
    return {
      products: [],
      total: 0,
      page,
      pageSize,
      hasMore: false,
    }
  }

  try {
    let q = supabase
      .from('products')
      .select('*', { count: 'exact' })

    if (categories.length > 0) {
      q = q.in('category', categories)
    }

    if (query.trim()) {
      if (searchType === 'cas') {
        q = q.ilike('cas_number', `%${query.trim()}%`)
      } else {
        q = q.ilike('product_name', `%${query.trim()}%`)
      }
    }

    if (query.trim()) {
      if (searchType === 'cas') {
        q = q.order('cas_number', { ascending: true })
      } else {
        q = q.order('product_name', { ascending: true })
      }
    } else {
      q = q.order('product_name', { ascending: true })
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    q = q.range(from, to)

    const { data, error, count } = await q

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(error.message || 'Failed to fetch products')
    }

    const products = (data || []).map(mapRow)

    // Client-side sort for exact match prioritization
    let sortedProducts = products
    if (query.trim()) {
      const searchTerm = query.toLowerCase().trim()
      sortedProducts = [...products].sort((a, b) => {
        if (searchType === 'cas') {
          const aExact = a.casNumber.toLowerCase() === searchTerm
          const bExact = b.casNumber.toLowerCase() === searchTerm
          if (aExact && !bExact) return -1
          if (!aExact && bExact) return 1
          const aStarts = a.casNumber.toLowerCase().startsWith(searchTerm)
          const bStarts = b.casNumber.toLowerCase().startsWith(searchTerm)
          if (aStarts && !bStarts) return -1
          if (!aStarts && bStarts) return 1
        } else {
          const aExact = a.name.toLowerCase() === searchTerm
          const bExact = b.name.toLowerCase() === searchTerm
          if (aExact && !bExact) return -1
          if (!aExact && bExact) return 1
          const aStarts = a.name.toLowerCase().startsWith(searchTerm)
          const bStarts = b.name.toLowerCase().startsWith(searchTerm)
          if (aStarts && !bStarts) return -1
          if (!aStarts && bStarts) return 1
        }
        return a.name.localeCompare(b.name)
      })
    }

    const total = count ?? 0
    const hasMore = to < total - 1

    return {
      products: sortedProducts,
      total,
      page,
      pageSize,
      hasMore,
    }
  } catch (err) {
    console.error('Product search error:', err)
    throw err instanceof Error ? err : new Error('Failed to fetch products')
  }
}

// Get product by ID via Supabase client
export async function getProductById(id: string): Promise<Product | undefined> {
  if (!supabase) return undefined

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return undefined
      throw new Error(error.message)
    }
    return data ? mapRow(data) : undefined
  } catch (error) {
    console.error('Error fetching product:', error)
    return undefined
  }
}

// Get products by IDs via Supabase client
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0 || !supabase) return []

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('id', ids)

    if (error) throw new Error(error.message)
    return (data || []).map(mapRow)
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}
