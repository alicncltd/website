"""Lightweight dotenv loader used when python-dotenv isn't available.

This file intentionally provides a minimal `load_dotenv` implementation
for offline or test environments while preserving support for a real
`.env` file in the workspace root. It reads KEY=VALUE lines and sets
them on `os.environ`.
"""

import os
from pathlib import Path
from typing import Optional


def load_dotenv(path: Optional[str] = None) -> bool:
    """Load environment variables from a file.

    If `path` is None, attempts to use a `.env` file in the current
    working directory or the repository root. Returns True if any
    variables were loaded.
    """

    candidates = []

    if path:
        candidates.append(Path(path))
    else:
        candidates.append(Path(".env"))
        # Also try workspace root (one level up if this file is in repo root)
        candidates.append(Path(__file__).resolve().parents[0] / ".env")

    loaded = False

    for p in candidates:
        try:
            if not p or not p.exists():
                continue

            with p.open("r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#"):
                        continue
                    if "=" not in line:
                        continue
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    if key:
                        os.environ.setdefault(key, val)
                        loaded = True
            if loaded:
                return True
        except Exception:
            continue

    return loaded
