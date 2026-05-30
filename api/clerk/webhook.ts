import type { IncomingMessage } from 'node:http'
import { handleClerkWebhook } from '../../server/clerk-webhook.ts'

export const config = {
  api: {
    bodyParser: false,
  },
}

interface VercelWebhookRequest extends IncomingMessage {
  method?: string
  headers: Record<string, string | string[] | undefined>
}

interface VercelWebhookResponse {
  setHeader: (name: string, value: string) => void
  status: (code: number) => { json: (body: unknown) => void }
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks).toString('utf8')
}

export default async function handler(req: VercelWebhookRequest, res: VercelWebhookResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    await handleClerkWebhook(await readBody(req), req.headers)
    res.status(200).json({ success: true })
  } catch (err) {
    console.error('Clerk webhook error:', err)
    res.status(400).json({
      error: 'Webhook verification failed',
      details: err instanceof Error ? err.message : 'Unknown error',
    })
  }
}
