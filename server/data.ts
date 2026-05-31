import type { Request, Response } from 'express'
import { dbOne, dbQuery } from './db.ts'
import type {
  FilterDataResponse,
  PaginatedResponse,
  PlatformStats,
  Product,
  ProductCategoryFacet,
  ProductSupplierMatch,
  SearchParams,
  StateFacilityCountResponse,
} from '../src/lib/api-types.ts'
import type { FilterState } from '../src/lib/filterData.ts'

const PRODUCT_CATEGORY_ORDER = ['api', 'intermediate', 'chemical', 'impurity'] as const

interface CountRow {
  value: string
}

interface ProductRow {
  id: string
  product_name: string | null
  cas_number: string | null
  category: string | null
}

interface ProductMatchRow {
  product_id: string
  facility_id: string
  is_primary: boolean | null
  facility_name: string | null
  address: string | null
  capacity_kl: string | number | null
  latitude: number | null
  longitude: number | null
  company_id: string | null
  company_name: string | null
  website: string | null
  contact_email: string | null
  region_id: string | null
  region_name: string | null
  iso_code: string | null
  country: string | null
}

function toNumber(value: string | number | null): number | null {
  if (value === null) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function parseArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.length > 0)
}

function parsePositiveInt(value: unknown, fallback: number, max = 100): number {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) return fallback
  return Math.min(parsed, max)
}

function parseFilters(value: unknown): FilterState {
  if (!value || typeof value !== 'object') {
    return { chemistries: [], accreditations: [], locations: [] }
  }

  const filters = value as Record<string, unknown>
  return {
    chemistries: parseArray(filters.chemistries),
    accreditations: parseArray(filters.accreditations),
    locations: parseArray(filters.locations),
  }
}

function mapProduct(row: ProductRow, matches: ProductSupplierMatch[] = []): Product {
  const supplierIds = new Set(
    matches.map((match) => match.facility.company?.id).filter((id): id is string => Boolean(id))
  )

  return {
    id: row.id,
    name: row.product_name ?? 'Unnamed product',
    casNumber: row.cas_number ?? 'N/A',
    category: row.category,
    supplierMatches: matches,
    supplierCount: supplierIds.size,
    facilityCount: matches.length,
  }
}

function mapMatch(row: ProductMatchRow): ProductSupplierMatch {
  return {
    facilityProductId: `${row.facility_id}:${row.product_id}`,
    isPrimary: Boolean(row.is_primary),
    facility: {
      id: row.facility_id,
      name: row.facility_name ?? 'Unnamed facility',
      address: row.address,
      capacityKl: toNumber(row.capacity_kl),
      latitude: row.latitude,
      longitude: row.longitude,
      company: row.company_id
        ? {
            id: row.company_id,
            name: row.company_name ?? 'Unnamed company',
            website: row.website,
            contactEmail: row.contact_email,
          }
        : null,
      region: row.region_id
        ? {
            id: row.region_id,
            name: row.region_name ?? 'Unknown region',
            isoCode: row.iso_code,
            country: row.country,
          }
        : null,
    },
  }
}

function sortMatches(matches: ProductSupplierMatch[]): ProductSupplierMatch[] {
  return [...matches].sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1
    const aCompany = a.facility.company?.name ?? ''
    const bCompany = b.facility.company?.name ?? ''
    return aCompany.localeCompare(bCompany) || a.facility.name.localeCompare(b.facility.name)
  })
}

