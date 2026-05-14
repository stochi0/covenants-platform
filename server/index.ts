import 'dotenv/config'
import express from 'express'
import { handleDataRequest } from './data.ts'
import { submitRfq, type RFQBody } from './rfq.ts'

const app = express()
app.use(express.json({ limit: '2mb' }))

const PORT = Number(process.env.PORT) || 3001

app.post('/api/rfq', async (req, res) => {
  try {
    await submitRfq(req.body as RFQBody)
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
