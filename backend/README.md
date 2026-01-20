## covenants-backend

FastAPI + SQLAlchemy backend that exposes aggregated stats for a dashboard, backed by SQLite by default.

### Setup (uv)

- Install deps:

```bash
uv sync --extra dev
```

### Database (create + seed dummy data)

By default the app uses:

- `DATABASE_URL=sqlite:///./data.db`

Create tables + seed **dummy data in all tables**:

```bash
uv run python -m scripts.init_db --drop
```

### Run API

```bash
uv run uvicorn app.main:app --reload
```

### Endpoints

- `GET /api/stats/locations?level=point|country|state|city&limit=200`
- `GET /api/stats/chemistries?limit=50`
- `GET /api/stats/products?by=company|global&limit=50`

Example:

```bash
curl "http://127.0.0.1:8000/api/stats/chemistries?limit=10"
```

### Switching to Supabase / Postgres

Set `DATABASE_URL` to your Supabase Postgres URL. Example (sync driver):

```bash
export DATABASE_URL="postgresql+psycopg://<user>:<pass>@<host>:5432/<dbname>"
```

Then re-run:

```bash
uv run python -m scripts.init_db --drop
```

Notes:
- SQLite and Postgres differ slightly (types, constraints). For initial usage this project relies on SQLAlchemy `create_all()` to create tables.


