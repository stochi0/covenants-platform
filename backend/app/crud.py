from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Literal

from sqlalchemy import Select, distinct, func, select
from sqlalchemy.orm import Session

from app.models import Company, CompanyProcess, CompanyProduct, ProcessType


LocationLevel = Literal["point", "country", "state", "city"]
ProductsBy = Literal["company", "global"]


@dataclass(frozen=True)
class CompanyFilters:
    """
    Shared filter set so the frontend can apply multiple filters together (AND).
    """

    country: str | None = None
    state: str | None = None
    city: str | None = None
    # Values are ProcessType.code (e.g. "HYDROGENATION"). Stored normalized (uppercased, deduped).
    chemistries: tuple[str, ...] = ()


def normalize_company_filters(
    *,
    country: str | None = None,
    state: str | None = None,
    city: str | None = None,
    chemistries: list[str] | None = None,
) -> CompanyFilters:
    def _norm_text(v: str | None) -> str | None:
        if v is None:
            return None
        v = v.strip()
        return v or None

    def _norm_chemistries(values: list[str] | None) -> tuple[str, ...]:
        if not values:
            return ()
        parts: list[str] = []
        for item in values:
            if item is None:
                continue
            # Support both repeated query params (?chemistries=A&chemistries=B)
            # and comma-separated (?chemistries=A,B).
            for p in str(item).split(","):
                p = p.strip()
                if p:
                    parts.append(p.upper())
        seen: set[str] = set()
        out: list[str] = []
        for p in parts:
            if p not in seen:
                seen.add(p)
                out.append(p)
        return tuple(out)

    return CompanyFilters(
        country=_norm_text(country),
        state=_norm_text(state),
        city=_norm_text(city),
        chemistries=_norm_chemistries(chemistries),
    )


def _has_any_filters(filters: CompanyFilters) -> bool:
    return bool(filters.country or filters.state or filters.city or filters.chemistries)


def _company_ids_select(filters: CompanyFilters) -> Select | None:
    """
    Returns a SELECT of distinct company ids matching the filters, or None when no filters are present.
    """

    if not _has_any_filters(filters):
        return None

    stmt: Select = select(Company.id).distinct()

    # Case-insensitive exact match for user-supplied names.
    if filters.country:
        stmt = stmt.where(func.lower(Company.country) == filters.country.lower())
    if filters.state:
        stmt = stmt.where(func.lower(Company.state) == filters.state.lower())
    if filters.city:
        stmt = stmt.where(func.lower(Company.city) == filters.city.lower())

    if filters.chemistries:
        # AND semantics within the same facet: company must match *all* selected chemistries.
        stmt = (
            stmt.join(CompanyProcess, CompanyProcess.company_id == Company.id)
            .join(ProcessType, ProcessType.id == CompanyProcess.process_type_id)
            .where(CompanyProcess.available.is_(True))
            .where(ProcessType.code.in_(filters.chemistries))
            .group_by(Company.id)
            .having(func.count(distinct(ProcessType.code)) == len(filters.chemistries))
        )

    return stmt


def get_location_stats(
    db: Session,
    level: LocationLevel,
    limit: int,
    *,
    filters: CompanyFilters | None = None,
) -> dict[str, Any]:
    """
    Raw SQL sketch:

    - country/state/city:
      SELECT <col> AS key, COUNT(*) AS count
      FROM companies
      WHERE <col> IS NOT NULL AND <col> <> ''
      GROUP BY <col>
      ORDER BY count DESC
      LIMIT :limit
    """

    filters = filters or CompanyFilters()
    company_ids = _company_ids_select(filters)

    limit = max(1, min(limit, 10_000))
    if level == "point":
        stmt = select(Company.id, Company.location, Company.city, Company.state, Company.country, Company.lat, Company.lon).where(
            Company.lat.is_not(None),
            Company.lon.is_not(None),
        )
        if company_ids is not None:
            stmt = stmt.where(Company.id.in_(company_ids))
        rows = db.execute(stmt.limit(limit)).all()

        features = []
        for _id, location, city, state, country, lat, lon in rows:
            label_parts = [p for p in [location, city, state, country] if p]
            key = ", ".join(label_parts) if label_parts else f"company:{_id}"
            features.append(
                {
                    "type": "Feature",
                    "properties": {"key": key, "count": 1, "company_id": _id},
                    "geometry": {"type": "Point", "coordinates": [float(lon), float(lat)]},
                }
            )
        return {"type": "FeatureCollection", "features": features}

    col = {"country": Company.country, "state": Company.state, "city": Company.city}[level]

    stmt: Select = (
        select(col.label("key"), func.count(Company.id).label("count"))
        .where(col.is_not(None), col != "")
        .group_by(col)
        .order_by(func.count(Company.id).desc())
        .limit(limit)
    )
    if company_ids is not None:
        stmt = stmt.where(Company.id.in_(company_ids))
    rows = db.execute(stmt).all()
    return [{"key": key, "count": int(count), "geometry": None} for key, count in rows]


