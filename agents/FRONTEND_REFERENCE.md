# Frontend ↔ Backend Reference (covenants-backend)

This doc is the **source of truth** for integrating the frontend with this FastAPI backend.

---

## Base URL

- **Local dev (default)**: `http://localhost:8000`
- All endpoints below are relative to the base URL.

### CORS

Backend is configured to allow requests from anywhere in dev (`Access-Control-Allow-Origin: *`), so the frontend can call it directly.

---

## Run the backend (local)

From repo root:

```bash
uv run uvicorn app.main:app --reload --port 8000
```

### Database configuration

- Controlled by environment variable `DATABASE_URL`
- Default: `sqlite:///./data.db`

Example:

```bash
export DATABASE_URL="sqlite:///./data.db"
```

---

## Health check

### `GET /health`

Returns:

```json
{ "status": "ok" }
```

---

## Common filtering (used by all `/api/stats/*` endpoints)

You can combine **multiple filters together**. Semantics are:

- **Across different filter fields** (`country`, `state`, `city`, `chemistries`): **AND**
- **Within `chemistries`** (multi-select): **AND** (company must match **all** selected chemistries)

### Filter query parameters

- `country` (string): case-insensitive exact match (example: `India`)
- `state` (string): case-insensitive exact match (example: `Karnataka`)
- `city` (string): case-insensitive exact match (example: `Bangalore`)
- `chemistries` (multi): process codes like `HYDROGENATION`, `NITRATION`
  - Can be provided as **repeated query params**:
    - `?chemistries=HYDROGENATION&chemistries=OXIDATION`
  - Or **comma-separated** in a single param:
    - `?chemistries=HYDROGENATION,OXIDATION`

### Notes / gotchas

- **Case-insensitive** matching for `country/state/city`.
- **Trimmed** input (`"  India "` works).
- Chemistry codes are normalized to **UPPERCASE** internally.

---

## 1) Locations stats (map / clusters / dropdowns)

### `GET /api/stats/locations`

#### Query params

- `level` (required, default: `country`): one of `point | country | state | city`
- `limit` (optional, default: `200`, max: `10000`)
- Filters (optional): `country`, `state`, `city`, `chemistries`

#### Response (when `level=point`) — GeoJSON FeatureCollection

Each feature is a company with `lat/lon` present.

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "key": "Bangalore, Karnataka, India", "count": 1, "company_id": 1 },
      "geometry": { "type": "Point", "coordinates": [77.5946, 12.9716] }
    }
  ]
}
```

#### Response (when `level=country|state|city`) — aggregated list

```json
[
  { "key": "India", "count": 3, "geometry": null },
  { "key": "Switzerland", "count": 1, "geometry": null }
]
```

#### Examples

- Countries (top 200):
  - `/api/stats/locations?level=country&limit=200`
- Points filtered to India + Hydrogenation:
  - `/api/stats/locations?level=point&country=India&chemistries=HYDROGENATION`

---

## 2) Chemistries stats (histogram / tag cloud / filter options)

### `GET /api/stats/chemistries`

#### Query params

- `limit` (optional, default: `50`, max: `10000`)
- Filters (optional): `country`, `state`, `city`, `chemistries`

#### Response

Count is **unique companies** supporting that chemistry.

```json
[
  { "chemistry": "HYDROGENATION", "company_count": 12 },
  { "chemistry": "NITRATION", "company_count": 7 }
]
```

#### Examples

- Global top chemistries:
  - `/api/stats/chemistries?limit=50`
- Chemistries within India + Karnataka:
  - `/api/stats/chemistries?country=India&state=Karnataka`
- Companies that have **both** Hydrogenation and Oxidation, then show their chemistry breakdown:
  - `/api/stats/chemistries?chemistries=HYDROGENATION,OXIDATION`

---

## 3) Products stats (widgets / leaderboards)

### `GET /api/stats/products`

#### Query params

- `by` (required, default: `company`): `company | global`
- `limit` (optional, default: `50`, max: `10000`)
- Filters (optional): `country`, `state`, `city`, `chemistries`

#### Response (when `by=company`) — top companies by product count

```json
[
  { "company_id": 1, "company_name": "Acme Pharma CDMO", "product_count": 12 }
]
```

#### Response (when `by=global`) — counts by product type

```json
[
  { "product_type": "API", "count": 100 },
  { "product_type": "Intermediate", "count": 40 }
]
```

#### Examples

- Top companies by product count (within India + Nitration):
  - `/api/stats/products?by=company&country=India&chemistries=NITRATION`
- Global product type distribution (within Hyderabad):
  - `/api/stats/products?by=global&city=Hyderabad`

---

## Frontend integration patterns (JS/TS)

### Recommended: keep backend URL in env

- Example (Vite):
  - `VITE_API_BASE_URL=http://localhost:8000`

```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
```

### Build query params safely (supports multi-select chemistries)

Use repeated query params (recommended):

```ts
type StatsFilters = {
  country?: string;
  state?: string;
  city?: string;
  chemistries?: string[]; // e.g. ["HYDROGENATION", "OXIDATION"]
};

function buildStatsQuery(filters: StatsFilters) {
  const params = new URLSearchParams();
  if (filters.country) params.set("country", filters.country);
  if (filters.state) params.set("state", filters.state);
  if (filters.city) params.set("city", filters.city);
  for (const c of filters.chemistries ?? []) params.append("chemistries", c);
  return params;
}
```

### Fetch helpers (copy/paste)

```ts
async function apiGet<T>(path: string, params?: URLSearchParams): Promise<T> {
  const url = new URL(path, API_BASE_URL);
  if (params) url.search = params.toString();
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return (await res.json()) as T;
}

// Locations (aggregated)
export async function fetchLocationStats(
  level: "point" | "country" | "state" | "city",
  limit: number,
  filters: StatsFilters,
) {
  const params = buildStatsQuery(filters);
  params.set("level", level);
  params.set("limit", String(limit));
  return apiGet("/api/stats/locations", params);
}

// Chemistries
export async function fetchChemistryStats(limit: number, filters: StatsFilters) {
  const params = buildStatsQuery(filters);
  params.set("limit", String(limit));
  return apiGet<Array<{ chemistry: string; company_count: number }>>("/api/stats/chemistries", params);
}

// Products
export async function fetchProductStats(
  by: "company" | "global",
  limit: number,
  filters: StatsFilters,
) {
  const params = buildStatsQuery(filters);
  params.set("by", by);
  params.set("limit", String(limit));
  return apiGet("/api/stats/products", params);
}
```

---

## Caching note (important for UI behavior)

The backend caches aggregation responses for **~60 seconds**. The UI should assume:

- Results may be slightly stale for up to ~1 minute.
- If you need “instant refresh” during development, change filters (which changes cache key) or wait for TTL.


