import type {
  PaginatedResponse,
  Product,
  ProductCategoryFacet,
  SearchParams,
} from './api-types'
import { apiJson } from './api'

export type {
  Company,
  Facility,
  PaginatedResponse,
  Product,
  ProductCategoryFacet,
  ProductSupplierMatch,
  Region,
  SearchParams,
  SearchType,
} from './api-types'

let productCategoryFacetCache: ProductCategoryFacet[] | null = null

export function formatProductCategoryLabel(category: string | null | undefined) {
  if (!category) return 'Uncategorized'

  return category
    .split(/[_-\s]+/)
    .filter(Boolean)
    .map((part) => (part.toLowerCase() === 'api' ? 'API' : `${part[0]?.toUpperCase() ?? ''}${part.slice(1).toLowerCase()}`))
    .join(' ')
}

export async function fetchProductCategories(): Promise<ProductCategoryFacet[]> {
  if (productCategoryFacetCache) return productCategoryFacetCache

  try {
    productCategoryFacetCache = await apiJson<ProductCategoryFacet[]>('/api/product-categories')
    return productCategoryFacetCache
  } catch (err) {
    console.error('Error fetching product categories:', err)
    return []
  }
}

export async function searchProductsPaginated(params: SearchParams): Promise<PaginatedResponse> {
  try {
    const searchParams = new URLSearchParams()
    searchParams.set('query', params.query)
    searchParams.set('searchType', params.searchType)
    searchParams.set('page', String(params.page))
    searchParams.set('pageSize', String(params.pageSize))
    if (params.categories.length > 0) searchParams.set('categories', params.categories.join(','))
    searchParams.set('filters', JSON.stringify(params.filters))

    return await apiJson<PaginatedResponse>(`/api/products?${searchParams.toString()}`)
  } catch (err) {
    console.error('Product search error:', err)
    throw err instanceof Error ? err : new Error('Failed to fetch products')
  }
}

export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    return await apiJson<Product>(`/api/products/${encodeURIComponent(id)}`)
  } catch (error) {
    console.error('Error fetching product:', error)
    return undefined
  }
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return []

  try {
    const response = await apiJson<{ products: Product[] }>('/api/products/by-ids', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    })
    return response.products
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}
