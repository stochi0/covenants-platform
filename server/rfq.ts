import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

export interface RFQProduct {
  id: string
  name: string
  casNumber?: string
  category: string | null
  quantity?: string
  unit?: string
  supplierMatches?: RFQSupplierMatch[]
}

export interface RFQSupplierMatch {
  isPrimary?: boolean
  facility?: {
    name?: string
    capacityKl?: number | null
    company?: {
      name?: string
    } | null
    region?: {
      name?: string
    } | null
  }
}

export interface RFQBody {
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

export function getTransporter(): Transporter | null {
  const user = process.env.SENDER_EMAIL
  const pass = process.env.SENDER_PASSWORD
  const host = process.env.SMTP_SERVER
  const port = Number(process.env.SMTP_PORT) || 587

  if (!user || !pass || !host) {
    console.warn('Email not configured: set SENDER_EMAIL, SENDER_PASSWORD, SMTP_SERVER in .env')
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

export function validateRfqBody(body: RFQBody): string | null {
  if (!body?.email || !body?.name || !Array.isArray(body.products) || body.products.length === 0) {
    return 'name, email, and at least one product are required'
  }
  return null
}

export function buildRfqEmailHtml(body: RFQBody): string {
  const productsRows = body.products
    .map(
      (p) =>
        `<tr>
          <td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(p.name)}</td>
          <td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(p.casNumber || '-')}</td>
          <td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(p.category || 'Uncategorized')}</td>
          <td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(String(p.quantity || ''))} ${escapeHtml(String(p.unit || ''))}</td>
        </tr>`
    )
    .join('')
  const supplierRows = body.products
    .flatMap((product) =>
      (product.supplierMatches ?? []).map((match) => {
        const facility = match.facility
        const companyName = facility?.company?.name || 'Unknown company'
        const facilityName = facility?.name || 'Unknown facility'
        const regionName = facility?.region?.name || '-'
        const capacity = facility?.capacityKl == null ? '-' : `${facility.capacityKl} KL`

        return `<tr>
          <td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(product.name)}</td>
          <td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(companyName)}</td>
          <td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(facilityName)}</td>
          <td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(regionName)}</td>
          <td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(capacity)}</td>
          <td style="padding:8px;border:1px solid #e5e7eb">${match.isPrimary ? 'Yes' : 'No'}</td>
        </tr>`
      })
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
  <h3 style="margin-top:24px">Matched suppliers</h3>
  ${
    supplierRows
      ? `<table style="width:100%;border-collapse:collapse">
    <thead>
      <tr style="background:#f3f4f6">
        <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Product</th>
        <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Company</th>
        <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Facility</th>
        <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Region</th>
        <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Capacity</th>
        <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Primary</th>
      </tr>
    </thead>
    <tbody>${supplierRows}</tbody>
  </table>`
      : '<p style="color:#6b7280">No active supplier facilities were attached to the selected products.</p>'
  }
  <p style="margin-top:24px;color:#6b7280;font-size:12px">Sent from Covenants Platform RFQ form.</p>
</body>
</html>
`.trim()
}

export async function submitRfq(body: RFQBody): Promise<void> {
  const validationError = validateRfqBody(body)
  if (validationError) {
    throw new Error(validationError)
  }

  const recipient = process.env.RECIPIENT_EMAIL || process.env.SENDER_EMAIL
  if (!recipient) {
    throw new Error('RECIPIENT_EMAIL or SENDER_EMAIL must be set')
  }

  const transporter = getTransporter()
  if (!transporter) {
    throw new Error('SMTP is not configured')
  }

  const html = buildRfqEmailHtml(body)
  const subject = `RFQ from ${body.company || body.name} - ${body.products.length} product(s)`
  const from = process.env.SENDER_EMAIL!

  await transporter.sendMail({
    from,
    to: recipient,
    replyTo: body.email,
    subject,
    html,
    text: html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
  })

  await transporter.sendMail({
    from,
    to: body.email,
    subject: 'We received your request for quote',
    html: `
      <p>Hi ${escapeHtml(body.name)},</p>
      <p>We have received your request for quote for ${body.products.length} product(s). Our team will get back to you shortly.</p>
      <p>- Covenants Platform</p>
    `.trim(),
  })
}
