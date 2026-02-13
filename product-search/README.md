# Product Search – File Copy

This folder contains **copies** of all files that make up the product search feature. Use it as a reference or for moving the feature elsewhere.

## Structure (mirrors project layout)

| Copy | Original |
|------|----------|
| `components/product-search.tsx` | Search dialog UI (name/CAS search, category filters, selection, “Request Quote”) |
| `components/rfq-modal.tsx` | RFQ modal used from product search (quantities, contact form, submit) |
| `lib/products-data.ts` | Types, `searchProductsPaginated`, `getProductById`, `getProductsByIds`, `categoryInfo` |
| `api/products/route.ts` | `GET /api/products` – paginated search by name/CAS and categories |
| `api/products/[id]/route.ts` | `GET /api/products/:id` – single product by ID |
| `api/products/batch/route.ts` | `POST /api/products/batch` – fetch products by IDs |

## Dependencies (not copied)

- **UI**: `@/components/ui/*` (dialog, button, input, badge, scroll-area, checkbox, card)
- **Data**: `@/lib/supabase-server` (used by all three API routes)
- **RFQ**: `/api/rfq` (used by `rfq-modal.tsx` for submission)

Imports in these copies still use `@/` and assume the main app structure; adjust paths if you move them into another project.
