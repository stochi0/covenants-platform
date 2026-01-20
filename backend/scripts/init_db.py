from __future__ import annotations

import argparse

from app.db import SessionLocal, engine
from app.models import Base
from app.seed import seed_dummy_data


def main() -> None:
    parser = argparse.ArgumentParser(description="Create DB tables and seed dummy data.")
    parser.add_argument("--drop", action="store_true", help="Drop all tables before creating them.")
    parser.add_argument("--no-seed", action="store_true", help="Create tables only; do not seed dummy data.")
    args = parser.parse_args()

    if args.drop:
        Base.metadata.drop_all(bind=engine)

    Base.metadata.create_all(bind=engine)

    if not args.no_seed:
        with SessionLocal() as db:
            seed_dummy_data(db)

    print("Done.")


if __name__ == "__main__":
    main()


