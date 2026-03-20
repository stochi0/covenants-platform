import { supabase } from './supabase'

export interface Product {
  id: string
  name: string
  casNumber: string
  category: string | null
}

export interface ProductCategoryFacet {
  value: string
  count: number
}

export type SearchType = 'name' | 'cas'

export interface PaginatedResponse {
  products: Product[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface SearchParams {
  query: string
  searchType: SearchType
  categories: string[]
  page: number
  pageSize: number
}

function mapRow(row: {
  id: string
  product_name: string | null
  cas_number: string | null
  category: string | null
}): Product {
  return {
    id: row.id,
    name: row.product_name ?? 'Unnamed product',
    casNumber: row.cas_number ?? 'N/A',
    category: row.category,
  }
}

export function formatProductCategoryLabel(category: string | null | undefined) {
  if (!category) return 'Uncategorized'

  return category
    .split(/[_-\s]+/)
    .filter(Boolean)
    .map((part) => (part.toLowerCase() === 'api' ? 'API' : `${part[0]?.toUpperCase() ?? ''}${part.slice(1).toLowerCase()}`))
    .join(' ')
}

export async function fetchProductCategories(): Promise<ProductCategoryFacet[]> {
  if (!supabase) return []

  try {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null)

    if (error) throw error

    const countByCategory = new Map<string, number>()
    for (const row of data ?? []) {
      if (!row.category) continue
      countByCategory.set(row.category, (countByCategory.get(row.category) ?? 0) + 1)
    }

    return [...countByCategory.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
  } catch (err) {
    console.error('Error fetching product categories:', err)
    return []
  }
}

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
    let q = supabase.from('products').select('*', { count: 'exact' })

    if (categories.length > 0) {
      q = q.in('category', categories)
    }

    if (query.trim()) {
      q = searchType === 'cas'
        ? q.ilike('cas_number', `%${query.trim()}%`)
        : q.ilike('product_name', `%${query.trim()}%`)
    }

    q = searchType === 'cas'
      ? q.order('cas_number', { ascending: true })
      : q.order('product_name', { ascending: true })

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    q = q.range(from, to)

    const { data, error, count } = await q

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(error.message || 'Failed to fetch products')
    }

    const products = (data ?? []).map(mapRow)
    const searchTerm = query.toLowerCase().trim()

    const sortedProducts = searchTerm
      ? [...products].sort((a, b) => {
          const aSource = searchType === 'cas' ? a.casNumber : a.name
          const bSource = searchType === 'cas' ? b.casNumber : b.name
          const aLower = aSource.toLowerCase()
          const bLower = bSource.toLowerCase()
          const aExact = aLower === searchTerm
          const bExact = bLower === searchTerm
          if (aExact !== bExact) return aExact ? -1 : 1
          const aStarts = aLower.startsWith(searchTerm)
          const bStarts = bLower.startsWith(searchTerm)
          if (aStarts !== bStarts) return aStarts ? -1 : 1
          return a.name.localeCompare(b.name)
        })
      : products

    const total = count ?? 0

    return {
      products: sortedProducts,
      total,
      page,
      pageSize,
      hasMore: to < total - 1,
    }
  } catch (err) {
    console.error('Product search error:', err)
    throw err instanceof Error ? err : new Error('Failed to fetch products')
  }
}

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

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0 || !supabase) return []

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('id', ids)

    if (error) throw new Error(error.message)
    return (data ?? []).map(mapRow)
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}
