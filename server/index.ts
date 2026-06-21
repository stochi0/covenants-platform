import 'dotenv/config'
import express from 'express'
import { requireAuth, type AuthenticatedRequest } from './auth.js'
import { handleClerkWebhook } from './clerk-webhook.js'
import { handleDataRequest } from './data.js'
import { submitRfq, type RFQBody } from './rfq.js'

const app = express()

app.post('/api/clerk/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : ''
    await handleClerkWebhook(rawBody, req.headers)
    res.status(200).json({ success: true })
  } catch (err) {
    console.error('Clerk webhook error:', err)
    res.status(400).json({
      error: 'Webhook verification failed',
      details: err instanceof Error ? err.message : 'Unknown error',
    })
  }
})

app.use(express.json({ limit: '2mb' }))
app.use('/api', requireAuth)

const PORT = Number(process.env.PORT) || 3001

app.post('/api/rfq', async (req, res) => {
  try {
    await submitRfq(req.body as RFQBody, (req as AuthenticatedRequest).auth)
    res.status(200).json({ success: true })
  } catch (err) {
    const details = err instanceof Error ? err.message : 'Unknown error'
    const status = details.includes('required')
      ? 400
      : details.includes('SMTP')
        ? 503
        : details.includes('must be set')
          ? 500
          : 500

    console.error('RFQ submit error:', err)
    res.status(status).json({
      error: status === 400 ? 'Validation failed' : 'Failed to submit RFQ',
      details,
    })
  }
})

app.all('/api/{*path}', handleDataRequest)

app.listen(PORT, () => {
  console.log(`Covenants API server running at http://localhost:${PORT}`)
})