def get_chemistry_stats(
    db: Session,
    limit: int,
    *,
    filters: CompanyFilters | None = None,
) -> list[dict[str, Any]]:
    """
    Raw SQL sketch:
      SELECT pt.code AS chemistry, COUNT(DISTINCT cp.company_id) AS company_count
      FROM company_processes cp
      JOIN process_types pt ON pt.id = cp.process_type_id
      WHERE cp.available = 1
      GROUP BY pt.code
      ORDER BY company_count DESC
      LIMIT :limit
    """

    filters = filters or CompanyFilters()
    company_ids = _company_ids_select(filters)

    limit = max(1, min(limit, 10_000))
    stmt = (
        select(ProcessType.code.label("chemistry"), func.count(distinct(CompanyProcess.company_id)).label("company_count"))
        .join(CompanyProcess, CompanyProcess.process_type_id == ProcessType.id)
        .where(CompanyProcess.available.is_(True))
        .where(True)
        .group_by(ProcessType.code)
        .order_by(func.count(distinct(CompanyProcess.company_id)).desc())
        .limit(limit)
    )
    if company_ids is not None:
        stmt = stmt.where(CompanyProcess.company_id.in_(company_ids))
    rows = db.execute(stmt).all()
    return [{"chemistry": chemistry, "company_count": int(company_count)} for chemistry, company_count in rows]


def get_product_stats(
    db: Session,
    by: ProductsBy,
    limit: int,
    *,
    filters: CompanyFilters | None = None,
) -> list[dict[str, Any]]:
    filters = filters or CompanyFilters()
    company_ids = _company_ids_select(filters)

    limit = max(1, min(limit, 10_000))

    if by == "company":
        """
        Raw SQL sketch:
          SELECT c.id, c.name, COUNT(p.id) AS product_count
          FROM companies c
          JOIN company_products p ON p.company_id = c.id
          GROUP BY c.id, c.name
          ORDER BY product_count DESC
          LIMIT :limit
        """

        stmt = (
            select(
                Company.id.label("company_id"),
                Company.name.label("company_name"),
                func.count(CompanyProduct.id).label("product_count"),
            )
            .join(CompanyProduct, CompanyProduct.company_id == Company.id)
            .where(True)
            .group_by(Company.id, Company.name)
            .order_by(func.count(CompanyProduct.id).desc())
            .limit(limit)
        )
        if company_ids is not None:
            stmt = stmt.where(Company.id.in_(company_ids))
        rows = db.execute(stmt).all()
        return [
            {"company_id": int(company_id), "company_name": company_name, "product_count": int(product_count)}
            for company_id, company_name, product_count in rows
        ]

    # by == "global"
    """
    Raw SQL sketch:
      SELECT product_type, COUNT(*) AS count
      FROM company_products
      WHERE product_type IS NOT NULL AND product_type <> ''
      GROUP BY product_type
      ORDER BY count DESC
      LIMIT :limit
    """

    stmt = (
        select(CompanyProduct.product_type.label("product_type"), func.count(CompanyProduct.id).label("count"))
        .where(CompanyProduct.product_type.is_not(None), CompanyProduct.product_type != "")
        .where(True)
        .group_by(CompanyProduct.product_type)
        .order_by(func.count(CompanyProduct.id).desc())
        .limit(limit)
    )
    if company_ids is not None:
        stmt = stmt.where(CompanyProduct.company_id.in_(company_ids))
    rows = db.execute(stmt).all()
    return [{"product_type": product_type, "count": int(count)} for product_type, count in rows]


