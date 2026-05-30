import type { QueryResultRow } from 'pg'
import { dbOne, dbQuery } from './db.ts'

interface UserRow extends QueryResultRow {
  id: string
}

interface LocalUserRow extends QueryResultRow {
  email: string
  full_name: string | null
  first_name: string | null
  last_name: string | null
}

export interface UserProfile {
  clerkUserId: string
  email: string
  fullName: string | null
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
  emailVerified: boolean
}

export async function upsertUserProfile(profile: UserProfile): Promise<string> {
  const row = await dbOne<UserRow>(`
    insert into public.users (
      clerk_user_id,
      email,
      full_name,
      first_name,
      last_name,
      image_url,
      email_verified,
      last_seen_at,
      deleted_at
    )
    values ($1, $2, $3, $4, $5, $6, $7, now(), null)
    on conflict (clerk_user_id) do update set
      email = excluded.email,
      full_name = excluded.full_name,
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      image_url = excluded.image_url,
      email_verified = excluded.email_verified,
      last_seen_at = now(),
      deleted_at = null
    returning id
  `, [
    profile.clerkUserId,
    profile.email,
    profile.fullName,
    profile.firstName,
    profile.lastName,
    profile.imageUrl,
    profile.emailVerified,
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
    select email, full_name, first_name, last_name
    from public.users
    where id = $1 and deleted_at is null
  `, [userId])

  if (!row) return null

  return {
    email: row.email,
    name: row.full_name || [row.first_name, row.last_name].filter(Boolean).join(' ') || row.email,
  }
}