function productWhereSql(params: SearchParams): { joins: string; where: string[]; values: unknown[] } {
  const values: unknown[] = []
  const where: string[] = []
  const filters = params.filters

  if (params.categories.length > 0) {
    values.push(params.categories)
    where.push(`p.category::text = any($${values.length}::text[])`)
  }

  const trimmedQuery = params.query.trim()
  if (trimmedQuery) {
    values.push(`%${trimmedQuery}%`)
    where.push(params.searchType === 'cas'
      ? `p.cas_number ilike $${values.length}`
      : `p.product_name ilike $${values.length}`)
  }

  if (filters.locations.length > 0) {
    values.push(filters.locations)
    where.push(`
      exists (
        select 1
        from facility_products fp_location
        join facilities f_location on f_location.id = fp_location.facility_id
        where fp_location.product_id = p.id
          and f_location.is_active = true
          and f_location.deleted_at is null
          and f_location.region_id = any($${values.length}::text[])
      )
    `)
  }

  for (const chemistryId of filters.chemistries) {
    values.push(chemistryId)
    where.push(`
      exists (
        select 1
        from facility_products fp_chem
        join facilities f_chem on f_chem.id = fp_chem.facility_id
        join facility_chemistries fc_filter on fc_filter.facility_id = f_chem.id
        where fp_chem.product_id = p.id
          and f_chem.is_active = true
          and f_chem.deleted_at is null
          and fc_filter.chemistry_id = $${values.length}
      )
    `)
  }

  for (const accreditationId of filters.accreditations) {
    values.push(accreditationId)
    where.push(`
      exists (
        select 1
        from facility_products fp_acc
        join facilities f_acc on f_acc.id = fp_acc.facility_id
        join facility_accreditations fa_filter on fa_filter.facility_id = f_acc.id
        where fp_acc.product_id = p.id
          and f_acc.is_active = true
          and f_acc.deleted_at is null
          and fa_filter.accreditation_id = $${values.length}
      )
    `)
  }

  return { joins: '', where, values }
}

async function fetchSupplierMatches(productIds: string[], filters: FilterState | null): Promise<Map<string, ProductSupplierMatch[]>> {
  if (productIds.length === 0) return new Map()

  const values: unknown[] = [productIds]
  const where = [
    'fp.product_id = any($1::text[])',
    'f.is_active = true',
    'f.deleted_at is null',
  ]

  if (filters && filters.locations.length > 0) {
    values.push(filters.locations)
    where.push(`f.region_id = any($${values.length}::text[])`)
  }

  for (const chemistryId of filters?.chemistries ?? []) {
    values.push(chemistryId)
    where.push(`
      exists (
        select 1
        from facility_chemistries fc_match
        where fc_match.facility_id = f.id
          and fc_match.chemistry_id = $${values.length}
      )
    `)
  }

  for (const accreditationId of filters?.accreditations ?? []) {
    values.push(accreditationId)
    where.push(`
      exists (
        select 1
        from facility_accreditations fa_match
        where fa_match.facility_id = f.id
          and fa_match.accreditation_id = $${values.length}
      )
    `)
  }

  const rows = await dbQuery<ProductMatchRow>(`
    select
      fp.product_id,
      fp.facility_id,
      fp.is_primary,
      f.name as facility_name,
      f.address,
      f.capacity_kl,
      f.latitude,
      f.longitude,
      c.id as company_id,
      c.name as company_name,
      c.website,
      c.contact_email,
      r.id as region_id,
      r.name as region_name,
      r.iso_code,
      r.country
    from facility_products fp
    join facilities f on f.id = fp.facility_id
    left join companies c on c.id = f.company_id
    left join regions r on r.id = f.region_id
    where ${where.join(' and ')}
  `, values)

  const matchesByProduct = new Map<string, ProductSupplierMatch[]>()
  for (const row of rows) {
    const matches = matchesByProduct.get(row.product_id) ?? []
    matches.push(mapMatch(row))
    matchesByProduct.set(row.product_id, matches)
  }

  for (const [productId, matches] of matchesByProduct) {
    matchesByProduct.set(productId, sortMatches(matches))
  }

  return matchesByProduct
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const [products, companies, chemistries] = await Promise.all([
    dbOne<CountRow>('select count(*)::text as value from products'),
    dbOne<CountRow>('select count(*)::text as value from companies'),
    dbOne<CountRow>('select count(*)::text as value from chemistries'),
  ])

  return {
    products: Number(products?.value ?? 0),
    manufacturers: Number(companies?.value ?? 0),
    chemistries: Number(chemistries?.value ?? 0),
  }
}

