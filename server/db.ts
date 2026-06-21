import { Pool, type QueryResultRow } from 'pg'

let pool: Pool | null = null

function normalizeDatabaseUrl(url: string): string {
  return url.replace(/^postgres:\/\//, 'postgresql://')
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export function getDatabaseUrl(): string {
  const url = process.env.SUPABASE_DB_URL
  if (!url) {
    throw new Error('Set SUPABASE_DB_URL for backend database reads.')
  }
  return normalizeDatabaseUrl(url)
}

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: getDatabaseUrl(),
      ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
      max: parsePositiveInt(process.env.PG_POOL_MAX, 2),
      connectionTimeoutMillis: parsePositiveInt(process.env.PG_CONNECTION_TIMEOUT_MS, 5000),
      idleTimeoutMillis: parsePositiveInt(process.env.PG_IDLE_TIMEOUT_MS, 10000),
      allowExitOnIdle: true,
    })
  }
  return pool
}

export async function dbQuery<T extends QueryResultRow>(sql: string, params: unknown[] = []): Promise<T[]> {
  const result = await getPool().query<T>(sql, params)
  return result.rows
}

export async function dbOne<T extends QueryResultRow>(sql: string, params: unknown[] = []): Promise<T | null> {
  const rows = await dbQuery<T>(sql, params)
  return rows[0] ?? null
}
