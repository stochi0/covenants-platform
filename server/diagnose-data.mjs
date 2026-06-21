import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

function normalizeDatabaseUrl(url) {
  return url.replace(/^postgres:\/\//, 'postgresql://')
}

function getDatabaseUrl() {
  if (!process.env.SUPABASE_DB_URL) {
    throw new Error('Set SUPABASE_DB_URL before running diagnostics.')
  }
  return normalizeDatabaseUrl(process.env.SUPABASE_DB_URL)
}

const pool = new Pool({
  connectionString: getDatabaseUrl(),
  ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
  max: 1,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 5000,
  allowExitOnIdle: true,
})

const checks = [
  {
    label: 'Facility totals',
    sql: `
      select
        count(*)::int as total,
        count(*) filter (where is_active = true)::int as active,
        count(*) filter (where deleted_at is null)::int as not_deleted,
        count(*) filter (where is_active = true and deleted_at is null)::int as active_not_deleted,
        count(*) filter (where region_id is not null)::int as with_region
      from facilities
    `,
  },
  {
    label: 'Facility active/deleted shape',
    sql: `
      select
        is_active,
        deleted_at is null as not_deleted,
        count(*)::int as facilities
      from facilities
      group by is_active, deleted_at is null
      order by facilities desc
    `,
  },
  {
    label: 'Region country distribution',
    sql: `
      select coalesce(country, '<null>') as country, count(*)::int as regions
      from regions
      group by country
      order by regions desc
    `,
  },
  {
    label: 'Active facilities by region country',
    sql: `
      select coalesce(r.country, '<no region>') as country, count(*)::int as facilities
      from facilities f
      left join regions r on r.id = f.region_id
      where f.is_active = true and f.deleted_at is null
      group by r.country
      order by facilities desc
    `,
  },
  {
    label: 'Linked facility coverage',
    sql: `
      select
        (select count(distinct facility_id)::int from facility_products) as product_linked_facilities,
        (
          select count(distinct fc.facility_id)::int
          from facility_chemistries fc
          join facilities f on f.id = fc.facility_id
          where f.is_active = true and f.deleted_at is null
        ) as active_chemistry_linked_facilities,
        (
          select count(distinct fa.facility_id)::int
          from facility_accreditations fa
          join facilities f on f.id = fa.facility_id
          where f.is_active = true and f.deleted_at is null
        ) as active_accreditation_linked_facilities
    `,
  },
  {
    label: 'Dashboard parity',
    sql: `
      select
        (select count(*)::int from products) as products,
        (select count(*)::int from chemistries) as chemistries,
        (
          select count(*)::int
          from facilities
          where is_active = true and deleted_at is null
        ) as dashboard_facilities,
        (
          select count(*)::int
          from regions
          where country = 'IN'
        ) as india_regions
    `,
  },
]

try {
  for (const check of checks) {
    const result = await pool.query(check.sql)
    console.log(`\n${check.label}`)
    console.table(result.rows)
  }
} catch (error) {
  console.error('\nData diagnostic failed.')
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await pool.end()
}
