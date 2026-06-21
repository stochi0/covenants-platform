import type {
  PaginatedResponse,
  Product,
  ProductCategoryFacet,
  SearchParams,
} from './api-types'
import { apiJson, type AuthTokenGetter } from './api'

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

export async function fetchProductCategories(getToken: AuthTokenGetter): Promise<ProductCategoryFacet[]> {
  if (productCategoryFacetCache) return productCategoryFacetCache

  try {
    productCategoryFacetCache = await apiJson<ProductCategoryFacet[]>(getToken, '/api/product-categories')
    return productCategoryFacetCache
  } catch (err) {
    console.error('Error fetching product categories:', err)
    return []
  }
}

export async function searchProductsPaginated(getToken: AuthTokenGetter, params: SearchParams): Promise<PaginatedResponse> {
  try {
    const searchParams = new URLSearchParams()
    searchParams.set('query', params.query)
    searchParams.set('searchType', params.searchType)
    searchParams.set('page', String(params.page))
    searchParams.set('pageSize', String(params.pageSize))
    if (params.categories.length > 0) searchParams.set('categories', params.categories.join(','))
    searchParams.set('filters', JSON.stringify(params.filters))

    return await apiJson<PaginatedResponse>(getToken, `/api/products?${searchParams.toString()}`)
  } catch (err) {
    console.error('Product search error:', err)
    throw err instanceof Error ? err : new Error('Failed to fetch products')
  }
}

export async function getProductById(getToken: AuthTokenGetter, id: string): Promise<Product | undefined> {
  try {
    return await apiJson<Product>(getToken, `/api/products/${encodeURIComponent(id)}`)
  } catch (error) {
    console.error('Error fetching product:', error)
    return undefined
  }
}

export async function getProductsByIds(getToken: AuthTokenGetter, ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return []

  try {
    const response = await apiJson<{ products: Product[] }>(getToken, '/api/products/by-ids', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    })
    return response.products
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}
