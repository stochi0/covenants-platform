from __future__ import annotations

"""
Optional batch helper to fill missing companies.lat/lon.

Per plan.md: do NOT geocode inside request handlers. If you want this, implement it
as an explicit script that runs offline and writes back to the DB.

This script is intentionally a stub (no network calls). Wire your provider of choice
here if/when needed.
"""

from sqlalchemy import select

from app.db import SessionLocal
from app.models import Company


def main() -> None:
    with SessionLocal() as db:
        rows = db.execute(select(Company).where(Company.lat.is_(None) | Company.lon.is_(None))).scalars().all()
        print(f"Found {len(rows)} companies with missing lat/lon.")
        for c in rows[:10]:
            print(f"- id={c.id} name={c.name!r} location={c.location!r} city={c.city!r} country={c.country!r}")

    print("No geocoding performed (stub).")


if __name__ == "__main__":
    main()


