import type { QueryResultRow } from 'pg'
import { dbOne, dbQuery } from './db.ts'

interface ClerkEmailAddress {
  id: string
  email_address: string
  verification: {
    status?: string
  } | null
}

interface ClerkUser {
  id: string
  primary_email_address_id: string | null
  email_addresses: ClerkEmailAddress[]
  first_name: string | null
  last_name: string | null
  image_url: string | null
}

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

function fullName(firstName: string | null, lastName: string | null): string | null {
  return [firstName, lastName].filter(Boolean).join(' ') || null
}

function profileFromClerkUser(user: ClerkUser): UserProfile {
  const primaryEmail = user.email_addresses.find((email) => email.id === user.primary_email_address_id)
    ?? user.email_addresses[0]

  if (!primaryEmail?.email_address) {
    throw new Error('Clerk user does not have an email address')
  }

  return {
    clerkUserId: user.id,
    email: primaryEmail.email_address,
    fullName: fullName(user.first_name, user.last_name),
    firstName: user.first_name,
    lastName: user.last_name,
    imageUrl: user.image_url,
    emailVerified: primaryEmail.verification?.status === 'verified',
  }
}

async function fetchClerkUser(clerkUserId: string): Promise<ClerkUser> {
  const secretKey = process.env.CLERK_SECRET_KEY
  if (!secretKey) {
    throw new Error('CLERK_SECRET_KEY must be set')
  }

  const response = await fetch(`https://api.clerk.com/v1/users/${encodeURIComponent(clerkUserId)}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch Clerk user: ${response.status}`)
  }

  return response.json() as Promise<ClerkUser>
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

export async function upsertUserFromClerkId(clerkUserId: string): Promise<string> {
  return upsertUserProfile(profileFromClerkUser(await fetchClerkUser(clerkUserId)))
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