export async function getFilterData(): Promise<FilterDataResponse> {
  const [totalFacilities, chemistries, accreditations, stateLocations] = await Promise.all([
    dbOne<CountRow>(`
      select count(*)::text as value
      from facilities
      where is_active = true and deleted_at is null
    `),
    dbQuery<{ id: string; name: string; slug: string | null; facility_count: string }>(`
      select c.id, c.label as name, c.slug, count(distinct f.id)::text as facility_count
      from chemistries c
      left join facility_chemistries fc on fc.chemistry_id = c.id
      left join facilities f on f.id = fc.facility_id and f.is_active = true and f.deleted_at is null
      group by c.id, c.label, c.slug
      order by c.label
    `),
    dbQuery<{ id: string; name: string; short_name: string; facility_count: string }>(`
      select a.id, a.label as name, a.code as short_name, count(distinct f.id)::text as facility_count
      from accreditations a
      left join facility_accreditations fa on fa.accreditation_id = a.id
      left join facilities f on f.id = fa.facility_id and f.is_active = true and f.deleted_at is null
      group by a.id, a.label, a.code
      order by a.label
    `),
    dbQuery<{ id: string; name: string; iso_code: string | null; facility_count: string }>(`
      select r.id, r.name, r.iso_code, count(distinct f.id)::text as facility_count
      from regions r
      left join facilities f on f.region_id = r.id and f.is_active = true and f.deleted_at is null
      where r.country = 'IN'
      group by r.id, r.name, r.iso_code
      order by r.name
    `),
  ])

  return {
    totalFacilities: Number(totalFacilities?.value ?? 0),
    chemistries: chemistries.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      facilityCount: Number(row.facility_count),
    })),
    accreditations: accreditations.map((row) => ({
      id: row.id,
      name: row.name,
      shortName: row.short_name,
      facilityCount: Number(row.facility_count),
    })),
    stateLocations: stateLocations.map((row) => ({
      id: row.id,
      name: row.name,
      isoCode: row.iso_code,
      facilityCount: Number(row.facility_count),
    })),
  }
}

export async function getProductCategories(): Promise<ProductCategoryFacet[]> {
  const rows = await dbQuery<{ category: string; count: string }>(`
    select category, count(*)::text as count
    from products
    where category is not null
    group by category
  `)
  const countByCategory = new Map(rows.map((row) => [row.category, Number(row.count)]))

  return PRODUCT_CATEGORY_ORDER
    .map((category) => ({ value: category, count: countByCategory.get(category) ?? 0 }))
    .filter((category) => category.count > 0)
}

