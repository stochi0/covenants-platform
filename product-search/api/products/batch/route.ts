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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. Expected an array of product IDs.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseServer
      .from('products')
      .select('*')
      .in('id', ids)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch products', details: error.message },
        { status: 500 }
      )
    }

    const products = (data || []).map(mapProduct)

    return NextResponse.json({ products })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
