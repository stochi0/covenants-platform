from __future__ import annotations

import os


def get_database_url() -> str:
    """
    Single source of truth for DB config.

    To switch to Supabase/Postgres, set for example:
      DATABASE_URL="postgresql+psycopg://user:pass@host:5432/dbname"
    """

    return os.getenv("DATABASE_URL", "sqlite:///./data.db")


