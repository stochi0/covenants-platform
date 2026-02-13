// Product Database Schema
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

// Paginated search function (calls API)
export async function searchProductsPaginated(params: SearchParams): Promise<PaginatedResponse> {
  const { query, searchType, categories, page, pageSize } = params
  
  // Build query parameters
  const searchParams = new URLSearchParams({
    query: query.trim(),
    searchType,
    page: page.toString(),
    pageSize: pageSize.toString(),
  })
  
  if (categories.length > 0) {
    searchParams.set('categories', categories.join(','))
  }
  
  const response = await fetch(`/api/products?${searchParams.toString()}`)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch products' }))
    throw new Error(error.error || 'Failed to fetch products')
  }
  
  return response.json()
}

// Get product by ID (calls API)
export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    const response = await fetch(`/api/products/${id}`)
    
    if (!response.ok) {
      if (response.status === 404) {
        return undefined
      }
      throw new Error('Failed to fetch product')
    }
    
    return response.json()
  } catch (error) {
    console.error('Error fetching product:', error)
    return undefined
  }
}

// Get products by IDs (calls API)
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) {
    return []
  }
  
  try {
    const response = await fetch('/api/products/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch products')
    }
    
    const data = await response.json()
    return data.products || []
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}
