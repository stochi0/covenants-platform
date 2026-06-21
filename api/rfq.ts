import { submitRfq, type RFQBody } from '../server/rfq'
import { requireVercelAuth } from '../server/api-auth'

interface VercelRequest {
  method?: string
  body?: unknown
}

interface VercelResponse {
  setHeader: (name: string, value: string) => void
  status: (code: number) => { json: (body: unknown) => void }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  const auth = await requireVercelAuth(req, res)
  if (!auth) return

  try {
    await submitRfq(req.body as RFQBody, auth)
    res.status(200).json({ success: true })
  } catch (err) {
    const details = err instanceof Error ? err.message : 'Unknown error'
    const status = details.includes('required')
      ? 400
      : details.includes('SMTP')
        ? 503
        : 500

    console.error('RFQ submit error:', err)
    res.status(status).json({
      error: status === 400 ? 'Validation failed' : 'Failed to submit RFQ',
      details,
    })
  }
}
