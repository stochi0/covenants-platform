# Covenants Platform

React/Vite marketplace for searching products, reviewing matched supplier facilities, and submitting RFQs.

## App Setup

Create `.env` in this directory:

```bash
DATABASE_URL=...
VITE_CLERK_PUBLISHABLE_KEY=...
CLERK_WEBHOOK_SECRET=...
AUTHORIZED_PARTIES=http://localhost:5173,https://capillia.covenantspc.com,https://capillia.vercel.app
SENDER_EMAIL=...
SENDER_PASSWORD=...
SMTP_SERVER=...
SMTP_PORT=587
RECIPIENT_EMAIL=...
```

Run the frontend and local RFQ API together:

```bash
pnpm install
pnpm run dev
```

For Vercel, `/api/*` is served from the files under `api/`. For local development, `pnpm run dev` starts both Vite and the Express API server, and Vite proxies `/api` to `server/index.ts`.

In production, set the same auth variables in Vercel with:

```bash
AUTHORIZED_PARTIES=https://capillia.covenantspc.com,https://capillia.vercel.app
```

Configure Clerk for email-only authentication and add a webhook endpoint at:

```bash
https://capillia.covenantspc.com/api/clerk/webhook
```

Subscribe the webhook to `user.created`, `user.updated`, and `user.deleted`.
Authenticated API requests read user profile data from `public.users`; they do not fetch Clerk user data during normal app usage.

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
