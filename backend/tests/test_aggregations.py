from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import get_db
from app.main import app
from app.models import Base
from app.seed import seed_dummy_data


@pytest.fixture()
def client() -> TestClient:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        future=True,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(bind=engine, class_=Session, autoflush=False, autocommit=False, future=True)

    Base.metadata.create_all(bind=engine)
    with TestingSessionLocal() as db:
        seed_dummy_data(db)

    def _override_get_db():
        with TestingSessionLocal() as db:
            yield db

    app.dependency_overrides[get_db] = _override_get_db
    return TestClient(app)


def test_locations_country(client: TestClient) -> None:
    r = client.get("/api/stats/locations", params={"level": "country", "limit": 100})
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    keys = {row["key"] for row in data}
    assert "India" in keys


def test_locations_point_geojson(client: TestClient) -> None:
    r = client.get("/api/stats/locations", params={"level": "point", "limit": 100})
    assert r.status_code == 200
    data = r.json()
    assert data["type"] == "FeatureCollection"
    assert "features" in data
    assert any(f["geometry"]["type"] == "Point" for f in data["features"])


def test_chemistries(client: TestClient) -> None:
    r = client.get("/api/stats/chemistries", params={"limit": 50})
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert any(row["chemistry"] == "HYDROGENATION" for row in data)
    assert all("company_count" in row for row in data)


def test_products_by_company(client: TestClient) -> None:
    r = client.get("/api/stats/products", params={"by": "company", "limit": 50})
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert all("product_count" in row for row in data)


def test_products_global(client: TestClient) -> None:
    r = client.get("/api/stats/products", params={"by": "global", "limit": 50})
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert any(row["product_type"] == "API" for row in data)


def test_filters_country_and_chemistry_affect_locations(client: TestClient) -> None:
    # India has 3 companies total in the seed data, but only 2 support HYDROGENATION.
    r = client.get(
        "/api/stats/locations",
        params={"level": "country", "limit": 100, "country": "India", "chemistries": "HYDROGENATION"},
    )
    assert r.status_code == 200
    data = r.json()
    assert data == [{"key": "India", "count": 2, "geometry": None}]


def test_filters_case_insensitive_location_and_products(client: TestClient) -> None:
    # "Nova Intermediates" is in Hyderabad, Telangana, India and has 3 products.
    r = client.get(
        "/api/stats/products",
        params={"by": "company", "limit": 50, "country": "india", "city": "HYDERABAD", "chemistries": "NITRATION"},
    )
    assert r.status_code == 200
    data = r.json()
    assert any(row["company_name"] == "Nova Intermediates" and row["product_count"] == 3 for row in data)


def test_filters_chemistries_comma_separated(client: TestClient) -> None:
    # Comma-separated list should be accepted in addition to repeated query params.
    # HYDROGENATION + OXIDATION co-occur for the 2 "even-indexed" seed companies.
    r = client.get("/api/stats/chemistries", params={"limit": 50, "chemistries": "HYDROGENATION,OXIDATION"})
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    keys = {row["chemistry"] for row in data}
    assert "HYDROGENATION" in keys
    assert "OXIDATION" in keys


def test_filters_country_and_certification_affect_locations(client: TestClient) -> None:
    # India has 3 companies total in the seed data, but only 2 have ISO9001.
    r = client.get(
        "/api/stats/locations",
        params={"level": "country", "limit": 100, "country": "India", "certifications": "ISO9001"},
    )
    assert r.status_code == 200
    data = r.json()
    assert data == [{"key": "India", "count": 2, "geometry": None}]


def test_filters_certifications_comma_separated_and_and_semantics(client: TestClient) -> None:
    # Comma-separated list should be accepted; AND semantics mean company must have *all* certs.
    # ISO9001 + USFDA co-occur for the 2 "even-indexed" seed companies, both in India.
    r = client.get(
        "/api/stats/locations",
        params={"level": "country", "limit": 100, "country": "India", "certifications": "ISO9001,USFDA"},
    )
    assert r.status_code == 200
    data = r.json()
    assert data == [{"key": "India", "count": 2, "geometry": None}]


def test_filters_combined_certifications_and_chemistries(client: TestClient) -> None:
    # Multiple facets should combine with AND semantics.
    r = client.get(
        "/api/stats/locations",
        params={
            "level": "country",
            "limit": 100,
            "country": "India",
            "certifications": "ISO9001",
            "chemistries": "HYDROGENATION",
        },
    )
    assert r.status_code == 200
    data = r.json()
    assert data == [{"key": "India", "count": 2, "geometry": None}]