export async function searchProducts(params: SearchParams): Promise<PaginatedResponse> {
  const normalizedParams: SearchParams = {
    ...params,
    page: Math.max(params.page, 1),
    pageSize: Math.min(Math.max(params.pageSize, 1), 100),
  }
  const { where, values } = productWhereSql(normalizedParams)
  const whereSql = where.length > 0 ? `where ${where.join(' and ')}` : ''
  const orderSql = normalizedParams.searchType === 'cas'
    ? 'order by p.cas_number asc nulls last, p.product_name asc nulls last'
    : 'order by p.product_name asc nulls last, p.cas_number asc nulls last'

  const countRow = await dbOne<CountRow>(`
    select count(*)::text as value
    from products p
    ${whereSql}
  `, values)

  const offset = (normalizedParams.page - 1) * normalizedParams.pageSize
  const productValues = [...values, normalizedParams.pageSize, offset]
  const productRows = await dbQuery<ProductRow>(`
    select p.id, p.product_name, p.cas_number, p.category
    from products p
    ${whereSql}
    ${orderSql}
    limit $${productValues.length - 1}
    offset $${productValues.length}
  `, productValues)

  const productIds = productRows.map((product) => product.id)
  const hasFilters = normalizedParams.filters.chemistries.length > 0
    || normalizedParams.filters.accreditations.length > 0
    || normalizedParams.filters.locations.length > 0
  const matchesByProduct = await fetchSupplierMatches(productIds, hasFilters ? normalizedParams.filters : null)
  const searchTerm = normalizedParams.query.toLowerCase().trim()
  const products = productRows.map((row) => mapProduct(row, matchesByProduct.get(row.id) ?? []))
  const sortedProducts = searchTerm
    ? [...products].sort((a, b) => {
        const aSource = normalizedParams.searchType === 'cas' ? a.casNumber : a.name
        const bSource = normalizedParams.searchType === 'cas' ? b.casNumber : b.name
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
  const total = Number(countRow?.value ?? 0)

  return {
    products: sortedProducts,
    total,
    page: normalizedParams.page,
    pageSize: normalizedParams.pageSize,
    hasMore: offset + normalizedParams.pageSize < total,
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const product = await dbOne<ProductRow>(
    'select id, product_name, cas_number, category from products where id = $1',
    [id]
  )
  if (!product) return null

  const matchesByProduct = await fetchSupplierMatches([id], null)
  return mapProduct(product, matchesByProduct.get(id) ?? [])
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return []
  const rows = await dbQuery<ProductRow>(`
    select id, product_name, cas_number, category
    from products
    where id = any($1::text[])
  `, [ids])
  const matchesByProduct = await fetchSupplierMatches(ids, null)
  return rows.map((row) => mapProduct(row, matchesByProduct.get(row.id) ?? []))
}

export async function getFacilityCountByFilters(filters: FilterState): Promise<number> {
  const values: unknown[] = []
  const where = ['f.is_active = true', 'f.deleted_at is null']

  if (filters.locations.length > 0) {
    values.push(filters.locations)
    where.push(`f.region_id = any($${values.length}::text[])`)
  }

  for (const chemistryId of filters.chemistries) {
    values.push(chemistryId)
    where.push(`
      exists (
        select 1 from facility_chemistries fc
        where fc.facility_id = f.id and fc.chemistry_id = $${values.length}
      )
    `)
  }

  for (const accreditationId of filters.accreditations) {
    values.push(accreditationId)
    where.push(`
      exists (
        select 1 from facility_accreditations fa
        where fa.facility_id = f.id and fa.accreditation_id = $${values.length}
      )
    `)
  }

  const row = await dbOne<CountRow>(`
    select count(*)::text as value
    from facilities f
    where ${where.join(' and ')}
  `, values)

  return Number(row?.value ?? 0)
}

export async function getStateFacilityCountsByFilters(
  filters: Pick<FilterState, 'chemistries' | 'accreditations'>
): Promise<StateFacilityCountResponse> {
  const values: unknown[] = []
  const where = ['f.is_active = true', 'f.deleted_at is null', 'f.region_id is not null']

  for (const chemistryId of filters.chemistries) {
    values.push(chemistryId)
    where.push(`
      exists (
        select 1 from facility_chemistries fc
        where fc.facility_id = f.id and fc.chemistry_id = $${values.length}
      )
    `)
  }

  for (const accreditationId of filters.accreditations) {
    values.push(accreditationId)
    where.push(`
      exists (
        select 1 from facility_accreditations fa
        where fa.facility_id = f.id and fa.accreditation_id = $${values.length}
      )
    `)
  }

  if (values.length === 0) return { locations: [] }

  const rows = await dbQuery<{ location_id: string; facility_count: string }>(`
    select f.region_id as location_id, count(*)::text as facility_count
    from facilities f
    where ${where.join(' and ')}
    group by f.region_id
  `, values)

  return {
    locations: rows.map((row) => ({
      locationId: row.location_id,
      facilityCount: Number(row.facility_count),
    })),
  }
}

export function parseSearchParams(body: unknown): SearchParams {
  const raw = body && typeof body === 'object' ? body as Record<string, unknown> : {}
  return {
    query: typeof raw.query === 'string' ? raw.query : '',
    searchType: raw.searchType === 'cas' ? 'cas' : 'name',
    categories: parseArray(raw.categories),
    filters: parseFilters(raw.filters),
    page: parsePositiveInt(raw.page, 1),
    pageSize: parsePositiveInt(raw.pageSize, 24),
  }
}

function queryStringValue(value: unknown): string | undefined {
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : undefined
  return typeof value === 'string' ? value : undefined
}

function queryStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string' && item.length > 0)
  if (typeof value !== 'string' || !value) return []
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

export function parseSearchQuery(query: Record<string, unknown>): SearchParams {
  const filterText = queryStringValue(query.filters)
  const parsedFilters = (() => {
    if (!filterText) return null
    try {
      return JSON.parse(filterText) as unknown
    } catch {
      return null
    }
  })()

  return {
    query: queryStringValue(query.query) ?? '',
    searchType: queryStringValue(query.searchType) === 'cas' ? 'cas' : 'name',
    categories: queryStringArray(query.categories),
    filters: parseFilters(parsedFilters),
    page: parsePositiveInt(queryStringValue(query.page), 1),
    pageSize: parsePositiveInt(queryStringValue(query.pageSize), 24),
  }
}

export function sendJson(res: Response, status: number, body: unknown) {
  res.status(status).json(body)
}

export function sendError(res: Response, error: unknown) {
  const details = error instanceof Error ? error.message : 'Unknown error'
  res.status(500).json({ error: 'Database request failed', details })
}

export async function handleDataRequest(req: Request, res: Response) {
  try {
    if (req.method === 'GET' && req.path === '/api/stats') {
      sendJson(res, 200, await getPlatformStats())
      return
    }

    if (req.method === 'GET' && req.path === '/api/filters') {
      sendJson(res, 200, await getFilterData())
      return
    }

    if (req.method === 'GET' && req.path === '/api/product-categories') {
      sendJson(res, 200, await getProductCategories())
      return
    }

    if (req.method === 'POST' && req.path === '/api/products/search') {
      sendJson(res, 200, await searchProducts(parseSearchParams(req.body)))
      return
    }

    if (req.method === 'GET' && req.path === '/api/products') {
      sendJson(res, 200, await searchProducts(parseSearchQuery(req.query)))
      return
    }

    if (req.method === 'POST' && req.path === '/api/products/by-ids') {
      const ids = req.body && typeof req.body === 'object' ? parseArray((req.body as { ids?: unknown }).ids) : []
      sendJson(res, 200, { products: await getProductsByIds(ids) })
      return
    }

    if (req.method === 'POST' && req.path === '/api/facilities/count') {
      const filters = req.body && typeof req.body === 'object'
        ? parseFilters((req.body as { filters?: unknown }).filters)
        : parseFilters(null)
      sendJson(res, 200, { count: await getFacilityCountByFilters(filters) })
      return
    }

    if (req.method === 'POST' && req.path === '/api/facilities/state-counts') {
      const filters = req.body && typeof req.body === 'object'
        ? parseFilters((req.body as { filters?: unknown }).filters)
        : parseFilters(null)
      sendJson(res, 200, await getStateFacilityCountsByFilters(filters))
      return
    }

    const productMatch = req.path.match(/^\/api\/products\/([^/]+)$/)
    if (req.method === 'GET' && productMatch?.[1]) {
      const product = await getProductById(decodeURIComponent(productMatch[1]))
      if (!product) {
        sendJson(res, 404, { error: 'Product not found' })
        return
      }
      sendJson(res, 200, product)
      return
    }

    sendJson(res, 404, { error: 'Not found' })
  } catch (error) {
    sendError(res, error)
  }
}
