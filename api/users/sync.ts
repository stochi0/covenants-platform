import { verifyClerkHeaders } from '../../server/auth.js'
import { upsertUserProfile } from '../../server/users.js'

interface SyncUserRequest {
  method?: string
  body?: unknown
  headers?: Record<string, string | string[] | undefined>
}

interface SyncUserResponse {
  setHeader: (name: string, value: string) => void
  status: (code: number) => { json: (body: unknown) => void }
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function readMetadata(body: Record<string, unknown>): Record<string, unknown> {
  return body.unsafeMetadata && typeof body.unsafeMetadata === 'object' && !Array.isArray(body.unsafeMetadata)
    ? body.unsafeMetadata as Record<string, unknown>
    : {}
}

function readPhoneMetadata(unsafeMetadata: Record<string, unknown>) {
  const phoneCountryCode = readString(unsafeMetadata.phoneCountryCode)
  const phoneNationalNumber = readString(unsafeMetadata.phoneNationalNumber)
  const phoneNumber = phoneCountryCode && phoneNationalNumber
    ? `${phoneCountryCode} ${phoneNationalNumber}`
    : readString(unsafeMetadata.phoneNumber)

  return {
    phoneNumber,
    phoneCountryCode,
    phoneNationalNumber,
  }
}

export default async function handler(req: SyncUserRequest, res: SyncUserResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  let claims: Awaited<ReturnType<typeof verifyClerkHeaders>>
  try {
    claims = await verifyClerkHeaders(req.headers ?? {})
  } catch (error) {
    res.status(401).json({
      error: 'Unauthorized',
      details: error instanceof Error ? error.message : 'Authentication failed',
    })
    return
  }

  const body = req.body && typeof req.body === 'object'
    ? req.body as Record<string, unknown>
    : {}
  const email = readString(body.email)
  const unsafeMetadata = readMetadata(body)
  const phoneMetadata = readPhoneMetadata(unsafeMetadata)

  if (!email) {
    res.status(400).json({ error: 'Email is required' })
    return
  }

  try {
    const id = await upsertUserProfile({
      clerkUserId: claims.sub!,
      email,
      firstName: readString(body.firstName),
      lastName: readString(body.lastName),
      username: readString(body.username),
      imageUrl: readString(body.imageUrl),
      emailVerified: body.emailVerified === true,
      phoneNumber: phoneMetadata.phoneNumber,
      phoneCountryCode: phoneMetadata.phoneCountryCode,
      phoneNationalNumber: phoneMetadata.phoneNationalNumber,
      companyName: readString(unsafeMetadata.companyName),
      companyCountry: readString(unsafeMetadata.companyCountry),
      designation: readString(unsafeMetadata.designation),
      department: readString(unsafeMetadata.department),
      companyType: readString(unsafeMetadata.companyType),
    })

    res.status(200).json({ id })
  } catch (error) {
    res.status(500).json({
      error: 'User sync failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
