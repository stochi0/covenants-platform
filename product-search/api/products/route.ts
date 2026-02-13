import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

// Database product type (matches Supabase schema)
interface DbProduct {
  id: string
  product_name: string
  cas_number: string
  category: 'api' | 'impurity' | 'intermediate' | 'chemical'
  created_at: string
  updated_at: string
}

// Frontend product type (mapped from DB)
interface Product {
  id: string
  name: string
  casNumber: string
  category: 'api' | 'impurity' | 'intermediate' | 'chemical'
}

// Map DB product to frontend product
function mapProduct(dbProduct: DbProduct): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.product_name,
    casNumber: dbProduct.cas_number,
    category: dbProduct.category,
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query') || ''
    const searchType = searchParams.get('searchType') || 'name'
    const categories = searchParams.get('categories')?.split(',').filter(Boolean) || []
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10)

    // Build query
    let supabaseQuery = supabaseServer
      .from('products')
      .select('*', { count: 'exact' })

    // Apply category filter
    if (categories.length > 0) {
      supabaseQuery = supabaseQuery.in('category', categories)
    }

    // Apply search filter
    if (query.trim()) {
      if (searchType === 'cas') {
        // CAS number search - use case-insensitive pattern matching
        supabaseQuery = supabaseQuery.ilike('cas_number', `%${query.trim()}%`)
      } else {
        // Product name search - use case-insensitive pattern matching
        supabaseQuery = supabaseQuery.ilike('product_name', `%${query.trim()}%`)
      }
    }

    // Order by: exact matches first, then by name
    if (query.trim()) {
      if (searchType === 'cas') {
        supabaseQuery = supabaseQuery.order('cas_number', { ascending: true })
      } else {
        supabaseQuery = supabaseQuery.order('product_name', { ascending: true })
      }
    } else {
      supabaseQuery = supabaseQuery.order('product_name', { ascending: true })
    }

    // Pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    supabaseQuery = supabaseQuery.range(from, to)

    // Execute query
    const { data, error, count } = await supabaseQuery

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch products', details: error.message },
        { status: 500 }
      )
    }

    // Map products
    const products = (data || []).map(mapProduct)

    // Sort results client-side for better exact match prioritization
    let sortedProducts = products
    if (query.trim()) {
      const searchTerm = query.toLowerCase().trim()
      sortedProducts = products.sort((a, b) => {
        if (searchType === 'cas') {
          // Exact CAS match first
          const aExact = a.casNumber.toLowerCase() === searchTerm
          const bExact = b.casNumber.toLowerCase() === searchTerm
          if (aExact && !bExact) return -1
          if (!aExact && bExact) return 1
          // Then starts with
          const aStarts = a.casNumber.toLowerCase().startsWith(searchTerm)
          const bStarts = b.casNumber.toLowerCase().startsWith(searchTerm)
          if (aStarts && !bStarts) return -1
          if (!aStarts && bStarts) return 1
        } else {
          // Exact name match first
          const aExact = a.name.toLowerCase() === searchTerm
          const bExact = b.name.toLowerCase() === searchTerm
          if (aExact && !bExact) return -1
          if (!aExact && bExact) return 1
          // Then starts with
          const aStarts = a.name.toLowerCase().startsWith(searchTerm)
          const bStarts = b.name.toLowerCase().startsWith(searchTerm)
          if (aStarts && !bStarts) return -1
          if (!aStarts && bStarts) return 1
        }
        // Finally alphabetically by name
        return a.name.localeCompare(b.name)
      })
    }

    const total = count || 0
    const hasMore = to < total - 1

    return NextResponse.json({
      products: sortedProducts,
      total,
      page,
      pageSize,
      hasMore,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
