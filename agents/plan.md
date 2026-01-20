Task: Build a small backend service (FastAPI) and a minimal database layout (SQLite by default) that provides aggregated counts needed by a frontend dashboard. The frontend will display:
  - a world/country/city map showing counts of companies by location (GeoJSON points or clusters),
  - a chemistry histogram / tag cloud showing counts of companies that support each chemistry (e.g., hydrogenation, nitration, acylation),
  - a product counts widget (number of products per company or counts aggregated across companies).

Requirements & constraints (first-principles driven):
1. Use Python 3.11+, FastAPI for the HTTP API, SQLAlchemy as the ORM (sync is fine), and SQLite for local development.
2. Use a single environment variable `DATABASE_URL`. Default should be `sqlite+aiosqlite:///./data.db` or `sqlite:///./data.db`. Document exactly where to change it to switch to Supabase (a Postgres URL). Do NOT hardcode DB credentials.
3. Schema assumptions (map these to the given Excel-derived tables):
   - `companies` table must include at least: `id`, `name`, `location` (free-text), optional `lat`, `lon`, `country`, `state`, `city`, and business fields. If `lat`/`lon` are absent for some rows, the service should gracefully ignore geolocation for those rows for map endpoint (see fallback).
   - `process_types` and `company_processes` tables exist such that `company_processes.company_id` -> `companies.id` and `company_processes.process_type_id` -> `process_types.id`.
   - `company_products` table exists with `company_id` -> `companies.id`.
   - If the provided DB lacks these tables, include SQLAlchemy models + migrations/creation script to create them.
4. Endpoints to implement (JSON responses):
   - `GET /api/stats/locations?level={point|country|state|city}&limit={n}`  
     - Returns GeoJSON FeatureCollection (for `point`) or aggregated array for `country|state|city`. Each item: `{ "key": "<country|state|city name>", "count": <int>, "geometry": <GeoJSON point optional> }`.
     - If `lat`/`lon` exist for a company, include a Feature point for clustering; otherwise aggregate by `country`/`state`/`city`.
     - Efficient SQL: use `GROUP BY` on the requested level; include index suggestions.
   - `GET /api/stats/chemistries?limit={n}`  
     - Returns `[ { "chemistry": "HYDROGENATION", "company_count": 12 }, ... ]` ordered by `company_count` desc.
     - Use SQL joining `company_processes` -> `process_types` -> `companies`. Count unique companies per chemistry.
   - `GET /api/stats/products?by={company|global}&limit={n}`  
     - `by=company` returns top companies with product counts: `[ { "company_id": 1, "company_name":"X", "product_count": 12 } ]`.
     - `by=global` returns aggregated counts by product type: `[ { "product_type": "API", "count": 100 } ]`.
5. Response shape examples (compact):
   - Locations (GeoJSON FeatureCollection):
     ```
     {
       "type": "FeatureCollection",
       "features": [
         {"type":"Feature","properties":{"key":"Bangalore, India","count":42},"geometry":{"type":"Point","coordinates":[77.5946,12.9716]}},
         ...
       ]
     }
     ```
   - Chemistries:
     ```
     [{"chemistry":"HYDROGENATION","company_count":42}, ...]
     ```
   - Products (by company):
     ```
     [{"company_id":5,"company_name":"Acme Pharma","product_count":120}, ...]
     ```
6. Implementation details & best practices:
   - Use SQLAlchemy Core/ORM with explicit SQL queries for aggregation (so the SQL is readable). Provide the raw SQL used for each aggregation in comments.
   - Use async FastAPI endpoints or sync—either is fine. Make clear how to change DB URL for Supabase (set `DATABASE_URL="postgresql+asyncpg://user:pass@host:port/dbname"`).
   - Add basic pagination and `limit` query param to avoid giant responses.
   - Add `Access-Control-Allow-Origin` (CORS) so the frontend can call the API.
   - Provide simple caching suggestions: e.g., use in-memory TTL cache (fastapi-utils or cachetools) for endpoints that aggregate, with a default 60s TTL.
   - For geolocation:
     - Prefer using `companies.lat` and `companies.lon`. If missing, do not call external geocoders inside request handlers. Instead:
       - Provide a small management endpoint or script `POST /admin/geocode-missing` that will (optionally) accept a provider key and geocode missing rows in a batch and write `lat`/`lon` back into `companies`. (This keeps normal endpoints fast and predictable.)
7. Tests & docs:
   - Include a small README explaining: how to run, where to change `DATABASE_URL` to switch to Supabase/Postgres, example curl for each endpoint, and how to run the DB creation script.
   - Include minimal unit tests that seed an in-memory SQLite DB and assert endpoints return expected aggregated JSON.
8. Deliverables:
   - `app/main.py` with FastAPI app, routes, and CORS config.
   - `app/models.py` with SQLAlchemy models for `companies`, `process_types`, `company_processes`, `company_products`.
   - `app/crud.py` implementing the aggregation queries (with raw SQL variants in comments).
   - `scripts/init_db.py` to create tables and optionally seed example data.
   - `scripts/geocode_missing.py` to batch geocode missing lat/lon (documented but optional).
   - `tests/test_aggregations.py`.
   - `README.md` including the exact env var to change to migrate to Supabase and example Supabase/Postgres connection string format.
9. Non-functional requirements:
   - Keep code small and clear. Favor explicit SQL for the aggregation endpoints.
   - Document any indexes you recommend to speed GROUP BY queries (e.g., index on `companies(country)`, `company_processes(process_type_id)`, composite indexes where appropriate).
   - Avoid background work in request handlers. Explicitly provide a script or admin endpoint for heavy tasks (geocoding, reclustering).
10. Explain in the generated code / README exactly how to swap to Supabase:
    - Replace `DATABASE_URL` environment variable string from default `sqlite:///./data.db` to a Supabase/Postgres URL (example):  
      `postgresql://<db_user>:<db_pass>@<db_host>:5432/<db_name>`  
      or for async driver `postgresql+asyncpg://...`.  
    - Mention possible small SQL compatibility differences and to run migrations (or use SQLAlchemy `create_all()` for initial tests).

Finish: Provide runnable code and tests. Keep the implementation minimal but production-minded (CORS, caching, env-driven config, paginated endpoints, clear SQL for aggregations).
