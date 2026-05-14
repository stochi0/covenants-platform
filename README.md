# Covenants Platform

React/Vite marketplace for searching products, reviewing matched supplier facilities, and submitting RFQs.

## App Setup

Create `.env` in this directory:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SENDER_EMAIL=...
SENDER_PASSWORD=...
SMTP_SERVER=...
SMTP_PORT=587
RECIPIENT_EMAIL=...
```

Run the frontend and local RFQ API together:

```bash
pnpm install
pnpm run dev:all
```

For Vercel, `/api/rfq` is served from `api/rfq.ts`. For local development, Vite proxies `/api` to the Express server in `server/index.ts`.

## Data Source

The authoritative schema, workbook, and migration/import workflow live in:

```bash
/Users/ayushb/home/workspaces/covenants/scripts
```

From this platform directory, run:

```bash
pnpm run data:dry-run
pnpm run data:apply
```

`data:dry-run` parses the workbook and writes validation reports without touching Supabase. `data:apply` applies the SQL migration, truncates the target tables, imports workbook data, and validates counts, duplicate keys, ID formats, and orphaned relationships.

The current app expects these connected tables:

- `products`
- `companies`
- `facilities`
- `regions`
- `chemistries`
- `accreditations`
- `facility_products`
- `facility_chemistries`
- `facility_accreditations`

## Verification

```bash
pnpm lint
pnpm build
```

Manual checks:

- Search products by name and CAS number.
- Filter by product category without a query.
- Select overview filters, then open Marketplace Search and confirm products show matched suppliers/facilities.
- Submit an RFQ and confirm the internal email includes matched supplier rows.
