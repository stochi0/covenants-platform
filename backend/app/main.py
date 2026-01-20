from __future__ import annotations

from cachetools import TTLCache
from fastapi import Depends, FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app import crud
from app.db import get_db

app = FastAPI(title="covenants-backend", version="0.1.0")

# CORS: allow frontend dev by default; tighten in production via env as needed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory caching for expensive aggregates (60s TTL).
_cache_locations = TTLCache(maxsize=128, ttl=60)
_cache_chemistries = TTLCache(maxsize=128, ttl=60)
_cache_products = TTLCache(maxsize=128, ttl=60)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/stats/locations")
def stats_locations(
    level: crud.LocationLevel = Query("country", pattern="^(point|country|state|city)$"),
    limit: int = Query(200, ge=1, le=10_000),
    country: str | None = Query(None),
    state: str | None = Query(None),
    city: str | None = Query(None),
    chemistries: list[str] | None = Query(None),
    db: Session = Depends(get_db),
):
    filters = crud.normalize_company_filters(country=country, state=state, city=city, chemistries=chemistries)
    cache_key = (level, limit, filters)
    if cache_key in _cache_locations:
        return _cache_locations[cache_key]
    result = crud.get_location_stats(db=db, level=level, limit=limit, filters=filters)
    _cache_locations[cache_key] = result
    return result


@app.get("/api/stats/chemistries")
def stats_chemistries(
    limit: int = Query(50, ge=1, le=10_000),
    country: str | None = Query(None),
    state: str | None = Query(None),
    city: str | None = Query(None),
    chemistries: list[str] | None = Query(None),
    db: Session = Depends(get_db),
):
    filters = crud.normalize_company_filters(country=country, state=state, city=city, chemistries=chemistries)
    cache_key = (limit, filters)
    if cache_key in _cache_chemistries:
        return _cache_chemistries[cache_key]
    result = crud.get_chemistry_stats(db=db, limit=limit, filters=filters)
    _cache_chemistries[cache_key] = result
    return result


@app.get("/api/stats/products")
def stats_products(
    by: crud.ProductsBy = Query("company", pattern="^(company|global)$"),
    limit: int = Query(50, ge=1, le=10_000),
    country: str | None = Query(None),
    state: str | None = Query(None),
    city: str | None = Query(None),
    chemistries: list[str] | None = Query(None),
    db: Session = Depends(get_db),
):
    filters = crud.normalize_company_filters(country=country, state=state, city=city, chemistries=chemistries)
    cache_key = (by, limit, filters)
    if cache_key in _cache_products:
        return _cache_products[cache_key]
    result = crud.get_product_stats(db=db, by=by, limit=limit, filters=filters)
    _cache_products[cache_key] = result
    return result


