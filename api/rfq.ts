import nodemailer from 'nodemailer'

interface RFQProduct {
  id: string
  name: string
  casNumber?: string
  category: string
  quantity?: string
  unit?: string
}

interface RFQBody {
  name: string
  email: string
  company: string
  phone: string
  country: string
  message: string
  products: RFQProduct[]
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildRfqEmailHtml(body: RFQBody): string {
  const productsRows = body.products
    .map(
      (p) =>
        `<tr>
          <td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(p.name)}</td>
          <td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(p.casNumber || '-')}</td>
          <td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(p.category)}</td>
          <td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(String(p.quantity || ''))} ${escapeHtml(String(p.unit || ''))}</td>
        </tr>`
    )
    .join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New RFQ</title></head>
<body style="font-family:sans-serif;max-width:640px;margin:0 auto;padding:20px">
  <h2 style="color:#1f2937">New Request for Quote</h2>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr><td style="padding:6px 0;font-weight:600">Name</td><td>${escapeHtml(body.name)}</td></tr>
    <tr><td style="padding:6px 0;font-weight:600">Email</td><td><a href="mailto:${escapeHtml(body.email)}">${escapeHtml(body.email)}</a></td></tr>
    <tr><td style="padding:6px 0;font-weight:600">Company</td><td>${escapeHtml(body.company)}</td></tr>
    <tr><td style="padding:6px 0;font-weight:600">Phone</td><td>${escapeHtml(body.phone)}</td></tr>
    <tr><td style="padding:6px 0;font-weight:600">Country</td><td>${escapeHtml(body.country)}</td></tr>
  </table>
  ${body.message ? `<p><strong>Message:</strong><br/>${escapeHtml(body.message).replace(/\n/g, '<br/>')}</p>` : ''}
  <h3 style="margin-top:24px">Requested products</h3>
  <table style="width:100%;border-collapse:collapse">
    <thead>
      <tr style="background:#f3f4f6">
        <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Product</th>
        <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">CAS</th>
        <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Category</th>
        <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Quantity</th>
      </tr>
    </thead>
    <tbody>${productsRows}</tbody>
  </table>
  <p style="margin-top:24px;color:#6b7280;font-size:12px">Sent from Covenants Platform RFQ form.</p>
</body>
</html>
`.trim()
}

export default async function handler(
  req: { method?: string; body?: unknown },
  res: { setHeader: (name: string, value: string) => void; status: (code: number) => { json: (body: unknown) => void } }
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const body = req.body as RFQBody

    if (!body?.email || !body?.name || !Array.isArray(body.products) || body.products.length === 0) {
      res.status(400).json({
        error: 'Validation failed',
        details: 'name, email, and at least one product are required',
      })
      return
    }

    const sender = process.env.SENDER_EMAIL
    const password = process.env.SENDER_PASSWORD
    const smtpHost = process.env.SMTP_SERVER
    const smtpPort = Number(process.env.SMTP_PORT) || 587
    const recipient = process.env.RECIPIENT_EMAIL || sender

    if (!sender || !password || !smtpHost || !recipient) {
      res.status(500).json({
        error: 'Server configuration error',
        details: 'Missing email configuration',
      })
      return
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: sender, pass: password },
    })

    const html = buildRfqEmailHtml(body)
    const subject = `RFQ from ${body.company || body.name} - ${body.products.length} product(s)`

    await transporter.sendMail({
      from: sender,
      to: recipient,
      replyTo: body.email,
      subject,
      html,
      text: html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    })

    await transporter.sendMail({
      from: sender,
      to: body.email,
      subject: 'We received your request for quote',
      html: `
          <p>Hi ${escapeHtml(body.name)},</p>
          <p>We have received your request for quote for ${body.products.length} product(s). Our team will get back to you shortly.</p>
          <p>- Covenants Platform</p>
        `.trim(),
    })

    res.status(200).json({ success: true })
  } catch (err) {
    console.error('RFQ submit error:', err)
    res.status(500).json({
      error: 'Failed to submit RFQ',
      details: err instanceof Error ? err.message : 'Unknown error',
    })
  }
}
