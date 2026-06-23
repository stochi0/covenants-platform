import type { QueryResultRow } from 'pg'
import { dbOne, dbQuery } from './db.js'

interface UserRow extends QueryResultRow {
  id: string
}

interface LocalUserRow extends QueryResultRow {
  email: string
  first_name: string | null
  last_name: string | null
}

export interface UserProfile {
  clerkUserId: string
  email: string
  firstName: string | null
  lastName: string | null
  username: string | null
  imageUrl: string | null
  emailVerified: boolean
  phoneNumber: string | null
  phoneCountryCode: string | null
  phoneNationalNumber: string | null
  companyName: string | null
  companyCountry: string | null
  designation: string | null
  department: string | null
  companyType: string | null
}

const DEFAULT_USER_ROLE = 'viewer'

export async function upsertUserProfile(profile: UserProfile): Promise<string> {
  const row = await dbOne<UserRow>(`
    insert into public.users (
      clerk_user_id,
      email,
      role,
      first_name,
      last_name,
      username,
      image_url,
      email_verified,
      phone_number,
      phone_country_code,
      phone_national_number,
      company_name,
      company_country,
      designation,
      department,
      company_type,
      last_seen_at,
      deleted_at
    )
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, now(), null)
    on conflict (clerk_user_id) do update set
      email = excluded.email,
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      username = excluded.username,
      image_url = excluded.image_url,
      email_verified = excluded.email_verified,
      phone_number = excluded.phone_number,
      phone_country_code = excluded.phone_country_code,
      phone_national_number = excluded.phone_national_number,
      company_name = excluded.company_name,
      company_country = excluded.company_country,
      designation = excluded.designation,
      department = excluded.department,
      company_type = excluded.company_type,
      last_seen_at = now(),
      deleted_at = null
    returning id
  `, [
    profile.clerkUserId,
    profile.email,
    DEFAULT_USER_ROLE,
    profile.firstName,
    profile.lastName,
    profile.username,
    profile.imageUrl,
    profile.emailVerified,
    profile.phoneNumber,
    profile.phoneCountryCode,
    profile.phoneNationalNumber,
    profile.companyName,
    profile.companyCountry,
    profile.designation,
    profile.department,
    profile.companyType,
  ])

  if (!row?.id) {
    throw new Error('Failed to upsert user')
  }

  return row.id
}

export async function touchUserByClerkId(clerkUserId: string): Promise<string> {
  const row = await dbOne<UserRow>(`
    update public.users
    set last_seen_at = now()
    where clerk_user_id = $1 and deleted_at is null
    returning id
  `, [clerkUserId])

  if (!row?.id) {
    throw new Error('User profile is not synced yet')
  }

  return row.id
}

export async function softDeleteUserByClerkId(clerkUserId: string): Promise<void> {
  await dbQuery(`
    update public.users
    set deleted_at = now()
    where clerk_user_id = $1
  `, [clerkUserId])
}

export async function getLocalUserProfile(userId: string): Promise<{ email: string; name: string } | null> {
  const row = await dbOne<LocalUserRow>(`
    select email, first_name, last_name
    from public.users
    where id = $1 and deleted_at is null
  `, [userId])

  if (!row) return null

  return {
    email: row.email,
    name: [row.first_name, row.last_name].filter(Boolean).join(' ') || row.email,
  }
}
