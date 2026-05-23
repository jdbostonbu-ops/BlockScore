from pathlib import Path
import sqlite3

DB_PATH = Path(__file__).parent / "nyc_311_2023.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def fetch_all(query: str, params: tuple = ()):
    with get_connection() as conn:
        rows = conn.execute(query, params).fetchall()
        return [dict(row) for row in rows]

def fetch_one(query: str, params: tuple = ()):
    with get_connection() as conn:
        row = conn.execute(query, params).fetchone()
        return dict(row) if row else None
